/**
 * International recipe scraper — 20 unique dishes per cuisine.
 * Targets: Korean, Japanese, Italian, Thai on Cookpad Vietnam.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/scrapeIntl.js
 *
 * Each cuisine gets a dedicated country tag injected so normalizeRecipes.js
 * classifies them correctly even when the title is in Vietnamese.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios    = require('axios');
const cheerio  = require('cheerio');
const mongoose = require('mongoose');
const Recipe   = require('../src/models/Recipe');

const DELAY_MS       = parseInt(process.env.DELAY_MS        || '1500');
const MAX_PER_KEYWORD = parseInt(process.env.MAX_PER_KEYWORD || '3');
const BASE  = 'https://cookpad.com';

// 8+ dish-specific keywords per cuisine → ~24 scrape attempts → ~20 unique dishes
const CUISINES = {
  'Hàn Quốc': {
    tag: 'hàn quốc',
    keywords: [
      'kimchi', 'tokbokki', 'kimbap', 'bibimbap', 'japchae',
      'bulgogi', 'samgyeopsal', 'galbi hàn quốc', 'ramyeon hàn',
      'sundubu jjigae', 'hotteok', 'gà chiên hàn', 'cơm trộn hàn quốc',
    ],
  },
  'Nhật Bản': {
    tag: 'nhật bản',
    keywords: [
      'sushi', 'ramen nhật', 'gyoza nhật', 'tempura nhật', 'udon nhật',
      'onigiri nhật', 'miso soup', 'takoyaki', 'okonomiyaki', 'teriyaki nhật',
      'karaage', 'katsudon nhật', 'mochi nhật', 'tamagoyaki',
    ],
  },
  'Ý': {
    tag: 'ý',
    keywords: [
      'pizza', 'spaghetti carbonara', 'lasagna', 'risotto', 'gnocchi',
      'focaccia', 'tiramisu', 'panna cotta', 'pesto pasta', 'bruschetta',
      'pasta bolognese', 'arancini', 'calzone', 'cannoli',
    ],
  },
  'Thái Lan': {
    tag: 'thái lan',
    keywords: [
      'pad thai', 'tom yum', 'cà ri thái', 'xôi xoài thái', 'cơm rang thái',
      'larb thái', 'satay thái', 'papaya salad thái', 'tom kha gai',
      'gỏi đu đủ thái', 'bánh tôm thái', 'cá thái lan', 'mango sticky rice',
    ],
  },
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    return data;
  } catch (err) {
    console.warn(`  ⚠️  ${url} → ${err.message}`);
    return null;
  }
}

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

function isoDuration(str) {
  if (!str) return 0;
  const m = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
}

function parseIngredient(text) {
  text = text.trim();
  const m = text.match(
    /^([\d¼½¾⅓⅔.,\/]+)\s*(g|kg|ml|l|lít|muỗng canh|muỗng cà phê|muỗng|tbsp|tsp|cup|bó|cái|quả|trái|củ|tép|lá|miếng|lon|hộp|gói|túi)?\s*(.+)/i,
  );
  if (m) return { quantity: m[1], unit: m[2] || '', name: m[3].trim() };
  return { quantity: '', unit: '', name: text };
}

async function scrapeSearchPage(keyword, page) {
  const url = `${BASE}/vn/tim-kiem/${encodeURIComponent(keyword)}?page=${page}`;
  const html = await fetchHtml(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/\/vn\/cong-thuc\/\d+/.test(href))
      urls.add(href.startsWith('http') ? href : `${BASE}${href}`);
  });
  return [...urls];
}

async function scrapeRecipe(url, cuisine, countryTag) {
  const html = await fetchHtml(url);
  if (!html) return null;
  const data = extractJsonLd(html);
  if (!data?.name) return null;

  let image_url = '';
  if (typeof data.image === 'string') image_url = data.image;
  else if (Array.isArray(data.image)) image_url = data.image[0];
  else if (data.image?.url) image_url = data.image.url;

  const ingredients = (data.recipeIngredient || [])
    .map(parseIngredient)
    .filter(i => i.name.length > 0);

  const steps = (data.recipeInstructions || []).map((s, i) => ({
    order: i + 1,
    description: typeof s === 'string' ? s : (s.text || ''),
  })).filter(s => s.description.length > 0);

  if (!ingredients.length && !steps.length) return null;

  // Always inject the country tag so normalizeRecipes.js classifies correctly
  const rawTags = typeof data.keywords === 'string'
    ? data.keywords.split(',').map(t => t.trim()).filter(Boolean)
    : (Array.isArray(data.keywords) ? data.keywords.map(t => String(t).trim()).filter(Boolean) : []);
  const tags = [...new Set([...rawTags, countryTag])];

  const cookMin  = isoDuration(data.cookTime);
  const totalMin = isoDuration(data.totalTime);
  const prepMin  = isoDuration(data.prepTime);
  const cook_time_min = cookMin || (totalMin > prepMin ? totalMin - prepMin : totalMin) || 30;

  let servings = 2;
  if (data.recipeYield) {
    const y = Array.isArray(data.recipeYield) ? data.recipeYield[0] : data.recipeYield;
    const n = parseInt(String(y).replace(/[^\d]/g, ''));
    if (!isNaN(n) && n > 0 && n <= 20) servings = n;
  }

  let calories_per_serving = 0;
  if (data.nutrition?.calories) {
    const n = parseInt(String(data.nutrition.calories).replace(/[^\d]/g, ''));
    if (!isNaN(n) && n > 0) calories_per_serving = n;
  }

  return {
    title: data.name.trim(),
    description: data.description || '',
    category: cuisine,      // will be corrected by normalize script
    cuisine,
    image_url,
    cook_time_min,
    prep_time_min: prepMin || 10,
    servings,
    calories_per_serving,
    tags,
    ingredients,
    steps,
    is_public: true,
    is_scraped: true,
    source_url: url,
    scrape_source: 'cookpad.com',
  };
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected\n');

  let totalInserted = 0;

  for (const [cuisine, { tag, keywords }] of Object.entries(CUISINES)) {
    console.log(`\n🌍 Cuisine: ${cuisine}`);
    const allUrls = new Set();

    for (const keyword of keywords) {
      if (allUrls.size >= 25) break; // enough for 20 unique after dedup/failures
      console.log(`  🔍 "${keyword}"`);
      for (let page = 1; page <= 2; page++) {
        const urls = await scrapeSearchPage(keyword, page);
        urls.forEach(u => allUrls.add(u));
        process.stdout.write(`    page ${page}: +${urls.length} (pool ${allUrls.size})\n`);
        if (urls.length === 0) break;
        await sleep(DELAY_MS);
        // Stop early if we have enough URLs to get MAX_PER_KEYWORD recipes
        if (urls.length > 0 && allUrls.size >= keywords.indexOf(keyword) * MAX_PER_KEYWORD + MAX_PER_KEYWORD) break;
      }
    }

    console.log(`  📋 ${allUrls.size} unique URLs — scraping details...`);
    let inserted = 0, skipped = 0;

    for (const url of allUrls) {
      if (inserted >= 20) break;
      const recipe = await scrapeRecipe(url, cuisine, tag);
      await sleep(DELAY_MS);

      if (!recipe) { skipped++; continue; }

      try {
        const existing = await Recipe.findOne({ source_url: url });
        if (existing) {
          skipped++;
          process.stdout.write(`  ⟳ already exists: ${recipe.title}\n`);
          continue;
        }
        await Recipe.create(recipe);
        process.stdout.write(`  ✅ ${recipe.title}\n`);
        inserted++;
        totalInserted++;
      } catch (err) {
        process.stdout.write(`  ❌ ${err.message}\n`);
        skipped++;
      }
    }

    console.log(`  → ${inserted} inserted, ${skipped} skipped`);
  }

  console.log(`\n🎉 Done! Total inserted: ${totalInserted}`);
  console.log('👉 Now run: npm run normalize:recipes  to fix category/cuisine fields');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
