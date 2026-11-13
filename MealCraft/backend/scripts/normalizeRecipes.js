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

const TAG_MAP = {
  'chinese':    'Trung Hoa',
  'korean':     'Hàn Quốc',
  'japanese':   'Nhật Bản',
  'italian':    'Ý',
  'thai':       'Thái Lan',
  'vietnamese': 'Việt Nam',
};

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(t => TAG_MAP[t.toLowerCase().trim()] ?? t);
}

function classifyRecipe(title, tags) {
  const t = title.toLowerCase();                              // title only
  const combined = (title + ' ' + (tags || []).join(' ')).toLowerCase(); // title + tags

  // ── International — dish keywords or explicit country tag ────────────────────
  if (/pizza|pasta|spaghetti|mì ý|lasagna|risotto|gnocchi|carbonara|pesto|focaccia|bruschetta/.test(combined)
      || /\bý\b|italia/.test(combined))
    return { cuisine: 'Ý', category: 'Pizza & Pasta' };

  if (/sushi|sashimi|ramen|udon|miso|onigiri|tempura|gyoza|takoyaki|okonomiyaki|teriyaki|karaage|katsudon|donburi/.test(combined)
      || /nhật bản/.test(combined))
    return { cuisine: 'Nhật Bản', category: 'Nhật Bản' };

  if (/kimchi|tteok|bibimbap|samgyeopsal|ramyeon|japchae|kimbap|bulgogi|galbi|doenjang|sundubu|hotteok/.test(combined)
      || /hàn quốc/.test(combined))
    return { cuisine: 'Hàn Quốc', category: 'Hàn Quốc' };

  if (/dimsum|há cảo|sủi cảo|cha siu|vịt tiềm/.test(combined)
      || /trung hoa/.test(combined))
    return { cuisine: 'Trung Hoa', category: 'Trung Hoa' };

  if (/pad thai|tom yum|tom kha|massaman|larb|satay|papaya salad|som tam/.test(combined)
      || /thái lan/.test(combined))
    return { cuisine: 'Thái Lan', category: 'Thái Lan' };

  // ── Vietnamese desserts ──────────────────────────────────────────────────────
  if (/chè|flan|pudding|mousse|cheesecake|kem tươi|bánh kem|mochi|thạch|sữa chua|bánh trôi|bánh ít|bánh dẻo/.test(combined))
    return { cuisine: 'Việt Nam', category: 'Chè & Tráng miệng' };

  // ── From here: use TITLE only to avoid tags polluting category ───────────────

  // Ăn chay — BEFORE đậu hũ (chay is stronger signal than individual tofu ingredients)
  if (/chay/.test(t))
    return { cuisine: 'Việt Nam', category: 'Ăn chay' };

  // Cơm — title-first: cơm + chay/đậu/canh tags → still Cơm
  if (/cơm/.test(t))
    return { cuisine: 'Việt Nam', category: 'Cơm' };

  // Lẩu
  if (/lẩu/.test(t))
    return { cuisine: 'Việt Nam', category: 'Lẩu' };

  // Phở & Bún
  if (/phở|bún bò|bún riêu|bún mắm|bún cá|bún hải sản|bún thịt|miến|hủ tiếu|bánh canh/.test(t))
    return { cuisine: 'Việt Nam', category: 'Phở & Bún' };

  // Xôi
  if (/xôi/.test(t))
    return { cuisine: 'Việt Nam', category: 'Xôi' };

  // Canh & Súp — title only
  if (/canh|súp/.test(t))
    return { cuisine: 'Việt Nam', category: 'Canh & Súp' };

  // Gà — title only
  if (/gà/.test(t))
    return { cuisine: 'Việt Nam', category: 'Gà' };

  // Đậu hũ — combined ok here (less common false positive)
  if (/tàu hũ|đậu hũ|đậu phụ/.test(combined))
    return { cuisine: 'Việt Nam', category: 'Đậu hũ' };

  // Ăn chay from tags (e.g. recipe not named "chay" but tagged "ăn chay")
  if (/chay/.test(combined))
    return { cuisine: 'Việt Nam', category: 'Ăn chay' };

  if (/bánh mì|bánh xèo|bánh cuốn|bánh ướt|bánh bèo|bánh bao|bánh tráng/.test(combined))
    return { cuisine: 'Việt Nam', category: 'Bánh' };

  if (/tôm|mực|hải sản|cua|ghẹ|sò|ngao| cá /.test(combined) || /^cá /.test(t))
    return { cuisine: 'Việt Nam', category: 'Hải sản' };

  if (/ăn vặt|snack|bánh tráng trộn/.test(combined))
    return { cuisine: 'Việt Nam', category: 'Đồ ăn vặt' };

  return { cuisine: 'Việt Nam', category: 'Chè & Tráng miệng' };
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  // Migrate: move all "Cơm & Mì" → "Chè & Tráng miệng" before reclassifying
  const migrated = await Recipe.updateMany(
    { category: 'Cơm & Mì' },
    { $set: { category: 'Chè & Tráng miệng' } },
  );
  if (migrated.modifiedCount) console.log(`🔄 Migrated ${migrated.modifiedCount} "Cơm & Mì" → "Chè & Tráng miệng"\n`);

  const total = await Recipe.countDocuments({ is_public: true });
  console.log(`📋 ${total} public recipes to normalize\n`);

  const BATCH = 100;
  let updated = 0;
  let skip = 0;

  const INTL_CUISINES = new Set(['Hàn Quốc', 'Nhật Bản', 'Ý', 'Thái Lan', 'Trung Hoa']);

  while (skip < total) {
    const recipes = await Recipe.find({ is_public: true })
      .select('title tags cuisine ingredients')  // tags needed for normalizeTags
      .skip(skip)
      .limit(BATCH)
      .lean();

    if (!recipes.length) break;

    const ops = recipes.map(r => {
      let cuisine, category;
      if (INTL_CUISINES.has(r.cuisine)) {
        // Already correctly tagged by scrapeIntl.js — preserve cuisine, set category = cuisine
        cuisine = r.cuisine;
        category = r.cuisine;
      } else {
        ({ cuisine, category } = classifyRecipe(r.title, r.tags));
      }
      return {
        updateOne: {
          filter: { _id: r._id },
          update: {
            $set: {
              title: normalizeTitle(r.title),
              cuisine,
              category,
              tags: normalizeTags(r.tags),
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
