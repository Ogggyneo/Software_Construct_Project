const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// GET all recipes for home feed — category-balanced so no single type dominates
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([
      { $match: { is_public: true } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$category',
          items: {
            $push: {
              _id: '$_id', title: '$title', category: '$category', cuisine: '$cuisine',
              image_url: '$image_url', cook_time_min: '$cook_time_min',
              calories_per_serving: '$calories_per_serving', tags: '$tags',
            },
          },
        },
      },
      { $project: { items: { $slice: ['$items', 25] } } },
      { $unwind: '$items' },
      { $replaceRoot: { newRoot: '$items' } },
      { $sample: { size: 600 } },
    ]);
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// GET personalized recommendations based on saved preferences
router.get('/recommended', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('preferences');
    const cuisines  = user?.preferences?.cuisines  ?? [];
    const dietary   = user?.preferences?.dietary   ?? [];
    const allergies = user?.preferences?.allergies ?? [];

    const INTL_CUISINES = ['Ý', 'Hàn Quốc', 'Nhật Bản', 'Thái Lan', 'Trung Hoa'];

    const andClauses = [];
    const query = { is_public: true };

    // ── Cuisine filter ────────────────────────────────────────────────────────
    if (cuisines.length) {
      const onlyVN = cuisines.includes('Việt Nam') &&
                     !cuisines.some(c => INTL_CUISINES.includes(c));
      if (onlyVN) {
        // Vietnamese-only: cuisine field must be VN, exclude misclassified intl recipes
        query.cuisine = 'Việt Nam';
        query.category = { $nin: INTL_CUISINES };
      } else {
        // Match by cuisine OR by category (handles recipes where old normalize set cuisine→VN)
        andClauses.push({
          $or: [
            { cuisine: { $in: cuisines } },
            { category: { $in: cuisines } },
          ],
        });
      }
    }

    // ── Dietary: vegetarian / vegan ───────────────────────────────────────────
    if (dietary.some(d => /vegetarian|vegan|chay/i.test(d))) {
      andClauses.push({
        $or: [
          { category: 'Ăn chay' },
          { tags: { $elemMatch: { $regex: 'chay', $options: 'i' } } },
        ],
      });
    }

    // ── Dietary: healthy — exclude heavy/dessert categories ───────────────────
    if (dietary.some(d => /healthy|eatclean|eat.?clean|ít béo|low.?fat/i.test(d))) {
      const excludeCats = [...(query.category?.$nin ?? []), 'Đồ ngọt', 'Đồ ăn vặt'];
      query.category = { ...(query.category ?? {}), $nin: excludeCats };
    }

    if (andClauses.length) query.$and = andClauses;

    // ── Allergen keyword map (Vietnamese ingredient names) ────────────────────
    const ALLERGEN_MAP = {
      'gluten':    ['gluten', 'bột mì', 'lúa mì', 'wheat', 'mì ống'],
      'lúa mì':   ['gluten', 'bột mì', 'lúa mì', 'wheat', 'mì ống'],
      'sữa':      ['sữa', 'cream', 'bơ', 'phô mai', 'cheese', 'yogurt', 'whipping'],
      'lactose':  ['sữa', 'cream', 'bơ', 'phô mai', 'cheese', 'yogurt'],
      'trứng':    ['trứng'],
      'đậu phộng':['đậu phộng', 'lạc', 'peanut'],
      'hải sản':  ['tôm', 'cua', 'mực', 'nghêu', 'sò', 'ốc', 'shellfish'],
      'hạt cây':  ['hạt điều', 'hạt dẻ', 'hạnh nhân', 'óc chó', 'macadamia', 'hạt thông', 'cashew', 'almond', 'walnut', 'pecan'],
      'đậu nành': ['đậu nành', 'soy', 'tofu', 'đậu hũ', 'đậu phụ', 'tương'],
      'mè':       ['mè', 'vừng', 'sesame'],
      'vừng':     ['mè', 'vừng', 'sesame'],
      'hành':     ['hành'],
      'tỏi':      ['tỏi'],
      'ớt':       ['ớt', 'chili'],
      'ngò':      ['ngò', 'rau mùi', 'cilantro'],
      'sả':       ['sả'],
      'nước mắm': ['nước mắm', 'mắm'],
      'nấm':      ['nấm'],
    };

    // Diverse sample: up to 4 per category, then pick 40 randomly
    let recipes = await Recipe.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$category',
          items: {
            $push: {
              _id: '$_id', title: '$title', category: '$category', cuisine: '$cuisine',
              image_url: '$image_url', cook_time_min: '$cook_time_min',
              calories_per_serving: '$calories_per_serving', tags: '$tags',
              ingredients: '$ingredients',
            },
          },
        },
      },
      { $project: { items: { $slice: ['$items', 4] } } },
      { $unwind: '$items' },
      { $replaceRoot: { newRoot: '$items' } },
      { $sample: { size: 40 } },
    ]);

    // Post-filter: remove recipes containing allergen ingredients
    if (allergies.length) {
      const keywords = [...new Set(
        allergies.flatMap(a => {
          const lower = a.toLowerCase();
          for (const [key, vals] of Object.entries(ALLERGEN_MAP)) {
            if (lower.includes(key)) return vals;
          }
          return lower.split(/[/\s&,()]+/).filter(w => w.length > 2);
        })
      )];
      recipes = recipes.filter(r =>
        !(r.ingredients ?? []).some(ing =>
          keywords.some(kw => (ing.name ?? '').toLowerCase().includes(kw))
        )
      );
    }

    res.json({ recipes: recipes.slice(0, 10).map(({ ingredients, ...r }) => r) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// GET recipes whose ingredients overlap with user's fridge (or ?ingredients=x,y,z)
router.get('/matching', authMiddleware, async (req, res) => {
  try {
    // Accept explicit ingredients from query, or fall back to user's saved fridge
    let fridgeNames;
    if (req.query.ingredients) {
      const raw = Array.isArray(req.query.ingredients)
        ? req.query.ingredients
        : String(req.query.ingredients).split(',');
      fridgeNames = raw.map(i => i.trim().toLowerCase()).filter(Boolean);
    } else {
      const user = await User.findById(req.user.user_id).select('fridge');
      if (!user?.fridge?.length)
        return res.json({ recipes: [], message: 'Tủ lạnh của bạn đang trống' });
      fridgeNames = user.fridge.map(f => f.name.toLowerCase());
    }

    if (!fridgeNames.length)
      return res.json({ recipes: [], message: 'Chưa có nguyên liệu nào' });

    // $in pre-filter — fast index hit even with 1000+ recipes
    const recipes = await Recipe.find({
      is_public: true,
      'ingredients.name': { $in: fridgeNames },
    })
      .select('title category image_url cook_time_min calories_per_serving tags ingredients')
      .limit(100)
      .lean();

    // Score each recipe by match %
    const result = recipes
      .map(r => {
        const total = r.ingredients.length;
        if (!total) return null;
        const matched = r.ingredients.filter(i =>
          fridgeNames.some(fn =>
            i.name.toLowerCase().includes(fn) || fn.includes(i.name.toLowerCase())
          )
        ).length;
        if (!matched) return null;
        const missing = total - matched;
        return {
          _id: r._id,
          title: r.title,
          category: r.category,
          image_url: r.image_url,
          cook_time_min: r.cook_time_min,
          calories_per_serving: r.calories_per_serving,
          tags: r.tags,
          total_ingredients: total,
          matched_ingredients: matched,
          missing_ingredients: missing,
          match_percent: Math.round((matched / total) * 100),
          status: missing === 0 ? 'Đủ nguyên liệu ✅' : `Thiếu ${missing} nguyên liệu`,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.match_percent - a.match_percent)
      .slice(0, 20);

    res.json({ recipes: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch matching recipes' });
  }
});

// GET recipes by category
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ is_public: true, category: req.params.category })
      .select('title category image_url cook_time_min calories_per_serving tags')
      .sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes by category' });
  }
});

// POST save a recipe
router.post('/save', authMiddleware, async (req, res) => {
  const { recipe_id } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.user_id, {
      $addToSet: { saved_recipes: recipe_id },
    });
    res.status(201).json({ message: 'Recipe saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save recipe' });
  }
});

// DELETE unsave a recipe
router.delete('/save/:recipe_id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.user_id, {
      $pull: { saved_recipes: req.params.recipe_id },
    });
    res.json({ message: 'Recipe unsaved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsave recipe' });
  }
});

// GET saved recipes list
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id)
      .populate('saved_recipes', 'title category image_url cook_time_min calories_per_serving');
    res.json({ recipes: user?.saved_recipes ?? [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved recipes' });
  }
});

// GET single recipe with full details ← wildcard always last
router.get('/:recipe_id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipe_id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    res.json({
      _id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      image_url: recipe.image_url,
      cook_time_min: recipe.cook_time_min,
      prep_time_min: recipe.prep_time_min,
      calories_per_serving: recipe.calories_per_serving,
      servings: recipe.servings,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

module.exports = router;
