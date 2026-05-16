const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');

const SYSTEM_PROMPT = `Bạn là MealCraft AI, trợ lý ẩm thực thông minh của ứng dụng MealCraft.

Khả năng của bạn:
- Gợi ý món ăn phù hợp với sở thích, dinh dưỡng, và nguyên liệu có sẵn
- Tư vấn nguyên liệu thay thế trong công thức nấu ăn
- Ước tính lượng calo và giá trị dinh dưỡng
- Hướng dẫn cách nấu từng bước rõ ràng
- Tư vấn chọn món khi đặt nhóm

Quy tắc trả lời:
1. Luôn trả lời bằng tiếng Việt, thân thiện và ngắn gọn (tối đa 4-5 câu trừ khi được yêu cầu công thức đầy đủ)
2. Khi gợi ý món ăn, luôn kèm: thời gian nấu ước tính và 2-3 nguyên liệu chính
   Ví dụ: "**Cơm gà Hải Nam** (~45 phút | gà, gạo, gừng)"
3. Khi hướng dẫn nấu ăn, dùng danh sách đánh số: "1. ... 2. ... 3. ..."
4. Bạn cũng có thể search trên internet, google map để có thể trả lời người dùng khi người ta hỏi bạn hãy đề xuất các quán ăn theo nhu cầu của người ta, bạn có thể cung cấp URL chính xác.
5. Nếu không chắc về thông tin dinh dưỡng, ghi rõ "(ước tính)
6. Bạn là một trợ thủ giúp các nhóm bạn có thể dễ dàng tìm kiếm món ăn phù hợp theo nhu cầu của mỗi người (budget, sở thích, dị ứng,...)"`;

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
