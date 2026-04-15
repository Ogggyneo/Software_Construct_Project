import { Button } from './ui/button';
import { ChevronLeft, Heart, Clock, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router';

interface MealDetailProps {
  id?: string;
}

const relatedDishes = [
  { name: 'Sushi Cá Hồi', image: 'fresh salmon sushi platter' },
  { name: 'Cơm Trộn Bibimbap', image: 'korean bibimbap rice bowl' },
  { name: 'Bánh Xèo', image: 'vietnamese banh xeo crispy pancake' },
];

export function MealDetail({ id }: MealDetailProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-base text-white drop-shadow-lg">Mì Ramen Cay Đặc Biệt</h3>
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-80">
        <ImageWithFallback
          src="https://source.unsplash.com/800x600/?tonkotsu,ramen,spicy"
          alt="Tonkotsu Ramen Cay"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-16 left-4 flex gap-2">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Cay nồng
          </span>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Phổ biến
          </span>
        </div>

        {/* Dish name on image */}
        <div className="absolute bottom-6 left-4 right-4">
          <h2 className="text-white text-2xl font-bold mb-2">Tonkotsu Ramen Cay</h2>
          <p className="text-white/90 text-sm">
            Hương vị Nhật Bản truyền thống kết hợp sốt ớt đặc trưng.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Info Icons */}
        <div className="flex justify-around mb-6 pb-6 border-b">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Thời gian</p>
            <p className="text-sm font-bold">30 phút</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mb-1">Nguyên liệu</p>
            <p className="text-sm font-bold">7 loại</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mb-1">Vùng miền</p>
            <p className="text-sm font-bold">Nhật Bản</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Thành phần nguyên liệu</h3>
            <span className="text-sm text-green-500 font-medium">Cho 1 người ăn</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Mì Ramen tuoi</span>
              <span className="text-sm font-semibold">200g</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Thịt xá xíu</span>
              <span className="text-sm font-semibold">3 lát</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Trứng lòng đào</span>
              <span className="text-sm font-semibold">1 quả</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Nước dùng xương</span>
              <span className="text-sm font-semibold">500ml</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Màng khô (Menma)</span>
              <span className="text-sm font-semibold">30g</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Hành lá</span>
              <span className="text-sm font-semibold">10g</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm">Rong biển khô</span>
              <span className="text-sm font-semibold">1 miếng</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Các bước thực hiện</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">
                Đun sôi nước dùng xương theo hộp tẩm 15 phút với lửa vừa và giữ vỏi đũng và trộ đễ làm hương vị đậm đả.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">
                Luộc mì Ramen trong nước sôi khoảng 2-3 phút cho đến khi đủ độ mềm vừa ý, sau đó cho vào ớ đế rửa.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">
                Áp chao nhẹ các lát thịt xá xíu cho đến khi cạnh thật hơi chảy canh và tỏa mùi thơm.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                4
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">
                Cho mì vào bát, chế nước dùng nóng, xếp thịt, trứng, màng và hành lên trên cùng.
              </p>
            </div>
          </div>
        </div>

        {/* Related Dishes */}
        <div className="mb-20">
          <h3 className="font-bold text-lg mb-4">Tham khảo liên quan</h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {relatedDishes.map((dish, index) => (
              <div key={index} className="flex-shrink-0 w-36 cursor-pointer">
                <div className="bg-gray-100 rounded-2xl overflow-hidden mb-2 aspect-square relative">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/400x400/?${encodeURIComponent(dish.image)}`}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold">
                    20 ph
                  </div>
                </div>
                <p className="font-semibold text-sm px-1">{dish.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 py-6 rounded-2xl border-2 border-gray-300 font-semibold"
        >
          Chia sẻ
        </Button>
        <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl font-semibold">
          Bắt đầu nấu
        </Button>
      </div>
    </div>
  );
}
