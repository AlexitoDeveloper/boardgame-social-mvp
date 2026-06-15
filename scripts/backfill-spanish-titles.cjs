/**
 * scripts/backfill-spanish-titles.cjs
 *
 * Backfills title_es (Spanish title) and publisher data for games that don't
 * have it yet. Runs from your local machine (which BGG/Cloudflare allows)
 * rather than from a cloud server.
 *
 * Usage:
 *   node scripts/backfill-spanish-titles.cjs              # processes 300 games
 *   node scripts/backfill-spanish-titles.cjs --limit=100  # custom batch size
 *
 * Schedule daily with Windows Task Scheduler:
 *   Program: node
 *   Arguments: scripts/backfill-spanish-titles.cjs --limit=300
 *   Start in: C:\path\to\boardgame-social-mvp
 */

const { createClient } = require('@supabase/supabase-js');
const { XMLParser } = require('fast-xml-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });         // base vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });   // local overrides

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: () => false
});

const BGG_API = 'https://boardgamegeek.com/xmlapi2';
const GAMES_PER_REQUEST = 20;  // IDs per BGG API call
const REQUEST_DELAY_MS = 2000; // delay between BGG calls (respectful)
const RETRY_DELAY_MS = 5000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isGenericEditionName(name) {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  return (
    // Pure language/edition patterns: "Spanish edition", "Multilingual edition 2024"
    /^(spanish|english|french|german|italian|portuguese|polish|russian|dutch|japanese|chinese|korean|multilingual)\s+edition(\s+\d{4})?$/i.test(lower) ||
    /^(spanish|english|french)\s+version(\s+\d{4})?$/i.test(lower) ||
    /^edici[oó]n\s+en\s+espa[\u00f1n]ol(\s+\d{4})?$/i.test(lower) ||
    /^edici[oó]n\s+espa[\u00f1n]ola(\s+\d{4})?$/i.test(lower) ||
    /^versi[oó]n\s+espa[\u00f1n]ola(\s+\d{4})?$/i.test(lower) ||
    // Publisher-prefixed generic names: "Bisonte Spanish edition", "Asmodee multilingual edition"
    /\b(spanish|multilingual|english|french|german)\s+edition(\s+\d{4})?$/.test(lower) ||
    /\b(spanish|multilingual|english|french|german)\s+version(\s+\d{4})?$/.test(lower) ||
    // Named publisher editions: "Bisonte red edition", "Borras red edition"
    /\b(red|blue|black|white|classic|standard|retail|deluxe|collector|kickstarter|first|second|third|limited)\s+edition(\s+\d{4})?$/.test(lower) ||
    // Purely descriptive names
    /^(first|second|third|limited|deluxe|collector's|retail|kickstarter|standard)\s+edition$/i.test(lower)
  );
}

async function fetchBggBatch(bggIds) {
  const url = `${BGG_API}/thing?id=${bggIds.join(',')}&versions=1`;
  const bggToken = process.env.BGG_API_KEY;
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`  [BGG] Fetching ${bggIds.length} games (attempt ${attempt})…`);
    try {
      const headers = {
        'User-Agent': 'BoardGameSocialMVP/1.0 (Contact: admin@example.com)',
        'Accept': 'application/xml'
      };
      if (bggToken) {
        headers['Authorization'] = `Bearer ${bggToken}`;
      }
      const res = await fetch(url, { headers });
      if (res.status === 202) {
        console.log('  [BGG] 202 – retrying in 5s…');
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      if (!res.ok) throw new Error(`BGG returned ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`  [BGG] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw new Error('BGG API exhausted retries');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runBackfill(batchSize) {
  console.log(`\n=== BGG Spanish Title Backfill ===`);
  console.log(`Batch size: ${batchSize} games`);

  // 1. Fetch games with missing title_es, prioritising those with a known Spanish edition
  const { data: games, error: fetchErr } = await supabase
    .from('games')
    .select('bgg_id, title')
    .is('title_es', null)
    .order('has_spanish_edition', { ascending: false, nullsFirst: false })
    .order('bgg_id', { ascending: true })
    .limit(batchSize);

  if (fetchErr) {
    console.error('❌ DB error fetching games:', fetchErr.message);
    process.exit(1);
  }

  if (!games || games.length === 0) {
    console.log('🎉 All games already have Spanish title data. Nothing to do!');
    return;
  }

  // 2. Count remaining for progress display
  const { count: totalPending } = await supabase
    .from('games')
    .select('bgg_id', { count: 'exact', head: true })
    .is('title_es', null);

  console.log(`Found ${games.length} games to process (${totalPending} total pending)\n`);

  const bggIds = games.map(g => g.bgg_id);
  let processed = 0;
  let withSpanish = 0;
  let errors = 0;

  // 3. Process in sub-batches of GAMES_PER_REQUEST
  for (let i = 0; i < bggIds.length; i += GAMES_PER_REQUEST) {
    const chunk = bggIds.slice(i, i + GAMES_PER_REQUEST);
    const batchNum = Math.floor(i / GAMES_PER_REQUEST) + 1;
    const totalBatches = Math.ceil(bggIds.length / GAMES_PER_REQUEST);

    console.log(`[Batch ${batchNum}/${totalBatches}] IDs ${chunk[0]}…${chunk[chunk.length - 1]}`);

    let xml;
    try {
      xml = await fetchBggBatch(chunk);
    } catch (err) {
      console.error(`  ❌ BGG fetch failed: ${err.message}`);
      errors += chunk.length;
      processed += chunk.length;
      continue;
    }

    const parsed = xmlParser.parse(xml);
    let items = parsed?.items?.item;
    if (!items) {
      console.warn('  ⚠️  No items in BGG response for this batch');
      processed += chunk.length;
      continue;
    }
    if (!Array.isArray(items)) items = [items];

    for (const item of items) {
      try {
        const bggId = Number(item['@_id']);

        // Original English title
        let names = item.name;
        if (!names) { processed++; continue; }
        if (!Array.isArray(names)) names = [names];
        const primaryName = names.find(n => n?.['@_type'] === 'primary') || names[0];
        const titleEnglish = primaryName?.['@_value'];
        if (!titleEnglish) { processed++; continue; }

        // Original publisher from main game links
        let mainLinks = item.link || [];
        if (!Array.isArray(mainLinks)) mainLinks = [mainLinks];
        const origPubLink = mainLinks.find(l => l?.['@_type'] === 'boardgamepublisher');
        const publisher = origPubLink?.['@_value'] ?? null;

        // Spanish version data
        let titleEs = null;
        let esPublisher = null;
        let hasSpanishEdition = false;

        const versions = item.versions?.item;
        if (versions) {
          const versionList = Array.isArray(versions) ? versions : [versions];
          const spanishVersions = versionList.filter(v => {
            let links = v.link || [];
            if (!Array.isArray(links)) links = [links];

            return links.some(
              l => l?.['@_type'] === 'language' &&
                l?.['@_value'] === 'Spanish'
            );
          });

          const spanishVersion =
            spanishVersions.sort((a, b) =>
              Number(b.yearpublished?.['@_value'] || 0) -
              Number(a.yearpublished?.['@_value'] || 0)
            )[0];

          if (spanishVersion) {
            hasSpanishEdition = true;

            // Spanish title (title_es only — never touches title)
            const canonicalSpanishTitle =
              spanishVersion.canonicalname?.['@_value'];

            if (canonicalSpanishTitle?.trim()) {
              titleEs = canonicalSpanishTitle.trim();
              withSpanish++;
              console.log(`🇪🇸 ${titleEnglish} → ${titleEs}`);
            }
            // Spanish publisher
            let vLinks = spanishVersion.link || [];
            if (!Array.isArray(vLinks)) vLinks = [vLinks];
            const pubLink = vLinks.find(l => l?.['@_type'] === 'boardgamepublisher');
            if (pubLink) esPublisher = pubLink['@_value'] ?? null;
          }
        }

        // Update DB — title stays untouched
        const { error: updateErr } = await supabase
          .from('games')
          .update({
            title_es: titleEs,       // null if no Spanish edition (marks as "checked")
            publisher,
            es_publisher: esPublisher,
            has_spanish_edition: hasSpanishEdition
          })
          .eq('bgg_id', bggId);

        if (updateErr) {
          console.error(`  ❌ DB update failed for ${bggId}: ${updateErr.message}`);
          errors++;
        }
        processed++;
      } catch (err) {
        console.error(`  ❌ Error processing item: ${err.message}`);
        errors++;
        processed++;
      }
    }

    // Delay between BGG requests
    if (i + GAMES_PER_REQUEST < bggIds.length) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // 4. Summary
  const { count: remaining } = await supabase
    .from('games')
    .select('bgg_id', { count: 'exact', head: true })
    .is('title_es', null);

  console.log('\n=== Backfill batch complete ===');
  console.log(`  Processed:          ${processed}`);
  console.log(`  With Spanish title: ${withSpanish}`);
  console.log(`  Errors:             ${errors}`);
  console.log(`  Remaining in DB:    ${remaining ?? '?'}`);
  if (remaining > 0) {
    const daysLeft = Math.ceil(remaining / batchSize);
    console.log(`  Est. days to finish (at ${batchSize}/day): ${daysLeft}`);
  } else {
    console.log('  🎉 All games enriched!');
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const batchSize = limitArg ? Number(limitArg.split('=')[1]) : 300;

runBackfill(batchSize).catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
