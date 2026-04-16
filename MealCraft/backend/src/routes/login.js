const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  console.log("📥 LOGIN:", email, password);
  if (!email || !password) {
    return res.status(400).json({ success: false });
  }

  return res.json({
    success: true,
    user: {
      name: email.split('@')[0], // simple name from email
      email
    }
  });
});

// test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});