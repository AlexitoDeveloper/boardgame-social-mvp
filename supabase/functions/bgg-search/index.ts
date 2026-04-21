// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GameCacheItem = {
  bgg_id: number;
  title: string;
  year: number | null;
  image_url: string | null;
};

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function safeParseXml(xmlText: string): Document {
  const document = new DOMParser().parseFromString(xmlText, "application/xml");
  if (!document) {
    throw new Error("Failed to parse XML response from BoardGameGeek.");
  }
  return document;
}

function parseSearchIds(xmlText: string): number[] {
  const xmlDocument = safeParseXml(xmlText);
  const nodes = xmlDocument.querySelectorAll("item[id]");
  const ids = Array.from(nodes)
    .map((node) => Number(node.getAttribute("id")))
    .filter((id) => Number.isFinite(id));

  return [...new Set(ids)];
}

function parseThingResponse(xmlText: string): GameCacheItem[] {
  const xmlDocument = safeParseXml(xmlText);
  const itemNodes = xmlDocument.querySelectorAll("item[id]");

  return Array.from(itemNodes)
    .map((itemNode) => {
      const bggId = Number(itemNode.getAttribute("id"));
      if (!Number.isFinite(bggId)) return null;

      const nameNode =
        itemNode.querySelector('name[type="primary"]') ??
        itemNode.querySelector("name");
      const title = nameNode?.getAttribute("value")?.trim() ?? "";
      if (!title) return null;

      const yearValue = itemNode
        .querySelector("yearpublished")
        ?.getAttribute("value");
      const parsedYear = Number(yearValue);
      const year = Number.isFinite(parsedYear) ? parsedYear : null;

      const imageUrl =
        itemNode.querySelector("image")?.textContent?.trim() || null;

      return {
        bgg_id: bggId,
        title,
        year,
        image_url: imageUrl,
      } as GameCacheItem;
    })
    .filter((item): item is GameCacheItem => item !== null);
}

async function fetchBggSearchIds(query: string): Promise<number[]> {
  const url = new URL("https://boardgamegeek.com/xmlapi2/search");
  url.searchParams.set("query", query);
  url.searchParams.set("type", "boardgame");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/xml" },
  });

  if (!response.ok) {
    throw new Error(`BGG search request failed with status ${response.status}.`);
  }

  const xmlText = await response.text();
  return parseSearchIds(xmlText).slice(0, 20);
}

async function fetchBggGames(ids: number[]): Promise<GameCacheItem[]> {
  if (ids.length === 0) return [];

  const url = new URL("https://boardgamegeek.com/xmlapi2/thing");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("stats", "0");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/xml" },
  });

  if (!response.ok) {
    throw new Error(`BGG details request failed with status ${response.status}.`);
  }

  const xmlText = await response.text();
  return parseThingResponse(xmlText);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { search } = await request.json();
    const normalizedSearch = String(search ?? "").trim();

    if (normalizedSearch.length < 2) {
      return new Response(
        JSON.stringify({
          error: "Search term must contain at least 2 characters.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ids = await fetchBggSearchIds(normalizedSearch);
    const games = await fetchBggGames(ids);

    const supabase = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );

    if (games.length > 0) {
      const { error: upsertError } = await supabase
        .from("games_cache")
        .upsert(games, { onConflict: "bgg_id" });

      if (upsertError) {
        throw new Error(`Failed to upsert games cache: ${upsertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        query: normalizedSearch,
        count: games.length,
        games,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
