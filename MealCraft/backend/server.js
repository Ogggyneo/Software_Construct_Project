const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.get('/api/test', (req, res) => {
  console.log("📥 GET /api/test hit");
//   res.json({ message: 'Backend is working!' });
});

/* ---------------- CATCH ALL (LAST!) ---------------- */

app.use((req, res) => {
  console.log(`❌ NOT HANDLED: ${req.method} ${req.url}`);
  res.status(404).json({
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});