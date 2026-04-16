import { ArrowLeft, Clock3, Flame, Users, Bookmark, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Recipe } from './Home';

export function MealDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const recipe = location.state?.recipe as Recipe | undefined;

  if (!recipe) {
    return (
      <div className="h-full overflow-y-auto bg-white pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="rounded-3xl border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy công thức</h2>
          <p className="text-gray-500 mb-4">
            Có thể bạn vào trang này trực tiếp mà chưa chọn món từ Home.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 rounded-full bg-green-500 text-white font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white pb-8">
      <div className="relative h-72">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>

        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-gray-800" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="inline-flex px-3 py-1 rounded-full bg-white/90 text-gray-800 text-sm font-semibold mb-3">
            {recipe.badge || recipe.category}
          </div>
          <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
          <p className="text-sm text-white/90">{recipe.description}</p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <Clock3 className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <p className="text-xs text-gray-500">Thời gian</p>
            <p className="font-semibold">{recipe.time}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-xs text-gray-500">Calories</p>
            <p className="font-semibold">{recipe.calories}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-xs text-gray-500">Khẩu phần</p>
            <p className="font-semibold">{recipe.servings}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Nguyên liệu</h2>
          <div className="rounded-3xl bg-gray-50 p-4">
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Các bước thực hiện</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={index} className="rounded-3xl border border-gray-100 p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-7">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2">
          <Play className="w-5 h-5" />
          Bắt đầu nấu
        </button>
      </div>
    </div>
  );
}