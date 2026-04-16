import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Zap, Mail, Lock, CheckCircle, Apple, Loader2 } from 'lucide-react'; // Added Loader2
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New: Loading state
  const [error, setError] = useState<string | null>(null); // New: Error state

  // Validate email format for the CheckCircle icon
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || "Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8 flex flex-col max-w-md mx-auto">
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
          <div className="absolute -top-1 right-8 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h2>
        <p className="text-gray-500 text-sm">
          Kiến tạo bữa ăn hoàn hảo và khám phá hương vị mỗi ngày.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl">
        <button className="flex-1 py-3 bg-white text-green-500 font-semibold rounded-xl shadow-sm">
          Đăng nhập
        </button>
        <button
          onClick={() => navigate('/register')}
          className="flex-1 py-3 text-gray-500 font-medium rounded-xl hover:bg-white/50 transition-colors"
        >
          Đăng ký
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@mealcraft.com"
              className="pl-12 pr-12 py-6 border-2 border-green-500 rounded-2xl text-sm focus-visible:ring-green-500"
              required
            />
            {isEmailValid && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              className="pl-12 pr-4 py-6 border-2 border-gray-200 rounded-2xl text-sm focus-visible:ring-green-500"
              required
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" className="text-sm text-green-500 font-medium hover:underline">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl text-base font-semibold transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Đăng nhập ngay →"
          )}
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
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
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
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z" stroke="currentColor" strokeWidth="2" fill="none" />
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
      <p className="text-xs text-gray-500 text-center leading-relaxed mt-auto">
        Bằng việc tiếp tục, bạn đồng ý tuân thủ{' '}
        <button className="font-semibold text-gray-700 hover:underline">Điều khoản</button> và{' '}
        <button className="font-semibold text-gray-700 hover:underline">Chính sách bảo mật</button> của{' '}
        <span className="text-green-500 font-semibold">MealCraft</span>.
      </p>
    </div>
  );
}