/**
 * Remove duplicate scraped recipes. Keeps the first inserted copy,
 * deletes the rest that share the same (title, scrape_source) pair.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/dedupRecipes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  const dupes = await Recipe.aggregate([
    { $match: { is_scraped: true } },
    {
      $group: {
        _id: { title: '$title', scrape_source: '$scrape_source' },
        ids: { $push: '$_id' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  console.log(`🔍 Found ${dupes.length} duplicate groups\n`);

  let removed = 0;
  for (const d of dupes) {
    const [keep, ...toDelete] = d.ids;
    await Recipe.deleteMany({ _id: { $in: toDelete } });
    removed += toDelete.length;
    console.log(`  kept ${keep} | deleted ${toDelete.length} duplicate(s) of "${d._id.title}"`);
  }

  const remaining = await Recipe.countDocuments({ is_scraped: true });
  console.log(`\n🎉 Done! Removed ${removed} duplicates. ${remaining} recipes remaining.`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
