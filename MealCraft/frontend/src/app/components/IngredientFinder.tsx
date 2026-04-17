import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X, Plus, ChevronDown, ChefHat } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import { recipes, type Recipe } from './data/recipes';

const commonIngredients = [
  'ức gà',
  'thịt bò',
  'thịt heo',
  'cá hồi',
  'tôm',
  'trứng',
  'cơm',
  'mì ý',
  'bún',
  'phở',
  'mì quảng',
  'hành tây',
  'tỏi',
  'gừng',
  'cà chua',
  'xà lách',
  'dưa leo',
  'ớt chuông',
  'khoai tây',
  'khoai mỡ',
  'hạt điều',
  'phô mai',
  'sốt cà chua',
  'whipping cream',
  'rong biển',
  'rau sống',
  'nước mắm',
  'dầu olive',
  'bột chiên xù',
  'đậu phộng',
];

const popularSuggestions = [
  { vi: 'Ức gà', en: 'ức gà' },
  { vi: 'Thịt bò', en: 'thịt bò' },
  { vi: 'Tôm', en: 'tôm' },
  { vi: 'Cà chua', en: 'cà chua' },
  { vi: 'Trứng', en: 'trứng' },
  { vi: 'Khoai tây', en: 'khoai tây' },
  { vi: 'Hành tây', en: 'hành tây' },
  { vi: 'Tỏi', en: 'tỏi' },
];

type RecipeResult = Recipe & {
  matchedIngredients: string[];
  matchedCount: number;
  needToBuy: string[];
  needToBuyCount: number;
  hasAll: boolean;
};

