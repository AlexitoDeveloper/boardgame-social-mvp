/**
 * scripts/fix-corrupted-titles.cjs
 *
 * One-off script to sanitize and decode any HTML entities (&#039;, &amp;, &quot;)
 * and escape backslashes (\', \", \&#039;) currently stored in the Supabase games table.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function sanitizeGameText(text) {
  if (!text) return text;
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
  return cleaned;
}

async function fixTitles() {
  console.log('--- Fetching games with HTML entities or escape slashes in titles ---');
  
  // Fetch games where title or title_es contains &# or \
  const { data: games, error } = await supabase
    .from('games')
    .select('bgg_id, title, title_es, publisher, es_publisher')
    .or('title.ilike.%&#%,title_es.ilike.%&#%,title.ilike.%\\\\%,title_es.ilike.%\\\\%')
    .limit(1000);

  if (error) {
    console.error('Query error:', error.message);
    return;
  }

  console.log(`Found ${games.length} games to inspect/clean.`);

  let updated = 0;
  for (const g of games) {
    const cleanTitle = sanitizeGameText(g.title);
    const cleanTitleEs = g.title_es ? sanitizeGameText(g.title_es) : null;
    const cleanPublisher = g.publisher ? sanitizeGameText(g.publisher) : null;
    const cleanEsPublisher = g.es_publisher ? sanitizeGameText(g.es_publisher) : null;

    const hasTitleChanged = cleanTitle !== g.title;
    const hasTitleEsChanged = cleanTitleEs !== g.title_es;
    const hasPublisherChanged = cleanPublisher !== g.publisher;
    const hasEsPublisherChanged = cleanEsPublisher !== g.es_publisher;

    if (hasTitleChanged || hasTitleEsChanged || hasPublisherChanged || hasEsPublisherChanged) {
      const payload = {};
      if (hasTitleChanged) payload.title = cleanTitle;
      if (hasTitleEsChanged) payload.title_es = cleanTitleEs;
      if (hasPublisherChanged) payload.publisher = cleanPublisher;
      if (hasEsPublisherChanged) payload.es_publisher = cleanEsPublisher;

      console.log(`[BGG ID ${g.bgg_id}] Fixing:`);
      if (hasTitleChanged) console.log(`  title: "${g.title}" -> "${cleanTitle}"`);
      if (hasTitleEsChanged) console.log(`  title_es: "${g.title_es}" -> "${cleanTitleEs}"`);

      const { error: upErr } = await supabase
        .from('games')
        .update(payload)
        .eq('bgg_id', g.bgg_id);

      if (upErr) {
        console.error(`  Error updating BGG ID ${g.bgg_id}:`, upErr.message);
      } else {
        updated++;
      }
    }
  }

  console.log(`\nSuccessfully sanitized ${updated} games in database!`);
}

fixTitles().catch(console.error);
