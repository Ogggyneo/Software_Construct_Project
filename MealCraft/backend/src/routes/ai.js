const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

const SYSTEM_PROMPT = `Bạn là MealCraft AI, trợ lý ẩm thực cá nhân hóa thông minh của ứng dụng MealCraft.

## VAI TRÒ
Bạn là một personalized food agent, không chỉ gợi ý món ăn mà còn hiểu ngữ cảnh của từng người dùng: nguyên liệu sẵn có, thời gian, budget, kỹ năng nấu ăn, khẩu vị và dị ứng thực phẩm.

## KHẢ NĂNG CHÍNH

### 1. Gợi ý món ăn thông minh
- Khi người dùng cung cấp nguyên liệu có sẵn → gợi ý TẤT CẢ các cách chế biến có thể từ nguyên liệu đó
  Ví dụ: "Cá bớp có thể chế biến thành: hấp gừng hành, kho tộ, nấu cháo, chiên giòn, nướng muối ớt, lẩu..."
- Khi người dùng cho biết thời gian → ưu tiên món phù hợp với khung giờ đó
- Khi người dùng cho biết budget → gợi ý món trong tầm giá, kèm ước tính chi phí nguyên liệu
- Khi người dùng cho biết kỹ năng nấu ăn → điều chỉnh độ phức tạp của công thức
  (Mới học: đơn giản ≤5 bước | Trung bình: kỹ thuật cơ bản | Thành thạo: kỹ thuật nâng cao)

### 2. Hướng dẫn nấu ăn từng bước
- Liệt kê nguyên liệu cụ thể với định lượng
- Các bước đánh số rõ ràng: 1. ... 2. ... 3. ...
- Ghi rõ thời gian từng bước và mẹo quan trọng
- Đề xuất nguyên liệu thay thế nếu thiếu

### 3. Tư vấn dinh dưỡng
- Ước tính calo và giá trị dinh dưỡng (luôn ghi "(ước tính)")
- Gợi ý món phù hợp với mục tiêu sức khỏe (giảm cân, tăng cơ, eat clean...)

### 4. Recommend quán ăn cho nhóm
- Khi nhóm muốn order hoặc đi ăn: hỏi rõ khu vực, sở thích của từng người, budget
- Tìm quán có thể đáp ứng NHIỀU sở thích khác nhau trong cùng một chỗ
- Ưu tiên quán có rating tốt, được nhiều người review
- Không cung cấp link Grab/Shopee Food vì không thể xác minh tính chính xác, thay vào đó hướng dẫn người dùng tìm trên app bằng tên quán

QUAN TRỌNG: Không bao giờ bịa địa chỉ cụ thể của quán ăn.
    Nếu người dùng hỏi địa điểm, chỉ gợi ý tên món/loại quán và
    hướng dẫn họ tự tìm trên Google Maps hoặc Grab Food.

  Ví dụ response tốt hơn sẽ là:

  ▎ "Bạn có thể tìm Phở Lệ trên Google Maps hoặc Grab để xem địa chỉ chính xác 
  ▎ gần bạn nhất."


## CÁCH TRẢ LỜI

### Format gợi ý món ăn:
Tên món (không dùng ký tự ** quanh tên) - thời gian - nguyên liệu chính
Ví dụ: "Cơm gà Hải Nam (~45 phút | gà, gạo, gừng)"

### Khi người dùng hỏi về nguyên liệu cụ thể:
Liệt kê tất cả cách chế biến có thể, từ đơn giản đến phức tạp, ngắn gọn súc tích

### Khi tư vấn cho nhóm:
- Hỏi: số người, khu vực muốn ăn/order, sở thích từng người nếu có
- Tổng hợp và tìm điểm chung
- Đề xuất 2-3 quán phù hợp kèm link Google Maps

## QUY TẮC CHUNG
1. Luôn trả lời bằng tiếng Việt, thân thiện và tự nhiên
2. Ngắn gọn (4-5 câu) trừ khi được yêu cầu công thức đầy đủ hoặc danh sách nhiều lựa chọn
3. Không dùng ký tự ** để in đậm tên món ăn trong câu trả lời thông thường
4. Nếu thiếu thông tin để cá nhân hóa, hỏi thêm 1-2 câu ngắn gọn trước khi gợi ý
5. Luôn chủ động hỏi về dị ứng/kiêng kỵ thực phẩm khi tư vấn lần đầu`;

