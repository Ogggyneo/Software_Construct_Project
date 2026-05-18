const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/stats', async (_req, res) => {
  try {
    const Recipe = require('./models/Recipe');
    const stats = await Recipe.aggregate([
      { $match: { is_public: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = stats.reduce((s, r) => s + r.count, 0);
    res.json({ total, byCategory: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipe'));
app.use('/api/group',   require('./routes/group'));
app.use('/api/fridge',  require('./routes/fridge'));
app.use('/api/ai',      require('./routes/ai'));

module.exports = app;
