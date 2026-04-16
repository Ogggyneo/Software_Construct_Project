import { useEffect, useState } from 'react';
import { ChevronRight, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router';
import { useMode } from '../contexts/ModeContext';
import { Login } from './Login';

import img1 from './images/1.jpg';
import img2 from './images/2.jpg';
import img3 from './images/3.jpg';
import img4 from './images/4.jpg';
import img5 from './images/5.jpg';
import img6 from './images/6.jpg';
import img7 from './images/7.jpg';
import img8 from './images/8.jpg';
import img9 from './images/9.png';
import img10 from './images/10.jpg';
import img11 from './images/11.jpg';
import img12 from './images/12.jpg';
import img13 from './images/13.jpg';
import img14 from './images/14.jpg';
import img15 from './images/15.jpg';
import img16 from './images/16.jpg';
import img17 from './images/17.png';
import img18 from './images/18.jpg';
import img19 from './images/19.jpg';
import img20 from './images/20.jpg';
import img21 from './images/21.jpg';

const suggestedDishes = [
  {
    id: 1,
    name: 'Salad Ức Gà Nướng & Hạt Điều',
    time: '20 phút',
    calories: '350 kcal',
    image: img1,
    badge: 'Healthy',
  },
  {
    id: 2,
    name: 'Mì Ý Sốt Cà Chua',
    time: '25 phút',
    calories: '420 kcal',
    image: img2,
    badge: 'Popular',
  },
  {
    id: 3,
    name: 'Phở Bò Tái Lăn',
    time: '30 phút',
    calories: '480 kcal',
    image: img3,
    badge: 'Vietnamese',
  },
  {
    id: 4,
    name: 'Sushi Cá Hồi Tươi',
    time: '20 phút',
    calories: '320 kcal',
    image: img4,
    badge: 'Fresh',
  },
];

const dishes = [
  { name: 'Salad Ức Gà Nướng & Hạt Điều', category: 'Healthy', image: img1 },
  { name: 'Mì Ý Sốt Cà Chua', category: 'Italian', image: img2 },
  { name: 'Phở Bò Tái Lăn', category: 'Asian', image: img3 },
  { name: 'Sushi Cá Hồi Tươi', category: 'Japanese', image: img4 },
  { name: 'Bánh Mì Kẹp Thịt', category: 'Street Food', image: img5 },
  { name: 'Bún Chả Hà Nội', category: 'Vietnamese', image: img6 },
  { name: 'Pizza Hải Sản', category: 'Italian', image: img7 },
  { name: 'Tacos Tôm Nướng', category: 'Mexican', image: img8 },
  { name: 'Cơm Tấm', category: 'Vietnamese', image: img9 },
  { name: 'Bún Bò Huế', category: 'Vietnamese', image: img10 },
  { name: 'Canh Khoai Mỡ', category: 'Vietnamese', image: img11 },
  { name: 'Canh Khổ Qua', category: 'Vietnamese', image: img12 },
  { name: 'Cơm Cà Ri & Thịt Heo Chiên Xù', category: 'Asian', image: img13 },
  { name: 'Há Cảo', category: 'Chinese', image: img14 },
  { name: 'Mì Hoành Thánh Xá Xíu', category: 'Chinese', image: img15 },
  { name: 'Mì Lạnh Hàn Quốc', category: 'Korean', image: img16 },
  { name: 'Mì Quảng', category: 'Vietnamese', image: img17 },
  { name: 'Mì Ý Sốt Dầu Tỏi', category: 'Italian', image: img18 },
  { name: 'Mì Ý Sốt Kem', category: 'Italian', image: img19 },
  { name: 'Salad Hoa Quả', category: 'Healthy', image: img20 },
  { name: 'Salad Khoai Tây', category: 'Healthy', image: img21 },
];

export function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { mode } = useMode();

  const filteredDishes =
    activeTab === 'asian'
      ? dishes.filter((dish) =>
        ['Asian', 'Japanese', 'Vietnamese', 'Chinese', 'Korean'].includes(dish.category)
      )
      : dishes;

  if (mode === 'web') {
    return (
      <div className="pb-8 bg-white">
        {/* Header */}
        <div className="px-12 pt-8 pb-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white fill-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Xin chào, bạn!</p>
                  <h2 className="text-3xl font-bold">
                    Bạn muốn ăn gì <span className="text-green-500">hôm nay?</span>
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 hover:bg-gray-100 rounded-full">
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-green-500 text-white text-lg">M</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested */}
        <div className="mb-8 px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Gợi ý cho bạn</h3>
              <button className="text-green-500 flex items-center gap-1">
                Xem thêm <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {suggestedDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => navigate('/meal-detail')}
                  className="rounded-3xl overflow-hidden relative cursor-pointer group"
                >
                  <div className="h-80 relative">
                    {/* ✅ FIX HERE */}
                    <ImageWithFallback
                      src={dish.image}
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full">
                      <span className="text-sm font-semibold">{dish.badge}</span>
                    </div>

                    <div className="absolute bottom-0 p-6 text-white">
                      <h4 className="text-2xl font-bold">{dish.name}</h4>
                      <p>⏱ {dish.time} • 🔥 {dish.calories}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore */}
        <div className="px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Khám phá món ăn</h3>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${activeTab === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('asian')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${activeTab === 'asian'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Châu Á
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {filteredDishes.map((dish, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/meal-detail')}
                  className="cursor-pointer"
                >
                  <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square">
                    {/* ✅ FIX HERE */}
                    <ImageWithFallback
                      src={dish.image}
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 font-semibold">{dish.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* MOBILE */
  return (
    <div className="pb-4 bg-white">
      <div className="px-4 pt-4 pb-6">
        <h2 className="text-2xl font-bold">
          Bạn muốn ăn gì <span className="text-green-500">hôm nay?</span>
        </h2>
      </div>

      {/* Suggested Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-bold">Gợi ý cho bạn</h3>
          <button className="text-green-500 text-sm flex items-center gap-1">
            Xem thêm
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-2">
          {suggestedDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => navigate('/meal-detail')}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden relative cursor-pointer"
            >
              <div className="h-56 relative">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-gray-800">{dish.badge}</span>
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-bold text-lg mb-2">{dish.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      ⏱️ {dish.time}
                    </span>
                    <span className="flex items-center gap-1">
                      🔥 {dish.calories}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Khám phá món ăn</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('asian')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'asian'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Châu Á
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredDishes.map((dish, index) => (
            <div
              key={index}
              onClick={() => navigate('/meal-detail')}
              className="cursor-pointer"
            >
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-2 aspect-square">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-gray-500 mb-1">{dish.category}</p>
                <p className="font-semibold text-sm">{dish.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}