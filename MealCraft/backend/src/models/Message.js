const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  group_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_name: { type: String, required: true },   // denormalized — no extra User lookup on read

  text:        { type: String, default: '' },
  type: {
    type: String,
    enum: ['text', 'recipe_suggestion', 'system'],
    default: 'text',
  },
  // For recipe_suggestion messages
  recipe_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
}, { timestamps: true });

messageSchema.index({ group_id: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
