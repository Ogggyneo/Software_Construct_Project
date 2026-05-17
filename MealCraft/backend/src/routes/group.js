const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/* Mounted as app.use('/api/group', router). Full paths:
   GET    /api/group/nearby?latitude=&longitude=
   POST   /api/group/create
   POST   /api/group/:id/join
   DELETE /api/group/:id/leave
   GET    /api/group/:id/messages
   POST   /api/group/:id/messages
   GET    /api/group/:id
*/

// GET nearby open groups (MongoDB $near via 2dsphere index)
router.get('/nearby', authMiddleware, async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude)
    return res.status(400).json({ message: 'Location required' });

  try {
    const groups = await Group.find({
      status: 'open',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 5000, // 5 km
        },
      },
    }).select('name description address location members status image_url createdAt');

    res.json({ groups });
  } catch (err) {
    console.error('nearby:', err.message);
    res.status(500).json({ message: 'Failed to fetch nearby groups' });
  }
});

// POST create a new group
router.post('/create', authMiddleware, async (req, res) => {
  const user_id = req.user.user_id;
  const { name, description = '', address = '', latitude, longitude, max_members = 10, pickup_point = '', order_deadline } = req.body;

  if (!name) return res.status(400).json({ message: 'name is required' });

  try {
    const user = await User.findById(user_id).select('name');

    const group = await Group.create({
      name,
      description,
      address,
      pickup_point,
      order_deadline: order_deadline ? new Date(order_deadline) : null,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      max_members,
      owner_id: user_id,
      members: [{ user_id, name: user.name, is_ready: false }],
    });

    res.status(201).json({ message: 'Group created', group_id: group._id });
  } catch (err) {
    console.error('create group:', err.message);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// POST join a group
router.post('/:group_id/join', authMiddleware, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const group = await Group.findOne({ _id: req.params.group_id, status: 'open' });
    if (!group) return res.status(400).json({ message: 'Group is no longer open' });

    const alreadyIn = group.members.some(m => m.user_id.toString() === user_id.toString());
    if (alreadyIn) return res.json({ message: 'Already a member' });

    if (group.members.length >= group.max_members)
      return res.status(400).json({ message: 'Group is full' });

    const user = await User.findById(user_id).select('name');
    group.members.push({ user_id, name: user.name, is_ready: false });
    await group.save();

    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join group' });
  }
});

// DELETE leave a group
router.delete('/:group_id/leave', authMiddleware, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    await Group.findByIdAndUpdate(req.params.group_id, {
      $pull: { members: { user_id } },
    });
    res.json({ message: 'Left group successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to leave group' });
  }
});

// GET chat messages
router.get('/:group_id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ group_id: req.params.group_id })
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST send a message
router.post('/:group_id/messages', authMiddleware, async (req, res) => {
  const user_id = req.user.user_id;
  const { text, type = 'text', recipe_id } = req.body;
  if (!text) return res.status(400).json({ message: 'text is required' });

  try {
    const user = await User.findById(user_id).select('name');
    const msg = await Message.create({
      group_id: req.params.group_id,
      user_id,
      sender_name: user.name,
      text,
      type,
      recipe_id: recipe_id || null,
    });
    res.status(201).json({ message: msg });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// GET group details — wildcard last
router.get('/:group_id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.group_id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch group' });
  }
});

module.exports = router;
