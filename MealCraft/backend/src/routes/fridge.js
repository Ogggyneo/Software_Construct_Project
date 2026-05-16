const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const authMiddleware = require('../middleware/auth');

// GET user's fridge items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('fridge');
    res.json({ items: user?.fridge ?? [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fridge items' });
  }
});

// GET all ingredients in the catalogue (for search/autocomplete)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const items = await Ingredient.find().sort({ category: 1, name: 1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ingredients' });
  }
});

// POST add ingredient to fridge
// Body: { name, quantity?, unit? }  OR  { ingredient_id }
router.post('/', authMiddleware, async (req, res) => {
  let { name, quantity = '', unit = '', ingredient_id } = req.body;

  try {
    if (!name && ingredient_id) {
      const ing = await Ingredient.findById(ingredient_id);
      if (!ing) return res.status(404).json({ message: 'Ingredient not found' });
      name = ing.name;
      unit = unit || ing.unit;
    }
    if (!name) return res.status(400).json({ message: 'name is required' });

    await User.findByIdAndUpdate(req.user.user_id, {
      $push: {
        fridge: {
          ingredient_id: ingredient_id || null,
          name,
          quantity,
          unit,
        },
      },
    });
    res.status(201).json({ message: 'Ingredient added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add ingredient' });
  }
});

// DELETE clear entire fridge
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.user_id, { $set: { fridge: [] } });
    res.json({ message: 'All ingredients removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear fridge' });
  }
});

// DELETE remove one fridge item by its embedded _id
router.delete('/:item_id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.user_id, {
      $pull: { fridge: { _id: req.params.item_id } },
    });
    res.json({ message: 'Ingredient removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove ingredient' });
  }
});

module.exports = router;
