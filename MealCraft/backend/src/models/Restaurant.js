const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // "Đồ ăn", "Trà & Cà phê", "Bánh", etc.
  cuisine: String, // "Việt Nam", "Hàn Quốc", "Nhật Bản", "Ý", etc.
  address: { type: String, required: true },
  ward: String,
  district: { type: String, default: 'Quận 7' },
  city: { type: String, default: 'TP. Hồ Chí Minh' },
  area: String, // "Crescent Mall", "SC VivoCity", "Phú Mỹ Hưng", etc.
  platforms: {
    grab: { type: Boolean, default: false },
    shopee_food: { type: Boolean, default: false },
    be_food: { type: Boolean, default: false },
  },
  price_range: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
  tags: [String],
  description: String,
  phone: String,
  open_hours: String,
}, { timestamps: true });

restaurantSchema.index({ district: 1, category: 1 });
restaurantSchema.index({ name: 'text', tags: 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
