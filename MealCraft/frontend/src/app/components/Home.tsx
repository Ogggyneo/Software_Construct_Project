import { useState } from 'react';
import { ChevronRight, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router';
import { useMode } from '../contexts/ModeContext';

const suggestedDishes = [
  {
    id: 1,
    name: 'Salad Ức Gà Nướng & Hạt Điều',
    time: '20 phút',
    calories: '350 kcal',
    image: './images/1.jpg',
    badge: 'Healthy',
  },
  {
    id: 2,
    name: 'Mì Ý Sốt Cà Chua Thơm Ngon',
    time: '25 phút',
    calories: '420 kcal',
    image: '2',
    badge: 'Healthy',
  },
];

const dishes = [
  { name: 'Phở Bò Tái Lăn', category: 'Asian', image: '3' },
  { name: 'Sushi Cá Hồi Tươi', category: 'Japanese', image: '4' },
  { name: 'Bánh Mì Kẹp Thịt', category: 'Street Food', image: '5' },
  { name: 'Bún Chả Hà Nội', category: 'Vietnamese', image: '6' },
  { name: 'Pizza Hải Sản', category: 'Italian', image: '7' },
  { name: 'Tacos Tôm Nướng', category: 'Mexican', image: '8' },
];

export function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { mode } = useMode();

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
            <h3 className="text-2xl font-bold mb-6">Khám phá món ăn</h3>

            <div className="grid grid-cols-3 gap-6">
              {dishes.map((dish, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/meal-detail')}
                  className="cursor-pointer"
                >
                  <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square">
                    {/* ✅ FIX HERE */}
                    <ImageWithFallback
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

      <div className="flex gap-3 overflow-x-auto px-4">
        {suggestedDishes.map((dish) => (
          <div key={dish.id} className="w-64">
            <ImageWithFallback
              src={dish.image}
              alt={dish.name}
              className="rounded-xl h-40 w-full object-cover"
            />
            <p className="mt-2 font-semibold">{dish.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        {dishes.map((dish, index) => (
          <div key={index}>
            <ImageWithFallback
              src={dish.image}
              alt={dish.name}
              className="rounded-xl aspect-square object-cover"
            />
            <p className="mt-1 text-sm font-medium">{dish.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}