export function IngredientFinder() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<RecipeResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { mode } = useMode();

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = commonIngredients.filter(
        (ing) =>
          ing.toLowerCase().includes(inputValue.toLowerCase()) &&
          !ingredients.includes(ing.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, ingredients]);

  const addIngredient = (ingredient: string) => {
    const normalizedIngredient = ingredient.toLowerCase().trim();
    if (normalizedIngredient && !ingredients.includes(normalizedIngredient)) {
      const nextIngredients = [...ingredients, normalizedIngredient];
      setIngredients(nextIngredients);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      setTimeout(() => findRecipes(nextIngredients), 100);
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter((i) => i !== ingredient);
    setIngredients(newIngredients);

    if (newIngredients.length > 0) {
      setTimeout(() => findRecipes(newIngredients), 100);
    } else {
      setResults([]);
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setResults([]);
  };

  const normalizeText = (text: string) => text.toLowerCase().trim();

  const findRecipes = (ingredientsList = ingredients) => {
    if (ingredientsList.length === 0) {
      setResults([]);
      return;
    }

    const recipesWithScore: RecipeResult[] = recipes.map((recipe) => {
      const normalizedRecipeIngredients = recipe.ingredients.map(normalizeText);

      const matchedIngredients = normalizedRecipeIngredients.filter((ing) =>
        ingredientsList.some((userIng) => {
          const normalizedUserIng = normalizeText(userIng);
          return (
            ing.includes(normalizedUserIng) ||
            normalizedUserIng.includes(ing)
          );
        })
      );

      const needToBuy = normalizedRecipeIngredients.filter(
        (ing) =>
          !ingredientsList.some((userIng) => {
            const normalizedUserIng = normalizeText(userIng);
            return (
              ing.includes(normalizedUserIng) ||
              normalizedUserIng.includes(ing)
            );
          })
      );

      return {
        ...recipe,
        matchedIngredients,
        matchedCount: matchedIngredients.length,
        needToBuy,
        needToBuyCount: needToBuy.length,
        hasAll: needToBuy.length === 0,
      };
    });

    const sortedRecipes = recipesWithScore
      .filter((r) => r.matchedCount > 0)
      .sort((a, b) => {
        if (a.needToBuyCount !== b.needToBuyCount) {
          return a.needToBuyCount - b.needToBuyCount;
        }
        return b.matchedCount - a.matchedCount;
      });

    setResults(sortedRecipes);
  };

  const goToMealDetail = (recipe: Recipe) => {
    navigate('/meal-detail', { state: { recipe } });
  };

  if (mode === 'web') {
    return (
      <div className="pb-8 bg-white min-h-full">
        <div className="px-12 pt-8 pb-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold">Nấu ăn</h2>
          </div>
        </div>

        <div className="px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-5 gap-8">
            <div className="col-span-2 pt-6">
              <h3 className="font-bold text-xl mb-6">Bạn có gì trong tủ lạnh?</h3>

              <div className="relative mb-4">
                <Input
                  ref={inputRef}
                  placeholder="Thêm nguyên liệu (ví dụ: Ức gà...)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (suggestions.length > 0) {
                        addIngredient(suggestions[0]);
                      } else if (inputValue.trim()) {
                        addIngredient(inputValue);
                      }
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="pl-4 pr-4 py-4 border-gray-300 rounded-xl"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => addIngredient(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 mb-6 min-h-[40px]">
                {ingredients.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {ingredients.map((ingredient) => (
                        <Badge
                          key={ingredient}
                          className="px-4 py-2 bg-green-100 text-green-700 border-green-200 hover:bg-green-200 rounded-full"
                        >
                          {ingredient}
                          <button
                            onClick={() => removeIngredient(ingredient)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <button
                      onClick={clearAll}
                      className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap font-medium"
                    >
                      Xóa hết
                    </button>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-4 uppercase font-semibold tracking-wider">
                  Gợi ý phổ biến
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSuggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => addIngredient(item.en)}
                      disabled={ingredients.includes(item.en)}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 text-green-500" />
                      {item.vi}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-3 pt-6">
              {results.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl">
                      Tìm thấy {results.length} món ăn phù hợp
                    </h3>
                    <button className="flex items-center gap-1 text-sm text-green-500 font-medium">
                      <span>Sắp xếp: Thiếu ít nhất</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {results.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => goToMealDetail(recipe)}
                      >
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <ImageWithFallback
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-semibold">
                            {recipe.time}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-base mb-1.5">{recipe.name}</h4>
                            <p className="text-sm text-gray-500 mb-3">{recipe.description}</p>

                            <div className="flex items-center gap-1.5 mb-3">
                              {recipe.matchedIngredients.slice(0, 5).map((_, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"
                                >
                                  <span className="text-xs">✓</span>
                                </div>
                              ))}
                              {recipe.needToBuy.length > 0 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs">+</span>
                                </div>
                              )}
                            </div>

                            {recipe.hasAll ? (
                              <p className="text-sm text-green-600 font-medium">
                                ✓ Đủ nguyên liệu
                              </p>
                            ) : (
                              <p className="text-sm text-red-500 font-medium">
                                Thiếu {recipe.needToBuyCount} nguyên liệu
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Button
                            size="lg"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToMealDetail(recipe);
                            }}
                          >
                            Xem ngay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Thêm nguyên liệu để tìm công thức nấu ăn</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 bg-white min-h-full">
      <div className="px-4 pt-4 pb-4 flex items-center justify-between border-b">
        <h2 className="text-xl font-bold">Nấu ăn</h2>
      </div>

      <div className="px-4 pt-6">
        <h3 className="font-bold text-lg mb-4">Bạn có gì trong tủ lạnh?</h3>

        <div className="relative mb-3">
          <Input
            ref={inputRef}
            placeholder="Thêm nguyên liệu (ví dụ: Ức gà...)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions.length > 0) {
                  addIngredient(suggestions[0]);
                } else if (inputValue.trim()) {
                  addIngredient(inputValue);
                }
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="pl-4 pr-4 py-3 text-sm border-gray-300 rounded-lg"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addIngredient(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3 min-h-[32px]">
          {ingredients.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 flex-1">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    className="px-3 py-1.5 bg-green-100 text-green-700 border-green-200 hover:bg-green-200 rounded-full"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Xóa hết
              </button>
            </>
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Gợi ý phổ biến</p>
          <div className="flex flex-wrap gap-2">
            {popularSuggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => addIngredient(item.en)}
                disabled={ingredients.includes(item.en)}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 text-green-500" />
                {item.vi}
              </button>
            ))}
          </div>
        </div>

        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Tìm thấy {results.length} món ăn phù hợp</h3>
              <button className="flex items-center gap-1 text-sm text-green-500">
                <span>Sắp xếp: Thiếu ít nhất</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {results.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => goToMealDetail(recipe)}
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <ImageWithFallback
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold">
                      {recipe.time}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm mb-1">{recipe.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{recipe.description}</p>

                      <div className="flex items-center gap-1 mb-2">
                        {recipe.matchedIngredients.slice(0, 3).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                          >
                            <span className="text-xs">✓</span>
                          </div>
                        ))}
                        {recipe.needToBuy.length > 0 && (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs">+</span>
                          </div>
                        )}
                      </div>

                      {recipe.hasAll ? (
                        <p className="text-xs text-green-600 font-medium">Đủ nguyên liệu</p>
                      ) : (
                        <p className="text-xs text-red-500 font-medium">
                          Thiếu {recipe.needToBuyCount} nguyên liệu
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToMealDetail(recipe);
                      }}
                    >
                      Xem ngay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && (
          <div className="flex items-center justify-center text-gray-400 py-12">
            <div className="text-center">
              <ChefHat className="w-14 h-14 mx-auto mb-4 opacity-50" />
              <p>Thêm nguyên liệu để tìm công thức nấu ăn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}