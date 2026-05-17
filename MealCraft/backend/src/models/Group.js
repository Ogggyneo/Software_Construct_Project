const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },   // denormalized for fast reads
  is_ready:  { type: Boolean, default: false },
  joined_at: { type: Date, default: Date.now },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image_url:   { type: String, default: '' },

  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  address: { type: String, default: '' },

  members:     [memberSchema],
  max_members: { type: Number, default: 10 },

  status: {
    type: String,
    enum: ['open', 'ordering', 'closed'],
    default: 'open',
  },

  pickup_point:   { type: String, default: '' },
  order_deadline: { type: Date, default: null },
  food_preferences: [{ type: String }],
  budget:         { type: String, default: '' },

  chosen_recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
  owner_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Required for $near / $geoNear queries
groupSchema.index({ location: '2dsphere' });
groupSchema.index({ status: 1 });

module.exports = mongoose.model('Group', groupSchema);
