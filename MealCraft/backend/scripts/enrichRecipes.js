/**
 * AI Enrichment — fills in missing cook_time_min, calories_per_serving, servings
 * for recipes that still have default/zero values, using Gemini.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." GEMINI_API_KEY="..." node scripts/enrichRecipes.js
 *
 * Env overrides:
 *   BATCH_SIZE  - recipes per Gemini batch prompt (default 10)
 *   DELAY_MS    - ms between API calls             (default 1000)
 *   DRY_RUN     - set to "1" to log without saving (default off)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Recipe = require('../src/models/Recipe');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');
const DELAY_MS   = parseInt(process.env.DELAY_MS   || '1000');
const DRY_RUN    = process.env.DRY_RUN === '1';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildPrompt(recipes) {
  const list = recipes.map((r, i) => {
    const ingredients = (r.ingredients || []).slice(0, 12).map(ing =>
      [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')
    ).join(', ');
    return `${i + 1}. "${r.title}" | Ingredients: ${ingredients || 'unknown'}`;
  }).join('\n');

  return `You are a culinary expert. For each recipe below, estimate realistic values.
Return ONLY a JSON array (no markdown, no explanation) with exactly ${recipes.length} objects in the same order.
Each object must have:
  - "cook_time_min": integer (active cooking time in minutes, NOT total time, typical home cook)
  - "calories_per_serving": integer (kcal per serving, realistic estimate)
  - "servings": integer (1-8, typical serving size for this dish)

Rules:
- Simple dishes (salad, fried egg): 5-15 min, 150-400 kcal
- Medium dishes (stir-fry, soup): 15-40 min, 300-600 kcal
- Complex dishes (braise, stew, lasagna): 45-120 min, 400-800 kcal
- Desserts/drinks: estimate based on ingredients
- If truly uncertain, use: cook_time_min=20, calories_per_serving=350, servings=2

Recipes:
${list}`;
}

async function enrichBatch(model, recipes) {
  const prompt = buildPrompt(recipes);
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown fences if present
    const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length !== recipes.length) {
      throw new Error(`Expected array of ${recipes.length}, got ${parsed.length ?? typeof parsed}`);
    }
    return parsed;
  } catch (err) {
    console.warn(`  ⚠️  Gemini parse error: ${err.message}`);
    return null;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1); }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Target: recipes missing kcal OR using the default fallback cook time of exactly 30
  const query = {
    is_public: true,
    $or: [
      { calories_per_serving: { $in: [0, null] } },
      { cook_time_min: { $in: [0, null, 30] } },
    ],
  };

  const total = await Recipe.countDocuments(query);
  console.log(`📋 ${total} recipes to enrich${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  let updated = 0;
  let skip = 0;

  while (skip < total) {
    const recipes = await Recipe.find(query)
      .select('title ingredients cook_time_min calories_per_serving servings')
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (!recipes.length) break;

    console.log(`  🤖 Batch ${skip + 1}–${skip + recipes.length}...`);
    const estimates = await enrichBatch(model, recipes);
    await sleep(DELAY_MS);

    if (!estimates) { skip += BATCH_SIZE; continue; }

    for (let i = 0; i < recipes.length; i++) {
      const r = recipes[i];
      const e = estimates[i];
      if (!e) continue;

      const update = {};
      if (e.cook_time_min > 0)        update.cook_time_min = e.cook_time_min;
      if (e.calories_per_serving > 0) update.calories_per_serving = e.calories_per_serving;
      if (e.servings > 0)             update.servings = e.servings;

      if (Object.keys(update).length === 0) continue;

      const line = `    ✅ ${r.title} → ${update.cook_time_min ?? r.cook_time_min}min, ${update.calories_per_serving ?? r.calories_per_serving}kcal, ${update.servings ?? r.servings}người`;
      console.log(line);

      if (!DRY_RUN) {
        await Recipe.updateOne({ _id: r._id }, { $set: update });
        updated++;
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`\n🎉 Done! Enriched ${DRY_RUN ? '(dry run) ' : ''}${updated} recipes`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
