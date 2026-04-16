import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Zap, ChevronLeft, Bell, Hammer, UtensilsCrossed } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

export function ComingSoon() {
  const navigate = useNavigate();
  const { mode } = useMode();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header / Navigation */}
      <div className={`px-6 py-4 flex items-center border-b bg-white sticky top-0 z-10 ${mode === 'web' ? 'px-12 py-6' : ''}`}>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-lg">GrabFood Groups</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
            <Hammer className="w-12 h-12 text-green-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center animate-bounce delay-100">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className={`font-black text-gray-900 mb-4 ${mode === 'web' ? 'text-5xl' : 'text-3xl'}`}>
          Tính năng đang được <span className="text-green-500">chuẩn bị!</span>
        </h1>

        <p className={`text-gray-500 mb-10 max-w-md mx-auto ${mode === 'web' ? 'text-lg' : 'text-base'}`}>
          Chúng tôi đang nỗ lực hoàn thiện tính năng <strong>Tạo nhóm mới</strong> để giúp bạn đặt món cùng đồng nghiệp dễ dàng hơn. Hãy quay lại sau nhé!
        </p>

        {/* Notification Form */}
        <div className={`w-full max-w-md bg-gray-50 p-6 rounded-3xl border border-gray-100 ${mode === 'web' ? 'p-8' : ''}`}>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Bell className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-700">Nhận thông báo khi ra mắt</span>
          </div>

          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Nhập email của bạn..."
              className="bg-white border-gray-200 py-6 rounded-xl focus:ring-green-500"
            />
            <Button className="bg-green-500 hover:bg-green-600 text-white py-6 rounded-xl font-bold transition-all transform hover:scale-[1.02]">
              Đăng ký ngay
            </Button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/order-food')}
          className="mt-8 text-gray-500 font-medium hover:text-green-600 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách nhóm
        </button>
      </div>

      {/* Footer Decoration */}
      <div className="py-8 text-center text-gray-400 text-sm">
        © 2024 GrabFood Team • Cùng nhau ăn ngon
      </div>
    </div>
  );
}