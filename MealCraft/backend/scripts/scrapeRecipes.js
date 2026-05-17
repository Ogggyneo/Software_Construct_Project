/**
 * Cookpad Vietnam Recipe Scraper
 * Scrapes 500-1000 recipes and seeds them into MongoDB.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/scrapeRecipes.js
 *
 * Options (env vars):
 *   MAX_PAGES   - pages per keyword (default: 6)
 *   DELAY_MS    - ms between requests (default: 1500)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios   = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Recipe  = require('../src/models/Recipe');

const DELAY_MS  = parseInt(process.env.DELAY_MS  || '1500');
const MAX_PAGES = parseInt(process.env.MAX_PAGES  || '6');
const BASE      = 'https://cookpad.com';
const SOURCE    = 'cookpad.com';

// Keywords chosen to maximise variety across the 9 HomeScreen categories
const KEYWORDS = [
  'món ăn hàng ngày',
  'cơm trắng thịt kho',
  'canh chua cá',
  'gà kho gừng',
  'bò xào rau củ',
  'cá hấp',
  'tôm rang muối',
  'bún bò huế',
  'phở gà',
  'bánh mì',
  'xôi',
  'món chay',
  'salad',
  'súp bí đỏ',
  'lẩu thái',
  'dimsum',
  'cơm chiên dương châu',
  'bánh flan',
  'chè',
  'pizza',
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── HTTP ────────────────────────────────────────────────────────────────────
async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    return data;
  } catch (err) {
    console.warn(`  ⚠️  ${url} → ${err.message}`);
    return null;
  }
}

// ── JSON-LD extraction ───────────────────────────────────────────────────────
function extractJsonLd(html) {
  const $ = cheerio.load(html);
  let found = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found) return;
    try {
      const json = JSON.parse($(el).text());
      const items = Array.isArray(json) ? json : [json];
      found = items.find(i => i['@type'] === 'Recipe') || null;
    } catch {}
  });
  return found;
}

// ── ISO 8601 duration → minutes ─────────────────────────────────────────────
function isoDuration(str) {
  if (!str) return 0;
  const m = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
}

// ── Ingredient text → { name, quantity, unit } ───────────────────────────────
function parseIngredient(text) {
  text = text.trim();
  // e.g. "200g thịt bò", "2 muỗng canh dầu ăn", "1/2 củ hành"
  const m = text.match(
    /^([\d¼½¾⅓⅔.,\/]+)\s*(g|kg|ml|l|lít|muỗng canh|muỗng cà phê|muỗng|tbsp|tsp|cup|bó|cái|quả|trái|củ|tép|lá|miếng|lon|hộp|gói|túi)?\s*(.+)/i,
  );
  if (m) return { quantity: m[1], unit: m[2] || '', name: m[3].trim() };
  return { quantity: '', unit: '', name: text };
}

// ── Category inference ───────────────────────────────────────────────────────
function inferCategory(title, tags) {
  const t = (title + ' ' + tags.join(' ')).toLowerCase();
  if (/chay|vegetarian/.test(t))                        return 'Ăn chay';
  if (/salad|healthy|eatclean|eat clean|ít béo/.test(t)) return 'Healthy';
  if (/chè|kem|bánh ngọt|tráng miệng|pudding|flan/.test(t)) return 'Đồ ngọt';
  if (/ăn vặt|snack|bánh tráng|bắp rang/.test(t))      return 'Đồ ăn vặt';
  if (/sushi|sashimi|ramen|udon|miso|onigiri/.test(t))  return 'Nhật Bản';
  if (/kimchi|tteok|bibimbap|samgyeopsal|gogi|hàn quốc/.test(t)) return 'Hàn Quốc';
  if (/pizza|pasta|mì ý|risotto|bruschetta/.test(t))    return 'Ý';
  if (/dimsum|há cảo|sủi cảo|cha siu|trung hoa/.test(t)) return 'Trung Hoa';
  if (/pad thai|tom yum|curry thái|thái lan/.test(t))   return 'Thái Lan';
  return 'Việt Nam';
}

// ── Scrape recipe URLs from one search page ──────────────────────────────────
async function scrapeSearchPage(keyword, page) {
  const url = `${BASE}/vn/tim-kiem/${encodeURIComponent(keyword)}?page=${page}`;
  const html = await fetchHtml(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/\/vn\/cong-thuc\/\d+/.test(href)) {
      urls.add(href.startsWith('http') ? href : `${BASE}${href}`);
    }
  });
  return [...urls];
}

// ── Scrape one recipe detail page ────────────────────────────────────────────
async function scrapeRecipe(url) {
  const html = await fetchHtml(url);
  if (!html) return null;

  const data = extractJsonLd(html);
  if (!data?.name) return null;

  // Image
  let image_url = '';
  if (typeof data.image === 'string') image_url = data.image;
  else if (Array.isArray(data.image)) image_url = data.image[0];
  else if (data.image?.url) image_url = data.image.url;

  // Ingredients
  const ingredients = (data.recipeIngredient || [])
    .map(parseIngredient)
    .filter(i => i.name.length > 0);

  // Steps
  const steps = (data.recipeInstructions || []).map((s, i) => ({
    order: i + 1,
    description: typeof s === 'string' ? s : (s.text || ''),
  })).filter(s => s.description.length > 0);

  if (!ingredients.length && !steps.length) return null;

  const tags = typeof data.keywords === 'string'
    ? data.keywords.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return {
    title:        data.name.trim(),
    description:  data.description || '',
    category:     inferCategory(data.name, tags),
    cuisine:      'Việt Nam',
    image_url,
    cook_time_min:  isoDuration(data.cookTime) || isoDuration(data.totalTime) || 30,
    prep_time_min:  isoDuration(data.prepTime) || 10,
    servings:       parseInt(data.recipeYield) || 2,
    calories_per_serving: 0,
    tags,
    ingredients,
    steps,
    is_public:    true,
    is_scraped:   true,
    source_url:   url,
    scrape_source: SOURCE,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected\n');

  // Phase 1: collect all unique recipe URLs
  const allUrls = new Set();
  for (const keyword of KEYWORDS) {
    console.log(`🔍 "${keyword}"`);
    for (let page = 1; page <= MAX_PAGES; page++) {
      const urls = await scrapeSearchPage(keyword, page);
      urls.forEach(u => allUrls.add(u));
      process.stdout.write(`  page ${page}: +${urls.length} (total ${allUrls.size})\n`);
      if (urls.length === 0) break;
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n📋 Total unique URLs: ${allUrls.size}`);
  console.log('🍳 Scraping recipe details...\n');

  // Phase 2: scrape each recipe and upsert
  let inserted = 0, skipped = 0;
  let idx = 0;
  for (const url of allUrls) {
    idx++;
    process.stdout.write(`[${idx}/${allUrls.size}] `);

    const recipe = await scrapeRecipe(url);
    await sleep(DELAY_MS);

    if (!recipe) {
      console.log('⏭️  skipped');
      skipped++;
      continue;
    }

    try {
      const res = await Recipe.findOneAndUpdate(
        { source_url: url },
        { $setOnInsert: recipe },
        { upsert: true, new: false },
      );
      if (res) {
        console.log(`⟳  already exists: ${recipe.title}`);
        skipped++;
      } else {
        console.log(`✅ ${recipe.title}`);
        inserted++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done!  Inserted: ${inserted}  Skipped/errors: ${skipped}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
