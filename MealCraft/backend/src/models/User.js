const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
  ingredient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', default: null },
  name:     { type: String, required: true },
  quantity: { type: String, default: '' },
  unit:     { type: String, default: '' },
  added_at: { type: Date, default: Date.now },
}, { _id: true });

const preferencesSchema = new mongoose.Schema({
  dietary:   [String],   // vegetarian, vegan, halal, gluten-free
  allergies: [String],
  cuisines:  [String],   // favourite cuisine types
  servings:  { type: Number, default: 2 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, default: '' },
  password: { type: String, required: true },     // bcrypt hash

  avatar_url:   { type: String, default: '' },
  preferences:  { type: preferencesSchema, default: () => ({}) },

  saved_recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  fridge:        [fridgeItemSchema],

  current_group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
