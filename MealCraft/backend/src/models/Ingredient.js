const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, default: 'other' }, // vegetable, meat, spice, dairy, etc.
  unit: { type: String, default: '' },           // kg, g, ml, piece
  image_url: { type: String, default: '' },
}, { timestamps: true });

ingredientSchema.index({ name: 'text' });

module.exports = mongoose.model('Ingredient', ingredientSchema);
