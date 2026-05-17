const mongoose = require('mongoose');

const ingredientLineSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  quantity: { type: String, default: '' },
  unit:     { type: String, default: '' },
}, { _id: false });

const stepSchema = new mongoose.Schema({
  order:       { type: Number, required: true },
  description: { type: String, required: true },
  duration_min:{ type: Number, default: 0 },
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    { type: String, default: '' },     // soup, stir-fry, salad, etc.
  cuisine:     { type: String, default: 'Vietnamese' },
  image_url:   { type: String, default: '' },

  ingredients: [ingredientLineSchema],
  steps:       [stepSchema],

  prep_time_min:  { type: Number, default: 0 },
  cook_time_min:  { type: Number, default: 0 },
  servings:       { type: Number, default: 2 },

  calories_per_serving: { type: Number, default: 0 },
  tags: [String],

  // Airflow scraper fields
  source_url:    { type: String, default: '' },
  scrape_source: { type: String, default: '' }, // e.g. 'cooky.vn', 'monngon.tv'
  is_scraped:    { type: Boolean, default: false },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  is_public:  { type: Boolean, default: true },
}, { timestamps: true });

recipeSchema.index({ title: 1, scrape_source: 1 }, { unique: true, sparse: true });
recipeSchema.index({ 'ingredients.name': 1 }); // fast $in matching from fridge
recipeSchema.index({ tags: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
