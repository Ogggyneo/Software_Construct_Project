const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipe'));
app.use('/api/group',   require('./routes/group'));
app.use('/api/fridge',  require('./routes/fridge'));

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
