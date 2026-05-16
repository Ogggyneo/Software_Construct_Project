require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Recipe = require('../src/models/Recipe');
const User = require('../src/models/User');
const Group = require('../src/models/Group');

// Same data as frontend/src/app/components/data/recipes.ts
// image_url points to the backend's /images/ static endpoint
const BASE = process.env.SEED_BASE_URL || 'http://10.212.0.20:3000';

const ext = (id) => (id === 9 || id === 17 ? 'png' : 'jpg');
const img = (id) => `${BASE}/images/${id}.${ext(id)}`;

const RECIPES = [
  {
    title: 'Salad Ức Gà Nướng & Hạt Điều', category: 'Healthy', image_url: img(1),
    description: 'Món salad thanh nhẹ với ức gà nướng mềm, rau tươi và hạt điều giòn béo.',
    cook_time_min: 20, calories_per_serving: 350, servings: 2, tags: ['Healthy'],
    ingredients: [
      { name: 'Ức gà', quantity: '200', unit: 'g' }, { name: 'Xà lách', quantity: '100', unit: 'g' },
      { name: 'Cà chua bi', quantity: '50', unit: 'g' }, { name: 'Hạt điều rang', quantity: '30', unit: 'g' },
      { name: 'Dưa leo', quantity: '1/2', unit: 'quả' }, { name: 'Dầu olive', quantity: '1', unit: 'tbsp' },
    ],
    steps: [
      { order: 1, description: 'Ướp ức gà với muối, tiêu và dầu olive.' },
      { order: 2, description: 'Nướng hoặc áp chảo gà đến khi chín rồi cắt lát.' },
      { order: 3, description: 'Rửa sạch rau và để ráo.' },
      { order: 4, description: 'Pha sốt trộn salad.' },
      { order: 5, description: 'Trộn đều và dùng ngay.' },
    ],
  },
  {
    title: 'Mì Ý Sốt Cà Chua', category: 'Italian', image_url: img(2),
    description: 'Mì Ý sốt cà chua đơn giản, thơm mùi cà chua và tỏi.',
    cook_time_min: 25, calories_per_serving: 420, servings: 2, tags: ['Popular'],
    ingredients: [
      { name: 'Mì spaghetti', quantity: '200', unit: 'g' }, { name: 'Sốt cà chua', quantity: '150', unit: 'g' },
      { name: 'Tỏi', quantity: '2', unit: 'tép' }, { name: 'Hành tây', quantity: '1/2', unit: 'củ' },
    ],
    steps: [
      { order: 1, description: 'Luộc mì đến chín vừa.' },
      { order: 2, description: 'Phi thơm tỏi và hành tây.' },
      { order: 3, description: 'Cho sốt cà chua vào đun sệt.' },
      { order: 4, description: 'Cho mì vào trộn đều.' },
      { order: 5, description: 'Dùng nóng.' },
    ],
  },
  {
    title: 'Phở Bò Tái Lăn', category: 'Vietnamese', image_url: img(3),
    description: 'Phở bò tái lăn thơm mùi gừng, hành và thịt bò xào tái.',
    cook_time_min: 30, calories_per_serving: 480, servings: 2, tags: ['Vietnamese'],
    ingredients: [
      { name: 'Bánh phở', quantity: '200', unit: 'g' }, { name: 'Thịt bò', quantity: '200', unit: 'g' },
      { name: 'Nước dùng', quantity: '1', unit: 'lít' }, { name: 'Hành lá', quantity: '4', unit: 'nhánh' },
    ],
    steps: [
      { order: 1, description: 'Trụng bánh phở.' }, { order: 2, description: 'Xào tái thịt bò với gừng.' },
      { order: 3, description: 'Đun sôi nước dùng.' }, { order: 4, description: 'Cho bò lên bánh phở.' },
      { order: 5, description: 'Chan nước dùng và thêm hành.' },
    ],
  },
  {
    title: 'Sushi Cá Hồi Tươi', category: 'Japanese', image_url: img(4),
    description: 'Sushi cá hồi tươi với cơm dẻo và vị thanh nhẹ.',
    cook_time_min: 20, calories_per_serving: 320, servings: 2, tags: ['Fresh'],
    ingredients: [
      { name: 'Cơm sushi', quantity: '200', unit: 'g' }, { name: 'Cá hồi', quantity: '150', unit: 'g' },
      { name: 'Rong biển', quantity: '3', unit: 'tờ' }, { name: 'Giấm gạo', quantity: '2', unit: 'tbsp' },
    ],
    steps: [
      { order: 1, description: 'Trộn cơm với giấm.' }, { order: 2, description: 'Cắt cá hồi.' },
      { order: 3, description: 'Trải rong biển và cơm.' }, { order: 4, description: 'Cuộn sushi.' },
      { order: 5, description: 'Cắt khoanh và dùng.' },
    ],
  },
  {
    title: 'Bánh Mì Kẹp Thịt', category: 'Street Food', image_url: img(5),
    description: 'Bánh mì giòn vỏ, nhân thịt đậm đà và rau dưa chua.',
    cook_time_min: 15, calories_per_serving: 430, servings: 1, tags: ['Street Food'],
    ingredients: [
      { name: 'Bánh mì', quantity: '1', unit: 'ổ' }, { name: 'Thịt', quantity: '100', unit: 'g' },
      { name: 'Dưa leo', quantity: '1/2', unit: 'quả' }, { name: 'Đồ chua', quantity: '30', unit: 'g' },
    ],
    steps: [
      { order: 1, description: 'Làm nóng bánh mì.' }, { order: 2, description: 'Phết sốt hoặc pate.' },
      { order: 3, description: 'Cho thịt và rau vào.' }, { order: 4, description: 'Thêm đồ chua.' },
      { order: 5, description: 'Dùng ngay.' },
    ],
  },
  {
    title: 'Bún Chả Hà Nội', category: 'Vietnamese', image_url: img(6),
    description: 'Bún chả Hà Nội với thịt nướng thơm và nước chấm chua ngọt.',
    cook_time_min: 30, calories_per_serving: 500, servings: 2, tags: ['Vietnamese'],
    ingredients: [
      { name: 'Bún tươi', quantity: '400', unit: 'g' }, { name: 'Thịt heo', quantity: '300', unit: 'g' },
      { name: 'Nước mắm', quantity: '3', unit: 'tbsp' }, { name: 'Rau sống', quantity: '1', unit: 'bó' },
    ],
    steps: [
      { order: 1, description: 'Ướp thịt.' }, { order: 2, description: 'Nướng thịt.' },
      { order: 3, description: 'Pha nước chấm.' }, { order: 4, description: 'Dọn bún và rau.' },
      { order: 5, description: 'Ăn kèm thịt nướng.' },
    ],
  },
  {
    title: 'Pizza Hải Sản', category: 'Italian', image_url: img(7),
    description: 'Pizza hải sản với phô mai kéo sợi và topping đậm vị.',
    cook_time_min: 35, calories_per_serving: 550, servings: 3, tags: ['Cheesy'],
    ingredients: [
      { name: 'Đế pizza', quantity: '1', unit: 'cái' }, { name: 'Tôm', quantity: '100', unit: 'g' },
      { name: 'Mực', quantity: '80', unit: 'g' }, { name: 'Phô mai', quantity: '150', unit: 'g' },
    ],
    steps: [
      { order: 1, description: 'Phết sốt lên đế bánh.' }, { order: 2, description: 'Xếp topping hải sản.' },
      { order: 3, description: 'Rải phô mai.' }, { order: 4, description: 'Nướng bánh.' },
      { order: 5, description: 'Dùng nóng.' },
    ],
  },
  {
    title: 'Tacos Tôm Nướng', category: 'Mexican', image_url: img(8),
    description: 'Tacos với tôm nướng thơm, rau củ tươi và sốt chua nhẹ.',
    cook_time_min: 20, calories_per_serving: 390, servings: 2, tags: ['Mexican'],
    ingredients: [
      { name: 'Vỏ tacos', quantity: '6', unit: 'cái' }, { name: 'Tôm', quantity: '200', unit: 'g' },
      { name: 'Xà lách', quantity: '50', unit: 'g' }, { name: 'Cà chua', quantity: '1', unit: 'quả' },
    ],
    steps: [
      { order: 1, description: 'Ướp tôm.' }, { order: 2, description: 'Nướng hoặc áp chảo tôm.' },
      { order: 3, description: 'Làm nóng vỏ tacos.' }, { order: 4, description: 'Cho rau và tôm vào.' },
      { order: 5, description: 'Rưới sốt lên trên.' },
    ],
  },
  {
    title: 'Cơm Tấm', category: 'Vietnamese', image_url: img(9),
    description: 'Cơm tấm sườn nướng với nước mắm chua ngọt.',
    cook_time_min: 30, calories_per_serving: 560, servings: 2, tags: ['Vietnamese'],
    ingredients: [
      { name: 'Cơm tấm', quantity: '2', unit: 'chén' }, { name: 'Sườn heo', quantity: '300', unit: 'g' },
      { name: 'Trứng', quantity: '2', unit: 'quả' }, { name: 'Nước mắm', quantity: '3', unit: 'tbsp' },
    ],
    steps: [
      { order: 1, description: 'Ướp sườn.' }, { order: 2, description: 'Nướng sườn.' },
      { order: 3, description: 'Nấu cơm tấm.' }, { order: 4, description: 'Pha nước mắm.' },
      { order: 5, description: 'Dọn ra đĩa và dùng.' },
    ],
  },
  {
    title: 'Bún Bò Huế', category: 'Vietnamese', image_url: img(10),
    description: 'Bún bò Huế đậm đà, cay nhẹ và thơm mùi sả.',
    cook_time_min: 40, calories_per_serving: 520, servings: 2, tags: ['Spicy', 'Vietnamese'],
    ingredients: [
      { name: 'Bún', quantity: '400', unit: 'g' }, { name: 'Thịt bò', quantity: '300', unit: 'g' },
      { name: 'Sả', quantity: '3', unit: 'cây' }, { name: 'Mắm ruốc', quantity: '2', unit: 'tbsp' },
    ],
    steps: [
      { order: 1, description: 'Đun nước dùng với sả.' }, { order: 2, description: 'Luộc thịt bò.' },
      { order: 3, description: 'Trụng bún.' }, { order: 4, description: 'Xếp thịt lên tô.' },
      { order: 5, description: 'Chan nước dùng và dùng.' },
    ],
  },
  {
    title: 'Canh Khoai Mỡ', category: 'Vietnamese', image_url: img(11),
    description: 'Canh khoai mỡ dẻo thơm, hợp bữa cơm gia đình.',
    cook_time_min: 20, calories_per_serving: 210, servings: 3, tags: ['Home Style'],
    ingredients: [
      { name: 'Khoai mỡ', quantity: '300', unit: 'g' }, { name: 'Tôm', quantity: '100', unit: 'g' },
      { name: 'Hành lá', quantity: '3', unit: 'nhánh' },
    ],
    steps: [
      { order: 1, description: 'Sơ chế khoai mỡ.' }, { order: 2, description: 'Xào tôm.' },
      { order: 3, description: 'Cho nước vào nấu sôi.' }, { order: 4, description: 'Thêm khoai mỡ.' },
      { order: 5, description: 'Nêm và hoàn thiện.' },
    ],
  },
  {
    title: 'Canh Khổ Qua', category: 'Vietnamese', image_url: img(12),
    description: 'Canh khổ qua nhồi thịt thanh mát.',
    cook_time_min: 25, calories_per_serving: 180, servings: 3, tags: ['Healthy'],
    ingredients: [
      { name: 'Khổ qua', quantity: '2', unit: 'quả' }, { name: 'Thịt xay', quantity: '150', unit: 'g' },
      { name: 'Mộc nhĩ', quantity: '10', unit: 'g' },
    ],
    steps: [
      { order: 1, description: 'Sơ chế khổ qua.' }, { order: 2, description: 'Trộn nhân thịt.' },
      { order: 3, description: 'Nhồi nhân vào khổ qua.' }, { order: 4, description: 'Nấu chín trong nước dùng.' },
      { order: 5, description: 'Nêm vừa ăn.' },
    ],
  },
  {
    title: 'Cơm Cà Ri & Thịt Heo Chiên Xù', category: 'Asian', image_url: img(13),
    description: 'Cơm cà ri kiểu Nhật với thịt heo chiên xù giòn rụm.',
    cook_time_min: 35, calories_per_serving: 620, servings: 2, tags: ['Comfort Food'],
    ingredients: [
      { name: 'Cơm trắng', quantity: '2', unit: 'chén' }, { name: 'Thịt heo', quantity: '200', unit: 'g' },
      { name: 'Bột chiên xù', quantity: '50', unit: 'g' }, { name: 'Sốt cà ri', quantity: '1', unit: 'gói' },
    ],
    steps: [
      { order: 1, description: 'Nấu sốt cà ri.' }, { order: 2, description: 'Tẩm bột và chiên thịt heo.' },
      { order: 3, description: 'Cắt lát thịt.' }, { order: 4, description: 'Múc cơm ra đĩa.' },
      { order: 5, description: 'Chan sốt và xếp thịt lên trên.' },
    ],
  },
  {
    title: 'Há Cảo', category: 'Chinese', image_url: img(14),
    description: 'Há cảo mềm với nhân tôm thịt ngọt thanh.',
    cook_time_min: 30, calories_per_serving: 300, servings: 2, tags: ['Dim Sum'],
    ingredients: [
      { name: 'Vỏ há cảo', quantity: '20', unit: 'tờ' }, { name: 'Tôm băm', quantity: '150', unit: 'g' },
      { name: 'Thịt xay', quantity: '80', unit: 'g' },
    ],
    steps: [
      { order: 1, description: 'Trộn nhân.' }, { order: 2, description: 'Cho nhân vào vỏ.' },
      { order: 3, description: 'Gấp mép vỏ.' }, { order: 4, description: 'Xếp vào xửng.' },
      { order: 5, description: 'Hấp chín và dùng.' },
    ],
  },
  {
    title: 'Mì Hoành Thánh Xá Xíu', category: 'Chinese', image_url: img(15),
    description: 'Mì hoành thánh xá xíu với nước dùng ngọt thanh.',
    cook_time_min: 35, calories_per_serving: 470, servings: 2, tags: ['Chinese'],
    ingredients: [
      { name: 'Mì trứng', quantity: '300', unit: 'g' }, { name: 'Hoành thánh', quantity: '10', unit: 'cái' },
      { name: 'Thịt xá xíu', quantity: '150', unit: 'g' }, { name: 'Nước dùng', quantity: '1', unit: 'lít' },
    ],
    steps: [
      { order: 1, description: 'Luộc mì.' }, { order: 2, description: 'Đun nước dùng.' },
      { order: 3, description: 'Luộc hoành thánh.' },
      { order: 4, description: 'Xếp mì, xá xíu và hoành thánh vào tô.' },
      { order: 5, description: 'Chan nước dùng.' },
    ],
  },
  {
    title: 'Mì Lạnh Hàn Quốc', category: 'Korean', image_url: img(16),
    description: 'Mì lạnh thanh mát, thích hợp ngày nóng.',
    cook_time_min: 20, calories_per_serving: 330, servings: 2, tags: ['Korean'],
    ingredients: [
      { name: 'Mì lạnh', quantity: '300', unit: 'g' }, { name: 'Trứng luộc', quantity: '2', unit: 'quả' },
      { name: 'Dưa leo', quantity: '1', unit: 'quả' }, { name: 'Nước dùng lạnh', quantity: '500', unit: 'ml' },
    ],
    steps: [
      { order: 1, description: 'Luộc mì và xả lạnh.' }, { order: 2, description: 'Cho mì vào tô.' },
      { order: 3, description: 'Thêm topping.' }, { order: 4, description: 'Chan nước dùng lạnh.' },
      { order: 5, description: 'Dùng ngay.' },
    ],
  },
  {
    title: 'Mì Quảng', category: 'Vietnamese', image_url: img(17),
    description: 'Mì Quảng đậm đà với ít nước dùng và đậu phộng rang.',
    cook_time_min: 35, calories_per_serving: 490, servings: 2, tags: ['Vietnamese'],
    ingredients: [
      { name: 'Mì Quảng', quantity: '400', unit: 'g' }, { name: 'Gà', quantity: '300', unit: 'g' },
      { name: 'Đậu phộng rang', quantity: '30', unit: 'g' }, { name: 'Rau sống', quantity: '1', unit: 'bó' },
    ],
    steps: [
      { order: 1, description: 'Xào phần nhân.' }, { order: 2, description: 'Thêm chút nước dùng.' },
      { order: 3, description: 'Trụng mì.' }, { order: 4, description: 'Cho nhân lên mì.' },
      { order: 5, description: 'Rắc đậu phộng và dùng.' },
    ],
  },
  {
    title: 'Mì Ý Sốt Dầu Tỏi', category: 'Italian', image_url: img(18),
    description: 'Mì Ý sốt dầu tỏi đơn giản, thơm và nhanh.',
    cook_time_min: 15, calories_per_serving: 390, servings: 2, tags: ['Quick'],
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' }, { name: 'Tỏi', quantity: '4', unit: 'tép' },
      { name: 'Dầu olive', quantity: '3', unit: 'tbsp' }, { name: 'Ớt khô', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      { order: 1, description: 'Luộc mì.' }, { order: 2, description: 'Phi thơm tỏi.' },
      { order: 3, description: 'Cho mì vào đảo.' }, { order: 4, description: 'Nêm gia vị.' },
      { order: 5, description: 'Bày ra đĩa.' },
    ],
  },
  {
    title: 'Mì Ý Sốt Kem', category: 'Italian', image_url: img(19),
    description: 'Mì Ý sốt kem béo mịn, thơm mùi phô mai.',
    cook_time_min: 20, calories_per_serving: 480, servings: 2, tags: ['Creamy'],
    ingredients: [
      { name: 'Mì Ý', quantity: '200', unit: 'g' }, { name: 'Whipping cream', quantity: '150', unit: 'ml' },
      { name: 'Tỏi', quantity: '3', unit: 'tép' }, { name: 'Parmesan', quantity: '30', unit: 'g' },
    ],
    steps: [
      { order: 1, description: 'Luộc mì.' }, { order: 2, description: 'Phi thơm tỏi với bơ.' },
      { order: 3, description: 'Cho cream vào.' }, { order: 4, description: 'Thêm phô mai.' },
      { order: 5, description: 'Trộn mì với sốt.' },
    ],
  },
  {
    title: 'Salad Hoa Quả', category: 'Healthy', image_url: img(20),
    description: 'Salad trái cây tươi mát, nhiều màu sắc.',
    cook_time_min: 10, calories_per_serving: 220, servings: 2, tags: ['Fresh', 'Healthy'],
    ingredients: [
      { name: 'Táo', quantity: '1', unit: 'quả' }, { name: 'Dâu', quantity: '100', unit: 'g' },
      { name: 'Kiwi', quantity: '2', unit: 'quả' }, { name: 'Yogurt', quantity: '100', unit: 'ml' },
    ],
    steps: [
      { order: 1, description: 'Rửa sạch trái cây.' }, { order: 2, description: 'Cắt nhỏ.' },
      { order: 3, description: 'Cho vào tô.' }, { order: 4, description: 'Rưới yogurt.' },
      { order: 5, description: 'Trộn nhẹ và dùng.' },
    ],
  },
  {
    title: 'Salad Khoai Tây', category: 'Healthy', image_url: img(21),
    description: 'Salad khoai tây bùi béo, thích hợp món phụ.',
    cook_time_min: 20, calories_per_serving: 310, servings: 2, tags: ['Healthy'],
    ingredients: [
      { name: 'Khoai tây', quantity: '300', unit: 'g' }, { name: 'Trứng luộc', quantity: '2', unit: 'quả' },
      { name: 'Hành tây', quantity: '1/2', unit: 'củ' }, { name: 'Mayonnaise', quantity: '3', unit: 'tbsp' },
    ],
    steps: [
      { order: 1, description: 'Luộc khoai tây.' }, { order: 2, description: 'Cắt nhỏ nguyên liệu.' },
      { order: 3, description: 'Pha sốt.' }, { order: 4, description: 'Trộn đều.' },
      { order: 5, description: 'Làm lạnh trước khi dùng.' },
    ],
  },
];

