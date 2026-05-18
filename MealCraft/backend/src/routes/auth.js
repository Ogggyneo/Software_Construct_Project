const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { name, email, phone = '', password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'name, email and password are required' });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: password_hash });

    res.status(201).json({ message: 'User registered successfully', user_id: user._id });
  } catch (err) {
    console.error('register:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { user_id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user_id: user._id, name: user.name });
  } catch (err) {
    console.error('login:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.put('/preferences', authMiddleware, async (req, res) => {
  const { cuisines, dietary, allergies } = req.body;
  try {
    const update = {};
    if (Array.isArray(cuisines))  update['preferences.cuisines']  = cuisines;
    if (Array.isArray(dietary))   update['preferences.dietary']   = dietary;
    if (Array.isArray(allergies)) update['preferences.allergies'] = allergies;
    await User.findByIdAndUpdate(req.user.user_id, { $set: update });
    res.json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

module.exports = router;
