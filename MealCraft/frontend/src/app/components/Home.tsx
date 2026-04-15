import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { ChevronRight, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router';
import { useMode } from '../contexts/ModeContext';

const suggestedDishes = [
  {
    id: 1,
    name: 'Salad Ức Gà Nướng & Hạt Điều',
    time: '20 phút',
    calories: '350 kcal',
    image: 'grilled chicken salad nuts',
    badge: 'Healthy',
  },
  {
    id: 2,
    name: 'Mì Ý Sốt Cà Chua Thơm Ngon',
    time: '25 phút',
    calories: '420 kcal',
    image: 'spaghetti tomato sauce',
    badge: 'Healthy',
  },
];

const dishes = [
  { name: 'Phở Bò Tái Lăn', category: 'Asian', image: 'vietnamese beef pho' },
  { name: 'Sushi Cá Hồi Tươi', category: 'Japanese', image: 'fresh salmon sushi' },
  { name: 'Bánh Mì Kẹp Thịt', category: 'Street Food', image: 'vietnamese banh mi' },
  { name: 'Bún Chả Hà Nội', category: 'Vietnamese', image: 'hanoi bun cha' },
  { name: 'Pizza Hải Sản', category: 'Italian', image: 'seafood pizza' },
  { name: 'Tacos Tôm Nướng', category: 'Mexican', image: 'grilled shrimp tacos' },
];

export function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { mode } = useMode();
  const [backendMsg, setBackendMsg] = useState('');
  useEffect(() => {
  fetch('/api/test')
    .then(res => res.json())
    .then(data => {
      console.log(data);
      setBackendMsg(data.message);
    })
    .catch(err => console.error(err));
}, []);

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
                  <p className="text-gray-500 text-sm">Xin chào, Minh!</p>
                  <p>{backendMsg}</p>
                  <h2 className="text-3xl font-bold">
                    Bạn muốn ăn gì <span className="text-green-500">hôm nay?</span>
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-green-500 text-white text-lg">M</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Section */}
        <div className="mb-8 px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Gợi ý cho bạn</h3>
              <button className="text-green-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Xem thêm
                <ChevronRight className="w-5 h-5" />
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
                    <ImageWithFallback
                      src={`https://source.unsplash.com/800x600/?${encodeURIComponent(dish.image)}`}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-sm font-semibold text-gray-800">{dish.badge}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h4 className="font-bold text-2xl mb-3">{dish.name}</h4>
                      <div className="flex items-center gap-6 text-base">
                        <span className="flex items-center gap-2">
                          ⏱️ {dish.time}
                        </span>
                        <span className="flex items-center gap-2">
                          🔥 {dish.calories}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore Section */}
        <div className="px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Khám phá món ăn</h3>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('asian')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
                  activeTab === 'asian'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Châu Á
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {dishes.map((dish, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/meal-detail')}
                  className="cursor-pointer group"
                >
                  <div className="bg-gray-100 rounded-3xl overflow-hidden mb-3 aspect-square">
                    <ImageWithFallback
                      src={`https://source.unsplash.com/400x400/?${encodeURIComponent(dish.image)}`}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-2">
                    <p className="text-sm text-gray-500 mb-1">{dish.category}</p>
                    <p className="font-semibold text-base">{dish.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-gray-600" />
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-green-500 text-white">M</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-gray-500 text-sm">Xin chào, Minh!</p>
          <h2 className="text-2xl font-bold">
            Bạn muốn ăn gì
            <span className="text-green-500">hôm nay?</span>
          </h2>
        </div>
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
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(dish.image)}`}
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('asian')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'asian'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Châu Á
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {dishes.map((dish, index) => (
            <div
              key={index}
              onClick={() => navigate('/meal-detail')}
              className="cursor-pointer"
            >
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-2 aspect-square">
                <ImageWithFallback
                  src={`https://source.unsplash.com/400x400/?${encodeURIComponent(dish.image)}`}
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