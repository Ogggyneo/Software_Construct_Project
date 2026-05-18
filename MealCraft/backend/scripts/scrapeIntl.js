/**
 * International recipe scraper — up to 5 unique dishes per subcategory keyword.
 * Each cuisine has ~10-12 category-level keywords → ~50-60 attempts → ~40-50 unique dishes.
 * We cap the final DB insert at MAX_PER_CUISINE (default 20) for balance.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/scrapeIntl.js
 *
 * Env overrides:
 *   MAX_PER_KEYWORD  - recipes to take per keyword    (default 5)
 *   MAX_PER_CUISINE  - total recipes stored per cuisine (default 20)
 *   DELAY_MS         - ms between requests            (default 1500)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios    = require('axios');
const cheerio  = require('cheerio');
const mongoose = require('mongoose');
const Recipe   = require('../src/models/Recipe');

const DELAY_MS        = parseInt(process.env.DELAY_MS        || '1500');
const MAX_PER_KEYWORD = parseInt(process.env.MAX_PER_KEYWORD || '5');
const MAX_PER_CUISINE = parseInt(process.env.MAX_PER_CUISINE || '20');
const BASE = 'https://cookpad.com';

/**
 * Category-level keywords, one per distinct subcategory on Cookpad Vietnam.
 * Each yields a focused, different dish type — prevents 30 kimchi variations.
 */
const CUISINES = {
  'Hàn Quốc': {
    countryTag: 'hàn quốc',
    keywords: [
      'kim chi hàn quốc',
      'cơm trộn hàn quốc',
      'bánh xếp hàn quốc',
      'gà hàn quốc',
      'thịt heo hàn quốc',
      'sườn hàn quốc',
      'lẩu hàn quốc',
      'mì tương đen hàn quốc',
      'gà sốt hàn quốc',
      'bánh mì hàn quốc',
      'tteokbokki',
      'japchae',
    ],
  },
  'Nhật Bản': {
    countryTag: 'nhật bản',
    keywords: [
      'sushi nhật bản',
      'ramen nhật bản',
      'gyoza nhật bản',
      'tempura nhật bản',
      'udon nhật bản',
      'onigiri nhật bản',
      'miso soup nhật bản',
      'takoyaki nhật bản',
      'okonomiyaki nhật bản',
      'teriyaki nhật bản',
      'karaage nhật bản',
      'katsudon nhật bản',
    ],
  },
  'Ý': {
    countryTag: 'ý',
    keywords: [
      'pizza ý',
      'spaghetti carbonara',
      'lasagna ý',
      'risotto ý',
      'pasta bolognese',
      'gnocchi ý',
      'tiramisu ý',
      'panna cotta',
      'focaccia ý',
      'bruschetta ý',
      'pesto pasta',
      'calzone ý',
    ],
  },
  'Thái Lan': {
    countryTag: 'thái lan',
    keywords: [
      'pad thai',
      'tom yum thái lan',
      'cà ri thái lan',
      'cơm rang thái lan',
      'xôi xoài thái lan',
      'lẩu thái lan',
      'gỏi đu đủ thái',
      'satay thái lan',
      'tom kha gai',
      'gà sốt thái lan',
      'bánh tôm thái lan',
      'cá thái lan',
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

/** Returns up to MAX_PER_KEYWORD unique recipe URLs from one search keyword (page 1 only). */
async function getUrlsForKeyword(keyword) {
  const url = `${BASE}/vn/tim-kiem/${encodeURIComponent(keyword)}?page=1`;
  const html = await fetchHtml(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/\/vn\/cong-thuc\/\d+/.test(href))
      urls.add(href.startsWith('http') ? href : `${BASE}${href}`);
  });
  // Only keep the first MAX_PER_KEYWORD to enforce variety
  return [...urls].slice(0, MAX_PER_KEYWORD);
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
    category: cuisine,      // normalizeRecipes.js will correct this
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

  for (const [cuisine, { countryTag, keywords }] of Object.entries(CUISINES)) {
    console.log(`\n🌍 Cuisine: ${cuisine}  (target: ${MAX_PER_CUISINE}, ${MAX_PER_KEYWORD}/keyword)`);
    let inserted = 0;

    for (const keyword of keywords) {
      if (inserted >= MAX_PER_CUISINE) break;

      console.log(`  🔍 "${keyword}"`);
      const urls = await getUrlsForKeyword(keyword);
      process.stdout.write(`    found ${urls.length} URLs\n`);
      await sleep(DELAY_MS);

      let keywordInserted = 0;

      for (const url of urls) {
        if (inserted >= MAX_PER_CUISINE) break;
        if (keywordInserted >= MAX_PER_KEYWORD) break;

        const recipe = await scrapeRecipe(url, cuisine, countryTag);
        await sleep(DELAY_MS);

        if (!recipe) continue;

        try {
          const existing = await Recipe.findOne({ source_url: url });
          if (existing) {
            process.stdout.write(`    ⟳ exists: ${recipe.title}\n`);
            continue;
          }
          await Recipe.create(recipe);
          process.stdout.write(`    ✅ [${keywordInserted + 1}/${MAX_PER_KEYWORD}] ${recipe.title}\n`);
          inserted++;
          keywordInserted++;
          totalInserted++;
        } catch (err) {
          process.stdout.write(`    ❌ ${err.message}\n`);
        }
      }

      if (keywordInserted === 0) {
        process.stdout.write(`    ⚠️  0 new recipes for "${keyword}"\n`);
      }
    }

    console.log(`  → ${inserted} inserted for ${cuisine}`);
  }

  console.log(`\n🎉 Done! Total inserted: ${totalInserted}`);
  console.log('👉 Now run: npm run normalize:recipes  to fix category/cuisine fields');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
