/**
 * Normalize and reclassify all scraped recipes in MongoDB.
 * - Sentence-cases recipe titles (first letter up, rest lower)
 * - Lowercases ingredient names
 * - Sets cuisine + category via keyword matching
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/normalizeRecipes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');

function normalizeTitle(title) {
  if (!title) return title;
  const t = title.trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function classifyRecipe(title, tags) {
  const lower = (title + ' ' + (tags || []).join(' ')).toLowerCase();

  // ── International (check before Vietnamese to avoid mis-classifying) ─────────
  if (/pizza|pasta|spaghetti|mì ý|lasagna|risotto|gnocchi|carbonara/.test(lower))
    return { cuisine: 'Ý', category: 'Pizza & Pasta' };
  if (/sushi|sashimi|ramen|udon|miso|onigiri|tempura|gyoza|takoyaki/.test(lower))
    return { cuisine: 'Nhật Bản', category: 'Nhật Bản' };
  if (/kimchi|tteok|bibimbap|samgyeopsal|ramyeon|japchae|kimbap|bulgogi/.test(lower))
    return { cuisine: 'Hàn Quốc', category: 'Hàn Quốc' };
  if (/dimsum|há cảo|sủi cảo|cha siu|vịt tiềm|mì trứng hoa/.test(lower))
    return { cuisine: 'Trung Hoa', category: 'Trung Hoa' };
  if (/pad thai|tom yum|curry thái|massaman|larb/.test(lower))
    return { cuisine: 'Thái Lan', category: 'Thái Lan' };

  // ── Vietnamese desserts & sweet dishes ──────────────────────────────────────
  if (/chè|flan|pudding|tiramisu|mousse|cheesecake|kem tươi|bánh kem|mochi|thạch|sữa chua|bánh trôi|bánh ít|bánh dẻo/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Chè & Tráng miệng' };

  // ── Hot-pot ─────────────────────────────────────────────────────────────────
  if (/lẩu/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Lẩu' };

  // ── Noodle soups ─────────────────────────────────────────────────────────────
  if (/phở|bún bò|bún riêu|bún mắm|bún cá|bún hải sản|bún thịt|miến|hủ tiếu|bánh canh/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Phở & Bún' };

  // ── Sticky rice ──────────────────────────────────────────────────────────────
  if (/xôi/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Xôi' };

  // ── Tofu ─────────────────────────────────────────────────────────────────────
  if (/tàu hũ|đậu hũ|đậu phụ/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Đậu hũ' };

  // ── Soup / broth ──────────────────────────────────────────────────────────────
  if (/canh|súp/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Canh & Súp' };

  // ── Chicken ──────────────────────────────────────────────────────────────────
  if (/gà/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Gà' };

  // ── Savory bread & pancakes ──────────────────────────────────────────────────
  if (/bánh mì|bánh xèo|bánh cuốn|bánh ướt|bánh bèo|bánh bao|bánh tráng/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Bánh' };

  // ── Seafood ───────────────────────────────────────────────────────────────────
  if (/tôm|mực|hải sản|cua|ghẹ|sò|ngao| cá /.test(lower) || /^cá /.test(lower))
    return { cuisine: 'Việt Nam', category: 'Hải sản' };

  // ── Vegetarian ────────────────────────────────────────────────────────────────
  if (/chay/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Ăn chay' };

  // ── Snack ─────────────────────────────────────────────────────────────────────
  if (/ăn vặt|snack|bánh tráng trộn/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Đồ ăn vặt' };

  // ── Rice dishes ───────────────────────────────────────────────────────────────
  if (/cơm/.test(lower))
    return { cuisine: 'Việt Nam', category: 'Cơm' };

  return { cuisine: 'Việt Nam', category: 'Cơm & Mì' };
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  const total = await Recipe.countDocuments({ is_scraped: true });
  console.log(`📋 ${total} scraped recipes to normalize\n`);

  const BATCH = 100;
  let updated = 0;
  let skip = 0;

  while (skip < total) {
    const recipes = await Recipe.find({ is_scraped: true })
      .select('title tags ingredients')
      .skip(skip)
      .limit(BATCH)
      .lean();

    if (!recipes.length) break;

    const ops = recipes.map(r => {
      const { cuisine, category } = classifyRecipe(r.title, r.tags);
      return {
        updateOne: {
          filter: { _id: r._id },
          update: {
            $set: {
              title: normalizeTitle(r.title),
              cuisine,
              category,
              ingredients: (r.ingredients || []).map(ing => ({
                ...ing,
                name: (ing.name || '').trim().toLowerCase(),
              })),
            },
          },
        },
      };
    });

    try {
      const result = await Recipe.bulkWrite(ops, { ordered: false });
      updated += result.modifiedCount;
    } catch (err) {
      if (err.code === 11000) {
        updated += err.result?.modifiedCount ?? 0;
        const conflicts = err.writeErrors?.length ?? 0;
        if (conflicts) console.log(`  ⚠️  ${conflicts} title conflict(s) skipped`);
      } else {
        throw err;
      }
    }
    console.log(`  [${skip + ops.length}/${total}] processed`);
    skip += BATCH;
  }

  console.log(`\n🎉 Done! Updated ${updated} recipes`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
