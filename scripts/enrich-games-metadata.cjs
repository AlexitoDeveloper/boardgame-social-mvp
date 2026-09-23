const { createClient } = require('@supabase/supabase-js');
const { XMLParser } = require('fast-xml-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

// Constants
const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';
const DEFAULT_BATCH_SIZE = 20; // Maximum recommended IDs per BGG thing request
const DEFAULT_LIMIT = 100;
const RATE_LIMIT_DELAY_MS = 2000; // 2-second pause per batch to respect BGG API limits
const RETRY_DELAY_MS = 4000;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeGameText(text) {
  if (!text) return null;
  const cleaned = String(text)
    .replace(/\\+(['"])/g, '$1')
    .replace(/\\+&/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return cleaned || null;
}

/**
 * Fetch a batch of game IDs from BoardGameGeek XML API2 with stats=1
 */
async function fetchBggBatch(ids) {
  const url = `${BGG_API_BASE}/thing?id=${ids.join(',')}&stats=1`;
  const bggToken = process.env.BGG_API_KEY;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const headers = {
        Accept: 'application/xml',
        'User-Agent': 'LudiClub/1.0 (Contact: admin@example.com)'
      };

      if (bggToken) {
        headers['Authorization'] = `Bearer ${bggToken}`;
      }

      const response = await fetch(url, { headers });

      if (response.status === 202) {
        console.log(`  ⏳ [BGG] Received 202 (Processing queue). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      if (response.status === 429) {
        console.warn(`  ⚠️ [BGG] Rate limited (429). Retrying in ${(RETRY_DELAY_MS * 2) / 1000}s...`);
        await sleep(RETRY_DELAY_MS * 2);
        continue;
      }

      if (!response.ok) {
        throw new Error(`BGG API returned status ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      console.warn(`  ⚠️ [BGG] Attempt ${attempt}/${MAX_RETRIES} failed for IDs [${ids.slice(0, 3).join(',')}...]: ${err.message}`);
      if (attempt === MAX_RETRIES) throw err;
      await sleep(2000 * attempt);
    }
  }
}

/**
 * Parse metadata fields from an individual BGG XML item
 */
function parseBggItem(item) {
  const bggId = Number(item['@_id']);

  // Extract primary title for logging
  let names = item.name;
  if (!Array.isArray(names)) names = names ? [names] : [];
  const primaryNameObj = names.find((n) => n?.['@_type'] === 'primary') || names[0];
  const title = sanitizeGameText(primaryNameObj?.['@_value']) || `Game ${bggId}`;

  // Basic player counts & times
  const minPlayers = Number(item.minplayers?.['@_value']) || null;
  const maxPlayers = Number(item.maxplayers?.['@_value']) || null;
  const playingTime = Number(item.playingtime?.['@_value']) || null;
  const minPlayTime = Number(item.minplaytime?.['@_value']) || null;
  const maxPlayTime = Number(item.maxplaytime?.['@_value']) || null;
  const minAge = Number(item.minage?.['@_value']) || null;

  // Ratings & complexity stats
  const stats = item.statistics?.ratings;
  const rawWeight = stats?.averageweight?.['@_value'] ? Number(stats.averageweight['@_value']) : null;
  // BGG averageweight of 0 or NaN indicates unrated complexity
  const complexity = rawWeight && rawWeight > 0 ? Number(rawWeight.toFixed(2)) : null;

  const ratingGeek = stats?.bayesaverage?.['@_value'] ? Number(Number(stats.bayesaverage['@_value']).toFixed(2)) : null;
  const ratingAverage = stats?.average?.['@_value'] ? Number(Number(stats.average['@_value']).toFixed(2)) : null;

  // BGG overall rank
  let bggRank = null;
  if (stats?.ranks?.rank) {
    let ranksList = stats.ranks.rank;
    if (!Array.isArray(ranksList)) ranksList = [ranksList];
    const bgRankObj = ranksList.find((r) => r?.['@_name'] === 'boardgame');
    const rankVal = bgRankObj?.['@_value'];
    if (rankVal && rankVal !== 'Not Ranked') {
      const parsedRank = Number(rankVal);
      if (!isNaN(parsedRank)) bggRank = parsedRank;
    }
  }

  // Categories and mechanics links
  let links = item.link;
  if (!links) links = [];
  else if (!Array.isArray(links)) links = [links];

  const categories = links
    .filter((l) => l['@_type'] === 'boardgamecategory' && l['@_value'])
    .map((l) => sanitizeGameText(l['@_value']))
    .filter(Boolean);

  const mechanics = links
    .filter((l) => l['@_type'] === 'boardgamemechanic' && l['@_value'])
    .map((l) => sanitizeGameText(l['@_value']))
    .filter(Boolean);

  return {
    bggId,
    title,
    minPlayers,
    maxPlayers,
    playingTime,
    minPlayTime,
    maxPlayTime,
    minAge,
    complexity,
    rawWeight,
    ratingGeek,
    ratingAverage,
    bggRank,
    categories,
    mechanics
  };
}

/**
 * Main enrichment process
 */
async function run() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   LudiClub - Games Metadata Enrichment Utility             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Parse CLI flags
  const args = process.argv.slice(2);
  let limit = DEFAULT_LIMIT;
  let batchSize = DEFAULT_BATCH_SIZE;
  let dryRun = false;
  let targetBggId = null;
  let processAll = false;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--all') {
      processAll = true;
    } else if (arg.startsWith('--batch-size=')) {
      batchSize = Math.min(Math.max(parseInt(arg.split('=')[1], 10), 1), 20);
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--bgg-id=')) {
      targetBggId = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/enrich-games-metadata.cjs [options]

Options:
  --limit=N         Number of games to enrich (default: ${DEFAULT_LIMIT})
  --all             Enrich all missing games (paginated in batches)
  --batch-size=N    BGG request batch size (1-20, default: ${DEFAULT_BATCH_SIZE})
  --bgg-id=ID       Enrich a single specific BGG game ID
  --dry-run         Fetch & parse from BGG without modifying the database
  --help, -h        Show this help message
`);
      process.exit(0);
    }
  }

  // 1. Audit existing columns on public.games to ensure safe updates
  const { data: sampleRow, error: sampleError } = await supabase
    .from('games')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('❌ Error inspecting games table schema:', sampleError.message);
    process.exit(1);
  }

  const existingColumns = new Set(sampleRow && sampleRow[0] ? Object.keys(sampleRow[0]) : []);
  console.log(`📋 Detected ${existingColumns.size} columns in public.games.`);

  // 2. Audit total games missing complexity or min_players
  const { count: missingAuditCount, error: countError } = await supabase
    .from('games')
    .select('bgg_id', { count: 'exact', head: true })
    .or('complexity.is.null,min_players.is.null');

  if (countError) {
    console.error('❌ Error counting missing games:', countError.message);
    process.exit(1);
  }

  const { count: totalGamesCount } = await supabase
    .from('games')
    .select('bgg_id', { count: 'exact', head: true });

  console.log(`📊 Catalog Audit:`);
  console.log(`   Total games in database:          ${totalGamesCount || 0}`);
  console.log(`   Games missing metadata:          ${missingAuditCount || 0}`);
  console.log(`   Mode:                             ${dryRun ? 'DRY RUN (no DB writes)' : 'LIVE UPDATE'}`);
  console.log(`   Batch size:                       ${batchSize} games / BGG request`);
  console.log(`   Rate limit delay:                 ${RATE_LIMIT_DELAY_MS / 1000}s between batches\n`);

  if (missingAuditCount === 0 && !targetBggId) {
    console.log('🎉 All games in the database have complete metadata! Nothing to enrich.');
    return;
  }

  // 3. Query candidate games to enrich
  let gamesToEnrich = [];

  if (targetBggId) {
    console.log(`🎯 Targeting specific BGG ID: ${targetBggId}`);
    const { data, error } = await supabase
      .from('games')
      .select('bgg_id, title, complexity, min_players, max_players, playing_time')
      .eq('bgg_id', targetBggId);

    if (error) {
      console.error(`❌ Error finding game ${targetBggId}:`, error.message);
      process.exit(1);
    }
    gamesToEnrich = data || [];
    if (gamesToEnrich.length === 0) {
      console.error(`❌ Game with BGG ID ${targetBggId} not found in database.`);
      process.exit(1);
    }
  } else {
    const fetchLimit = processAll ? missingAuditCount : limit;
    console.log(`🔍 Fetching up to ${fetchLimit} games needing metadata (ordered by BGG rank)...`);

    // Prioritize popular games (with rank) first, then unranked
    const { data, error } = await supabase
      .from('games')
      .select('bgg_id, title, complexity, min_players, max_players, playing_time')
      .or('complexity.is.null,min_players.is.null')
      .order('bgg_rank', { ascending: true, nullsFirst: false })
      .limit(fetchLimit);

    if (error) {
      console.error('❌ Error querying games needing enrichment:', error.message);
      process.exit(1);
    }

    gamesToEnrich = data || [];
  }

  console.log(`🚀 Ready to enrich ${gamesToEnrich.length} games in batches of ${batchSize}.\n`);

  // 4. Process in batches with 2-second rate limiting
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalUnratedComplexity = 0;
  let totalErrors = 0;

  for (let i = 0; i < gamesToEnrich.length; i += batchSize) {
    const batch = gamesToEnrich.slice(i, i + batchSize);
    const batchIds = batch.map((g) => g.bgg_id);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(gamesToEnrich.length / batchSize);

    console.log(`--- [Batch ${batchNum}/${totalBatches}] Fetching ${batch.length} games (IDs: ${batchIds.slice(0, 5).join(', ')}${batchIds.length > 5 ? '...' : ''}) ---`);

    let xmlText;
    try {
      xmlText = await fetchBggBatch(batchIds);
    } catch (err) {
      console.error(`  ❌ Failed to fetch batch ${batchNum}: ${err.message}`);
      totalErrors += batch.length;
      totalProcessed += batch.length;
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    // Parse XML
    let parsedItems = [];
    try {
      const parsedXml = xmlParser.parse(xmlText);
      let items = parsedXml.items?.item;
      if (!items) {
        console.warn(`  ⚠️ No items returned from BGG for this batch.`);
      } else {
        if (!Array.isArray(items)) items = [items];
        parsedItems = items.map(parseBggItem);
      }
    } catch (err) {
      console.error(`  ❌ Failed to parse XML response for batch ${batchNum}: ${err.message}`);
      totalErrors += batch.length;
      totalProcessed += batch.length;
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    // Map parsed data by bggId
    const itemMap = new Map();
    for (const item of parsedItems) {
      itemMap.set(item.bggId, item);
    }

    // Update each game in DB
    for (const game of batch) {
      totalProcessed++;
      const metadata = itemMap.get(game.bgg_id);

      if (!metadata) {
        console.warn(`  ⚠️ Game ${game.bgg_id} ("${game.title}") not returned in BGG XML response.`);
        totalErrors++;
        continue;
      }

      if (metadata.complexity === null) {
        totalUnratedComplexity++;
      }

      // Build payload including only columns that exist in the database schema
      const updatePayload = {};
      if (existingColumns.has('complexity')) updatePayload.complexity = metadata.complexity;
      if (existingColumns.has('min_players')) updatePayload.min_players = metadata.minPlayers;
      if (existingColumns.has('max_players')) updatePayload.max_players = metadata.maxPlayers;
      if (existingColumns.has('playing_time')) updatePayload.playing_time = metadata.playingTime;
      if (existingColumns.has('rating_geek') && metadata.ratingGeek !== null) updatePayload.rating_geek = metadata.ratingGeek;
      if (existingColumns.has('rating_average') && metadata.ratingAverage !== null) updatePayload.rating_average = metadata.ratingAverage;
      if (existingColumns.has('bgg_rank') && metadata.bggRank !== null) updatePayload.bgg_rank = metadata.bggRank;
      if (existingColumns.has('min_play_time')) updatePayload.min_play_time = metadata.minPlayTime;
      if (existingColumns.has('max_play_time')) updatePayload.max_play_time = metadata.maxPlayTime;
      if (existingColumns.has('min_age')) updatePayload.min_age = metadata.minAge;
      if (existingColumns.has('categories')) updatePayload.categories = metadata.categories;
      if (existingColumns.has('mechanics')) updatePayload.mechanics = metadata.mechanics;

      const playerStr = metadata.minPlayers && metadata.maxPlayers
        ? `${metadata.minPlayers}-${metadata.maxPlayers}p`
        : (metadata.minPlayers ? `${metadata.minPlayers}+p` : 'N/A players');
      const timeStr = metadata.playingTime ? `${metadata.playingTime}m` : 'N/A time';
      const weightStr = metadata.complexity !== null ? `weight: ${metadata.complexity}/5` : 'weight: unrated';

      if (dryRun) {
        console.log(`  [DRY RUN] ${metadata.title} (ID: ${metadata.bggId}) -> ${playerStr}, ${timeStr}, ${weightStr}`);
        totalUpdated++;
      } else {
        const { error: updateError } = await supabase
          .from('games')
          .update(updatePayload)
          .eq('bgg_id', metadata.bggId);

        if (updateError) {
          console.error(`  ❌ Failed to update ${metadata.title} (ID: ${metadata.bggId}): ${updateError.message}`);
          totalErrors++;
        } else {
          console.log(`  ✅ Updated ${metadata.title} (ID: ${metadata.bggId}) -> ${playerStr}, ${timeStr}, ${weightStr}`);
          totalUpdated++;
        }
      }
    }

    // Rate limiting: 2-second pause between BGG API batches
    if (i + batchSize < gamesToEnrich.length) {
      console.log(`  ⏸️ Pausing ${RATE_LIMIT_DELAY_MS / 1000}s to respect BGG rate limits...\n`);
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // 5. Final Summary Audit
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Enrichment Summary                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Processed in this run:     ${totalProcessed}`);
  console.log(`  Successfully enriched:     ${totalUpdated}`);
  console.log(`  Unrated complexity:        ${totalUnratedComplexity}`);
  console.log(`  Errors:                    ${totalErrors}`);

  if (!dryRun) {
    const { count: remainingMissing } = await supabase
      .from('games')
      .select('bgg_id', { count: 'exact', head: true })
      .or('complexity.is.null,min_players.is.null');

    console.log(`  Remaining missing in DB:   ${remainingMissing || 0}`);
    if (remainingMissing > 0) {
      const estRuns = Math.ceil(remainingMissing / limit);
      console.log(`  ℹ️ Run again or use --all to continue enriching (approx ${estRuns} run(s) left at --limit=${limit}).`);
    } else {
      console.log('  🎉 All catalog games are fully enriched!');
    }
  }
}

run().catch((err) => {
  console.error('💥 Fatal script error:', err);
  process.exit(1);
});