const RESTAURANT_KEYWORDS = [
  'quán', 'nhà hàng', 'ăn ở đâu', 'order', 'đặt món', 'giao đồ ăn',
  'grab food', 'shopee food', 'be food', 'gợi ý quán', 'tìm quán',
  'ăn gì', 'địa điểm ăn', 'chỗ ăn', 'nơi ăn', 'quán nào', 'chỗ nào ngon',
  'khu vực', 'quận 7', 'phú mỹ hưng', 'crescent', 'vivocity', 'lotte',
];

function isRestaurantQuery(message) {
  const lower = message.toLowerCase();
  return RESTAURANT_KEYWORDS.some(kw => lower.includes(kw));
}

async function buildRestaurantContext(message) {
  try {
    const lower = message.toLowerCase();

    // Build a flexible filter
    const filter = {};

    // Platform filter
    if (lower.includes('grab')) filter['platforms.grab'] = true;
    else if (lower.includes('shopee food')) filter['platforms.shopee_food'] = true;
    else if (lower.includes('be food')) filter['platforms.be_food'] = true;

    // Category hints
    const categoryMap = {
      'phở': 'Phở', 'bún': 'Phở', 'cơm tấm': 'Cơm tấm', 'gà rán': 'Gà rán',
      'pizza': 'Pizza', 'sushi': 'Sushi', 'ramen': 'Ramen', 'hàn': 'Hàn Quốc',
      'nhật': 'Nhật Bản', 'lẩu': 'Lẩu', 'nướng': 'Nướng', 'cà phê': 'Cà phê',
      'trà sữa': 'Trà', 'bánh mì': 'Bánh mì', 'hải sản': 'Hải sản',
      'burger': 'Burger', 'dimsum': 'Dimsum',
    };
    for (const [kw, cat] of Object.entries(categoryMap)) {
      if (lower.includes(kw)) {
        filter.$or = [
          { category: { $regex: cat, $options: 'i' } },
          { cuisine: { $regex: cat, $options: 'i' } },
          { tags: { $regex: kw, $options: 'i' } },
        ];
        break;
      }
    }

    // Area hints
    const areaMap = {
      'crescent': 'Crescent Mall', 'vivocity': 'SC VivoCity', 'vivo': 'SC VivoCity',
      'lotte': 'Lotte Mart', 'phú mỹ hưng': 'Phú Mỹ Hưng',
    };
    for (const [kw, area] of Object.entries(areaMap)) {
      if (lower.includes(kw)) { filter.area = area; break; }
    }

    const restaurants = await Restaurant.find(filter).limit(30).lean();

    if (!restaurants.length) return '';

    const lines = restaurants.map(r => {
      const platforms = Object.entries(r.platforms || {})
        .filter(([, v]) => v)
        .map(([k]) => ({ grab: 'Grab Food', shopee_food: 'Shopee Food', be_food: 'Be Food' }[k]))
        .join(', ');
      return `- ${r.name} | ${r.category}${r.cuisine ? ' (' + r.cuisine + ')' : ''} | ${r.address}, ${r.district} | Giá: ${r.price_range} | Có mặt trên: ${platforms || 'Không rõ'} | Giờ mở: ${r.open_hours || 'N/A'}`;
    });

    return `\n\n## DỮ LIỆU QUÁN ĂN THỰC TẾ (chỉ dùng thông tin này, không bịa thêm)\n${lines.join('\n')}\n\nHãy gợi ý từ danh sách trên. Luôn ghi rõ tên quán, địa chỉ, và app giao hàng có thể tìm thấy. Không tự thêm quán nào ngoài danh sách.`;
  } catch (err) {
    console.error('Restaurant context error:', err.message);
    return '';
  }
}

