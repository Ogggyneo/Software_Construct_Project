const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');

const SYSTEM_PROMPT = `Bạn là MealCraft AI, trợ lý ẩm thực thông minh của ứng dụng MealCraft.
Bạn giúp người dùng:
- Gợi ý món ăn phù hợp với sở thích, dinh dưỡng và nguyên liệu có sẵn
- Tư vấn nguyên liệu thay thế trong công thức
- Ước tính lượng calo và dinh dưỡng của món ăn
- Gợi ý cách nấu đơn giản và nhanh
- Tư vấn chọn món khi đặt nhóm
Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 3-4 câu mỗi lượt) và hữu ích.`;

router.post('/chat', authMiddleware, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ message: 'AI service not configured' });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build full conversation: system context first, then history, then current message
    const contents = [
      { role: 'user', parts: [{ text: 'Bạn là ai và bạn có thể giúp gì?' }] },
      { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
      ...history
        .filter(h => h.role === 'user' || h.role === 'model')
        .map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    res.json({ reply: result.response.text() });
  } catch (err) {
    const msg = err.message || '';
    console.error('Gemini error:', msg);

    if (msg.includes('429') || msg.includes('Too Many Requests')) {
      return res.status(429).json({ message: 'Đang bận, thử lại sau vài giây nhé!' });
    }
    res.status(500).json({ message: msg || 'AI service unavailable' });
  }
});

module.exports = router;
