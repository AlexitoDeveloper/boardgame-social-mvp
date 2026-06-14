// Supabase Edge Function for BoardGameGeek Catalog Ingestion
// written for Deno runtime.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.4";
import { Jimp } from "npm:jimp@1.6.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to identify generic Spanish or foreign version titles
 */
function isGenericEditionName(name: string): boolean {
  if (!name) return true;
  const normalized = name.toLowerCase().trim();
  const genericPatterns = [
    /^(spanish|english|french|german|italian|portuguese|polish|russian|dutch|japanese|chinese|korean|multilingual)\s+edition(\s+\d{4})?$/i,
    /^(spanish|english|french|german|italian|portuguese|polish|russian|dutch|japanese|chinese|korean|multilingual)\s+version(\s+\d{4})?$/i,
    /^edici[oó]n\s+en\s+espa[ñn]ol(\s+\d{4})?$/i,
    /^edici[oó]n\s+espa[ñn]ola(\s+\d{4})?$/i,
    /^versió[oó]n\s+en\s+espa[ñn]ol(\s+\d{4})?$/i,
    /^versió[oó]n\s+espa[ñn]ola(\s+\d{4})?$/i,
    /^multilingual\s+edition(\s+\d{4})?$/i,
    /^first\s+edition$/i,
    /^second\s+edition$/i,
    /^third\s+edition$/i,
    /^limited\s+edition$/i,
    /^deluxe\s+edition$/i,
    /^collector's\s+edition$/i,
    /^retail\s+edition$/i,
    /^kickstarter\s+edition$/i,
    /^standard\s+edition$/i
  ];
  return genericPatterns.some(pattern => pattern.test(normalized));
}

async function fetchBggBatch(ids: number[], bggToken?: string): Promise<string> {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(",")}&versions=1`;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[BGG] Fetching details for IDs: ${ids.join(", ")} (Attempt ${attempt}/${maxRetries})...`);
    
    try {
      const headers: Record<string, string> = {
        "Accept": "application/xml",
        "User-Agent": "BoardGameSocialMVP/1.0 (Contact: admin@example.com)"
      };
      
      if (bggToken) {
        headers["Authorization"] = `Bearer ${bggToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (response.status === 202) {
        console.log("[BGG] Returned 202 (Processing). Retrying in 4 seconds...");
        await sleep(4000);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`BGG API returned status ${response.status}`);
      }
      
      return await response.text();
    } catch (err: any) {
      console.warn(`[BGG] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await sleep(2000);
    }
  }
  throw new Error("Failed to fetch from BGG due to retry exhaustion");
}

