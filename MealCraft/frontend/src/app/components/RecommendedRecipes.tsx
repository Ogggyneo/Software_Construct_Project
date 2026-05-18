import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api';
import type { Recipe } from './Home';

function mapApiRecipe(r: any): Recipe {
  return {
    id: r._id ?? r.recipe_id,
    name: r.title ?? r.name ?? '',
    category: r.category || '',
    image: r.image_url || '',
    time: r.cook_time_min ? `${r.cook_time_min} phút` : '',
    calories: r.calories_per_serving ? `${r.calories_per_serving} kcal` : '',
    badge: (r.tags?.[0] ?? r.category) || '',
    description: r.description || '',
    servings: r.servings ? `${r.servings} người` : '',
    ingredients: [],
    steps: [],
  };
}

export function RecommendedRecipes() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ recipes: any[] }>('/api/recipes/recommended', token)
      .then(data => setRecipes((data.recipes ?? []).map(mapApiRecipe)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-12 pt-8 pb-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold">Gợi ý cho bạn</h1>
          <p className="text-gray-500 mt-2">Dựa trên sở thích và hồ sơ của bạn</p>
        </div>
      </div>

      <div className="px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">Đang tải...</div>
          ) : recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-6xl">🍽️</span>
              <h2 className="text-xl font-bold text-gray-800">Chưa có gợi ý cá nhân hoá</h2>
              <p className="text-gray-500 max-w-sm">
                Cập nhật sở thích ẩm thực trong phần Hồ sơ để nhận gợi ý phù hợp hơn.
              </p>
              <button
                onClick={() => navigate('/home/profile')}
                className="mt-2 px-6 py-2.5 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
              >
                Cập nhật hồ sơ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {recipes.map(dish => (
                <div
                  key={dish.id}
                  onClick={() => navigate('/meal-detail', { state: { recipe: dish } })}
                  className="cursor-pointer group"
                >
                  <div className="bg-gray-100 rounded-3xl overflow-hidden mb-3 aspect-square">
                    <ImageWithFallback
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-2">
                    <p className="text-sm text-gray-500 mb-1">{dish.category}</p>
                    <p className="font-semibold text-base">{dish.name}</p>
                    <p className="text-sm text-gray-400 mt-1">⏱ {dish.time} · 🔥 {dish.calories}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
