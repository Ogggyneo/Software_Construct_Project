/**
 * AI enrichment — fills missing cook_time_min, calories_per_serving, servings
 * for ALL eligible recipes using Gemini, processed in automatic batches.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." GEMINI_API_KEY="..." node scripts/enrichRecipes.js
 *
 * Env overrides:
 *   DELAY_MS    - ms between Gemini calls (default 4000 to stay within free-tier 15 RPM)
 *   CHUNK       - DB fetch chunk size     (default 100)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Recipe = require('../src/models/Recipe');

const DELAY_MS = parseInt(process.env.DELAY_MS || '4000');
const CHUNK    = parseInt(process.env.CHUNK    || '100');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function estimateWithAI(model, recipe) {
  const ingredientList = (recipe.ingredients ?? [])
    .slice(0, 20)
    .map(i => [i.quantity, i.unit, i.name].filter(Boolean).join(' '))
    .join(', ');

  const prompt = `Bạn là chuyên gia dinh dưỡng và đầu bếp. Dựa vào tên món và nguyên liệu sau, hãy ước tính:
- cook_time_min: thời gian nấu thực tế (phút, không tính chuẩn bị), số nguyên
- calories_per_serving: calo mỗi khẩu phần, số nguyên
- servings: số khẩu phần (1-8), số nguyên

Tên món: ${recipe.title}
Nguyên liệu: ${ingredientList || 'không có thông tin'}

Chỉ trả về JSON thuần, không giải thích, không markdown:
{"cook_time_min": <số>, "calories_per_serving": <số>, "servings": <số>}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '').trim();
    const json = JSON.parse(text);
    const cook = parseInt(json.cook_time_min);
    const kcal = parseInt(json.calories_per_serving);
    const serv = parseInt(json.servings);
    if (isNaN(cook) || isNaN(kcal) || isNaN(serv)) return null;
    if (cook < 1 || cook > 480) return null;
    if (kcal < 10 || kcal > 3000) return null;
    if (serv < 1 || serv > 20) return null;
    return { cook_time_min: cook, calories_per_serving: kcal, servings: serv };
  } catch {
    return null;
  }
}

async function main() {
  const uri    = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected\n');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const total = await Recipe.countDocuments({
    is_public: true,
    $or: [
      { calories_per_serving: { $in: [0, null] } },
      { cook_time_min: 30 },
    ],
  });

  console.log(`📋 ${total} recipes need enrichment`);
  console.log(`⏱  Estimated time: ~${Math.ceil(total * DELAY_MS / 60000)} minutes at ${DELAY_MS}ms/request\n`);
  console.log('Press Ctrl+C at any time to stop — progress is saved to DB.\n');

  let updated = 0, failed = 0, skip = 0;
  const startTime = Date.now();

  while (true) {
    const recipes = await Recipe.find({
      is_public: true,
      $or: [
        { calories_per_serving: { $in: [0, null] } },
        { cook_time_min: 30 },
      ],
    })
      .select('title ingredients cook_time_min calories_per_serving servings')
      .limit(CHUNK)
      .lean();

    if (!recipes.length) break;

    for (const recipe of recipes) {
      const pct = Math.round(((updated + failed) / total) * 100);
      process.stdout.write(`  [${updated + failed + 1}/${total} ${pct}%] ${recipe.title.slice(0, 45).padEnd(45)} `);

      const est = await estimateWithAI(model, recipe);
      await sleep(DELAY_MS);

      if (!est) {
        // Mark cook_time_min = 31 as sentinel so this recipe isn't retried endlessly
        if (recipe.cook_time_min === 30) {
          await Recipe.updateOne({ _id: recipe._id }, { $set: { cook_time_min: 31 } });
        }
        process.stdout.write('❌\n');
        failed++;
        continue;
      }

      await Recipe.updateOne({ _id: recipe._id }, { $set: est });
      process.stdout.write(`✅ ${String(est.cook_time_min).padStart(3)}min ${String(est.calories_per_serving).padStart(4)}kcal ×${est.servings}\n`);
      updated++;
    }

    skip += recipes.length;
  }

  const mins = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n🎉 Done in ${mins} min!  Updated: ${updated}  Failed: ${failed}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