async function processAndUploadImage(supabase: any, bggId: number, imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  
  try {
    console.log(`[Storage] Downloading cover for game ${bggId} from: ${imageUrl}...`);
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download image: status ${imgResponse.status}`);
    }
    
    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    console.log(`[Jimp] Processing/optimizing image for game ${bggId}...`);
    const image = await Jimp.read(buffer);
    
    if (image.width > 600) {
      image.resize({ w: 600 });
      console.log(`[Jimp] Resized image to 600px width.`);
    }
    
    const optimizedBuffer = await image.getBuffer("image/jpeg");
    const fileName = `covers/${bggId}.jpg`;
    
    console.log(`[Storage] Uploading optimized image ${fileName} to bucket 'game-covers'...`);
    const { error } = await supabase.storage
      .from("game-covers")
      .upload(fileName, optimizedBuffer, {
        contentType: "image/jpeg",
        upsert: true
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from("game-covers")
      .getPublicUrl(fileName);
      
    console.log(`[Storage] Upload complete. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err: any) {
    console.error(`[Storage Error] Could not process/upload image for game ${bggId}:`, err.message);
    return imageUrl;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Admin client using internal environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const bggToken = Deno.env.get("BGG_API_KEY");

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing Supabase internal environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // 2. Parse action and parameters from request body
    let action = null;
    let query = "";
    let bggIds: number[] = [];
    let limit = 10;

    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body) {
          action = body.action || null;
          query = body.query || "";
          if (Array.isArray(body.bggIds)) {
            bggIds = body.bggIds.map(Number).filter((n) => !isNaN(n));
          } else if (typeof body.bggId === "number") {
            bggIds = [body.bggId];
          }
          if (typeof body.limit === "number") {
            limit = Math.min(Math.max(body.limit, 1), 30); // clamp between 1 and 30
          }
        }
      } catch (err: any) {
        console.warn("Failed to parse POST body JSON:", err.message);
      }
    }

    // Handle Search Action
    if (action === "search") {
      if (!query.trim()) {
        return new Response(JSON.stringify({ error: "Missing query parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log(`[BGG Search] Searching for query: "${query}"...`);
      const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame,boardgameexpansion`;

      const searchHeaders: Record<string, string> = {
        "Accept": "application/xml",
        "User-Agent": "BoardGameSocialMVP/1.0 (Contact: admin@example.com)"
      };
      if (bggToken) {
        searchHeaders["Authorization"] = `Bearer ${bggToken}`;
      }

      const searchResponse = await fetch(searchUrl, { headers: searchHeaders });
      if (!searchResponse.ok) {
        throw new Error(`BGG Search API returned status ${searchResponse.status}`);
      }

      const searchXmlText = await searchResponse.text();
      const searchJsonObj = xmlParser.parse(searchXmlText);
      let searchItems = searchJsonObj.items?.item;

      if (!searchItems) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (!Array.isArray(searchItems)) {
        searchItems = [searchItems];
      }

      const searchResults = searchItems.map((item: any) => {
        const bggId = Number(item["@_id"]);
        const isExpansion = item["@_type"] === "boardgameexpansion";

        let title = "Juego Desconocido";
        if (item.name) {
          if (Array.isArray(item.name)) {
            const primaryName = item.name.find((n: any) => n?.["@_type"] === "primary") || item.name[0];
            title = primaryName?.["@_value"] || "Juego Desconocido";
          } else {
            title = item.name["@_value"] || "Juego Desconocido";
          }
        }

        const yearPublished = Number(item.yearpublished?.["@_value"]) || null;

        return {
          bgg_id: bggId,
          title,
          year_published: yearPublished,
          is_expansion: isExpansion
        };
      });

      console.log(`[BGG Search] Found ${searchResults.length} results for "${query}".`);
      return new Response(JSON.stringify({ results: searchResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Handle Ingest Action
    let idsToFetch: number[] = [];

    if (action === "ingest") {
      if (bggIds.length === 0) {
        return new Response(JSON.stringify({ error: "Missing bggIds parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      idsToFetch = bggIds;
      console.log(`[On-Demand Ingest] Preparing to ingest specified IDs: ${idsToFetch.join(", ")}`);
    } else {
      console.log(`=== Starting Edge Function Ingestion Batch (Limit: ${limit}) ===`);

      // 3. Find MAX(bgg_id) in database
      const { data: maxGame, error: maxError } = await supabase
        .from("games")
        .select("bgg_id")
        .order("bgg_id", { ascending: false })
        .limit(1);

      if (maxError) {
        throw new Error(`Failed to query games table: ${maxError.message}`);
      }

      let startId = 1;
      if (maxGame && maxGame.length > 0) {
        startId = maxGame[0].bgg_id + 1;
        console.log(`[DB] Current MAX bgg_id: ${maxGame[0].bgg_id}. Starting from: ${startId}`);
      } else {
        console.log("[DB] Table is empty. Starting from ID: 1");
      }

      // 4. Prepare batch of IDs
      idsToFetch = Array.from({ length: limit }, (_, i) => startId + i);
    }

    // 5. Fetch XML from BGG
    const xmlText = await fetchBggBatch(idsToFetch, bggToken);

    // 6. Parse XML
    const jsonObj = xmlParser.parse(xmlText);
    let xmlItems = jsonObj.items?.item;

    if (!xmlItems) {
      console.log("[Parser] No items returned in this batch.");
      return new Response(JSON.stringify({ success: true, processed: 0, reason: "No items returned from BGG" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!Array.isArray(xmlItems)) {
      xmlItems = [xmlItems];
    }

    console.log(`[Parser] Parsed ${xmlItems.length} valid games.`);

    const results = [];

    // 7. Process each game
    for (const item of xmlItems) {
      const bggId = Number(item["@_id"]);
      
      // Parse names
      let names = item.name;
      if (!Array.isArray(names)) {
        names = [names];
      }
      const primaryNameObj = names.find((n: any) => n?.["@_type"] === "primary") || names[0];
      let title = primaryNameObj?.["@_value"] || "Juego Desconocido";

      // Parse stats
      const yearPublished = Number(item.yearpublished?.["@_value"]) || null;
      const minPlayers = Number(item.minplayers?.["@_value"]) || null;
      const maxPlayers = Number(item.maxplayers?.["@_value"]) || null;
      const playingTime = Number(item.playingtime?.["@_value"]) || null;

      // Check expansion status
      const isExpansion = item["@_type"] === "boardgameexpansion";
      let bggBaseGameId = null;
      let links = item.link;
      if (!links) {
        links = [];
      } else if (!Array.isArray(links)) {
        links = [links];
      }
      
      if (isExpansion) {
        const baseGameLink = links.find((l: any) => l["@_type"] === "boardgameexpansion" && l["@_inbound"] === "true");
        if (baseGameLink) {
          bggBaseGameId = Number(baseGameLink["@_id"]);
        }
      }

      // Default BGG image
      let bggImageUrl = item.image || item.thumbnail || null;
      let hasSpanishEdition = false;
      let esPublisher = null;

      // Extract Spanish edition version specifics
      if (item.versions && item.versions.item) {
        let versionItems = item.versions.item;
        if (!Array.isArray(versionItems)) {
          versionItems = [versionItems];
        }
        
        // Reversing versionItems to prioritize the most recent Spanish edition
        const spanishVersion = [...versionItems].reverse().find((v: any) => {
          let vLinks = v.link;
          if (!vLinks) return false;
          if (!Array.isArray(vLinks)) vLinks = [vLinks];
          return vLinks.some((l: any) => l["@_type"] === "language" && l["@_value"] === "Spanish");
        });

        if (spanishVersion) {
          hasSpanishEdition = true;
          
          // Try to extract Spanish title
          let spanishNames = spanishVersion.name;
          if (spanishNames) {
            if (!Array.isArray(spanishNames)) {
              spanishNames = [spanishNames];
            }
            const primaryEspName = spanishNames.find((n: any) => n?.["@_type"] === "primary") || spanishNames[0];
            const esTitle = primaryEspName?.["@_value"];
            if (esTitle) {
              if (!isGenericEditionName(esTitle)) {
                title = esTitle;
              }
            }
          }

          if (spanishVersion.image || spanishVersion.thumbnail) {
            bggImageUrl = spanishVersion.image || spanishVersion.thumbnail;
          }
          
          let vLinks = spanishVersion.link;
          if (!Array.isArray(vLinks)) vLinks = [vLinks];
          const publisherLink = vLinks.find((l: any) => l["@_type"] === "boardgamepublisher");
          if (publisherLink) {
            esPublisher = publisherLink["@_value"];
          }
        }
      }

      console.log(`[Parser] Processing: "${title}" (BGG ID: ${bggId}). Expansion: ${isExpansion}`);

      // Optimize and upload image
      let finalImageUrl = null;
      if (bggImageUrl) {
        finalImageUrl = await processAndUploadImage(supabase, bggId, bggImageUrl);
        await sleep(500);
      }

      // Insert into games table
      const { data: upserted, error: insertError } = await supabase
        .from("games")
        .upsert({
          bgg_id: bggId,
          title,
          year_published: yearPublished,
          image_url: finalImageUrl,
          min_players: minPlayers,
          max_players: maxPlayers,
          playing_time: playingTime,
          es_publisher: esPublisher,
          has_spanish_edition: hasSpanishEdition,
          is_expansion: isExpansion,
          bgg_base_game_id: bggBaseGameId
        }, { onConflict: "bgg_id" })
        .select("*");

      if (insertError) {
        console.error(`[DB Error] Failed to save "${title}":`, insertError.message);
      } else {
        console.log(`[DB] Saved "${title}" successfully.`);
        if (upserted && upserted.length > 0) {
          results.push(upserted[0]);
        } else {
          results.push({ bgg_id: bggId, title });
        }
      }
    }

    // 8. Post-process link base game UUIDs for expansions
    console.log("[Link] Resolving base game UUIDs...");
    const { data: expansions, error: selectExpError } = await supabase
      .from("games")
      .select("id, bgg_base_game_id")
      .eq("is_expansion", true)
      .is("base_game_id", null)
      .not("bgg_base_game_id", "is", null);

    if (!selectExpError && expansions && expansions.length > 0) {
      for (const exp of expansions) {
        const { data: baseGames } = await supabase
          .from("games")
          .select("id, title")
          .eq("bgg_id", exp.bgg_base_game_id)
          .limit(1);

        if (baseGames && baseGames.length > 0) {
          await supabase
            .from("games")
            .update({ base_game_id: baseGames[0].id })
            .eq("id", exp.id);
          console.log(`[Link] Linked expansion UUID ${exp.id} to base game "${baseGames[0].title}"`);
          
          const idx = results.findIndex((r: any) => r.id === exp.id);
          if (idx !== -1) {
            results[idx].base_game_id = baseGames[0].id;
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, games: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("[Fatal Error]:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