// Test groups near HCMC (your phone: 10.7269, 106.7203)
const TEST_GROUPS = [
  { name: 'Nhóm Cơm Trưa Q1', description: 'Đặt cơm trưa văn phòng khu Q1, giá bình dân.', address: '29 Lê Duẩn, Q1', lat: 10.7769, lng: 106.7003 },
  { name: 'Bữa Tối Bình Thạnh', description: 'Nhóm tối chung khu Bình Thạnh, giao sau 18h.', address: '56 Điện Biên Phủ, BT', lat: 10.8009, lng: 106.7128 },
  { name: 'Phở Sáng Q3', description: 'Gom đơn phở bò mỗi sáng T2-T6, order trước 7h.', address: '12 Võ Văn Tần, Q3', lat: 10.7731, lng: 106.6868 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft');
  console.log('✅ Connected to MongoDB');

  // Admin user for group ownership
  let admin = await User.findOne({ email: 'admin@mealcraft.app' });
  if (!admin) {
    const pw = await bcrypt.hash('adminpassword', 10);
    admin = await User.create({ name: 'MealCraft Admin', email: 'admin@mealcraft.app', phone: '', password: pw });
    console.log('✅ Admin user created');
  }

  // Recipes
  const count = await Recipe.countDocuments();
  if (count === 0) {
    await Recipe.insertMany(RECIPES.map(r => ({ ...r, is_public: true })));
    console.log(`✅ ${RECIPES.length} recipes seeded`);
  } else {
    console.log(`ℹ️  Recipes exist (${count}), skipping`);
  }

  // Groups
  const gcount = await Group.countDocuments();
  if (gcount === 0) {
    await Group.insertMany(TEST_GROUPS.map(g => ({
      name: g.name, description: g.description, address: g.address,
      location: { type: 'Point', coordinates: [g.lng, g.lat] },
      owner_id: admin._id,
      members: [{ user_id: admin._id, name: admin.name, is_ready: false }],
      status: 'open', max_members: 10,
    })));
    console.log(`✅ ${TEST_GROUPS.length} groups seeded near HCMC`);
  } else {
    console.log(`ℹ️  Groups exist (${gcount}), skipping`);
  }

  console.log('\n🎉 Seed done!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
