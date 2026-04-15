import { Outlet, Link, useLocation } from 'react-router';
import { Home, ChefHat, ShoppingBag } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

export function Layout() {
  const location = useLocation();
  const { mode } = useMode();

  const navItems = [
    { path: '/', icon: Home, label: 'Khám phá' },
    { path: '/ingredients', icon: ChefHat, label: 'Nấu ăn' },
    { path: '/order-food', icon: ShoppingBag, label: 'Đặt món' },
  ];

  if (mode === 'web') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Web Navigation */}
        <nav className="bg-white border-b shadow-sm flex-shrink-0">
          <div className="flex justify-center items-center py-4 px-8 gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-green-500 bg-green-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-white pt-8">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t shadow-lg flex-shrink-0 pb-6 safe-area-inset-bottom">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}