function buildProfileContext(profile) {
  if (!profile) return '';
  const lines = [];
  if (profile.name)        lines.push(`- Tên: ${profile.name}`);
  if (profile.location)    lines.push(`- Khu vực: ${profile.location}`);
  if (profile.cookingLevel) {
    const lvl = { beginner: 'Mới bắt đầu', 'home-cook': 'Nấu cơ bản', advanced: 'Thành thạo' };
    lines.push(`- Trình độ nấu ăn: ${lvl[profile.cookingLevel] || profile.cookingLevel}`);
  }
  if (profile.mealHabit) {
    const hab = { balanced: 'Cân bằng', healthy: 'Ưu tiên healthy', quick: 'Ưu tiên món nhanh', 'high-protein': 'Nhiều protein', vegetarian: 'Ăn chay' };
    lines.push(`- Phong cách ăn uống: ${hab[profile.mealHabit] || profile.mealHabit}`);
  }
  if (profile.cookFreq) {
    const freq = { daily: 'Hằng ngày', weekly: 'Vài lần mỗi tuần', rarely: 'Hiếm khi nấu', learning: 'Đang tập nấu' };
    lines.push(`- Tần suất nấu ăn: ${freq[profile.cookFreq] || profile.cookFreq}`);
  }
  if (profile.preferences?.length)
    lines.push(`- Sở thích món ăn: ${profile.preferences.join(', ')}`);
  if (profile.allergies?.length)
    lines.push(`- DỊ ỨNG/KIÊNG KỴ: ${profile.allergies.join(', ')}`);
  if (!lines.length) return '';

  const allergyWarning = profile.allergies?.length
    ? `\n\nQUAN TRỌNG VỀ DỊ ỨNG: Người dùng dị ứng với [${profile.allergies.join(', ')}]. Khi gợi ý bất kỳ món ăn nào có chứa những nguyên liệu này, BẮT BUỘC phải thêm cảnh báo rõ ràng ngay đầu phần đó, ví dụ: "⚠️ Cảnh báo: Món này có [tên nguyên liệu] mà bạn dị ứng. Nếu bạn đang nấu cho người khác thì không sao, nhưng hãy cẩn thận khi thưởng thức." Vẫn cung cấp đầy đủ công thức vì người dùng có thể nấu cho người khác.`
    : '';

  return `\n\n## THÔNG TIN NGƯỜI DÙNG (dùng để cá nhân hoá gợi ý)\n${lines.join('\n')}${allergyWarning}\n\nHãy ưu tiên gợi ý phù hợp với trình độ, sở thích và khu vực của người dùng.`;
}

router.post('/chat', authMiddleware, async (req, res) => {
  const { message, history = [], profile } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ message: 'AI service not configured' });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    let restaurantContext = '';
    if (isRestaurantQuery(message)) {
      restaurantContext = await buildRestaurantContext(message);
    }
    const profileContext = buildProfileContext(profile);

    const systemWithContext = SYSTEM_PROMPT + profileContext + restaurantContext;

    const contents = [
      { role: 'user', parts: [{ text: 'Bạn là ai và bạn có thể giúp gì?' }] },
      { role: 'model', parts: [{ text: systemWithContext }] },
      ...history
        .filter(h => h.role === 'user' || h.role === 'model')
        .map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    const response = result.response;

    res.json({
      reply: response.text(),
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [],
    });
  } catch (err) {
    const msg = err.message || '';
    console.error('Gemini error:', err);
    if (msg.includes('429') || msg.includes('Too Many Requests')) {
      return res.status(429).json({ message: 'Đang bận, thử lại sau vài giây nhé!' });
    }
    res.status(500).json({ message: msg || 'AI service unavailable' });
  }
});

module.exports = router; 