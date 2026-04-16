import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Zap, Mail, Lock, User, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mock register - navigate to home
    navigate('/');
  };

  return (
    <div className="min-h-full bg-white px-6 py-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold">MealCraft</h1>
        </div>
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
          VN
        </button>
      </div>

      {/* Logo Circle */}
      <div className="flex justify-center mb-8 relative">
        <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center relative">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
            <Zap className="w-12 h-12 text-white fill-white" />
          </div>
          <div className="absolute -top-1 right-8 w-4 h-4 bg-green-500 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Tạo tài khoản mới!</h2>
        <p className="text-gray-500 text-sm">
          Tham gia cùng chúng tôi và khám phá thế giới ẩm thực tuyệt vời.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl">
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-3 text-gray-500 font-medium rounded-xl hover:bg-white/50 transition-colors"
        >
          Đăng nhập
        </button>
        <button className="flex-1 py-3 bg-white text-green-500 font-semibold rounded-xl shadow-sm">
          Đăng ký
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Tên đầy đủ</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="pl-12 pr-4 py-6 border-2 border-gray-200 rounded-2xl text-sm focus:border-green-500"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mealcraft.com"
              className="pl-12 pr-4 py-6 border-2 border-gray-200 rounded-2xl text-sm focus:border-green-500"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tạo mật khẩu mạnh"
              className="pl-12 pr-4 py-6 border-2 border-gray-200 rounded-2xl text-sm focus:border-green-500"
              required
              minLength={6}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mật khẩu phải có ít nhất 6 ký tự
          </p>
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl text-base font-semibold"
        >
          Đăng ký ngay →
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase font-semibold">
          Hoặc tiếp tục bằng
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Button
          type="button"
          variant="outline"
          className="py-6 rounded-2xl border-2 border-gray-200 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="py-6 rounded-2xl border-2 border-gray-200 hover:bg-gray-50"
        >
          <Apple className="w-5 h-5 mr-2" />
          Apple
        </Button>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 p-4 rounded-2xl flex items-start gap-3 mb-6">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold">Bảo mật 256-bit chuẩn quốc tế.</span>
            <br />
            Dữ liệu của bạn luôn được mã hóa an toàn.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        Bằng việc đăng ký, bạn đồng ý tuân thủ{' '}
        <button className="font-semibold text-gray-700">Điều khoản</button> và{' '}
        <button className="font-semibold text-gray-700">Chính sách bảo mật</button> của{' '}
        <span className="text-green-500 font-semibold">MealCraft</span>.
      </p>
    </div>
  );
}
