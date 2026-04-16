import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation to group chat and coming soon pages
import { 
  MapPin, 
  Clock, 
  Filter, 
  Zap, 
  ChevronRight, 
  Plus 
} from 'lucide-react';

// UI Components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

// Context and Data
import { useMode } from '../contexts/ModeContext';
import { availableGroups } from './data/FoodGroup';

export function OrderFood() {
  const navigate = useNavigate();
  
  // Search Form State
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [preference, setPreference] = useState('');
  
  // Mode (web vs mobile) from context
  const { mode } = useMode();

  // Function to handle "Coming Soon" for group creation
  const handleCreateGroup = () => {
    navigate('/coming-soon');
  };

  // --- WEB VIEW ---
  if (mode === 'web') {
    return (
      <div className="pb-8 bg-white min-h-full">
        {/* Header */}
        <div className="px-12 pt-8 pb-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white fill-white" />
                </div>
                <h2 className="text-3xl font-bold">Đặt món nhóm</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleCreateGroup}
                  variant="outline" 
                  className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 px-6 py-6 rounded-xl font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Tạo nhóm mới
                </Button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Filter className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-5 gap-8">
            {/* Left Column - Search Form */}
            <div className="col-span-2">
              <div className="bg-green-50 rounded-3xl p-8 sticky top-8">
                <h3 className="font-bold text-xl mb-2">Tìm nhóm quanh bạn</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Nhập thông tin để tìm những người đang cùng đặt món tại khu vực của bạn.
                </p>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-3">Vị trí của bạn</p>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    <Input
                      placeholder="VD: 191 Bà Triệu, Hai Bà Trưng"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 py-6 border-gray-300 bg-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-3">Thời gian</p>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    <Input
                      placeholder="12:00 PM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-12 py-6 border-gray-300 bg-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Sở thích</p>
                  <Input
                    placeholder="Cơm, Phở..."
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    className="py-6 border-gray-300 bg-white rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-6 font-semibold text-base">
                    Tìm nhóm ngay
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    variant="ghost" 
                    className="w-full text-green-600 hover:text-green-700 hover:bg-green-100 py-6"
                  >
                    Bạn muốn tự mở nhóm? Tạo ngay
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Available Groups */}
            <div className="col-span-3 py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">Các nhóm đang chờ</h3>
                <span className="text-sm text-green-500 font-medium">
                  {availableGroups.length} nhóm khả dụng
                </span>
              </div>

              <div className="space-y-4">
                {availableGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full">
                        {group.category}
                      </span>
                      <span className="text-sm text-red-500 font-medium">
                        ⏰ {group.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg mb-3">{group.title}</h4>

                    <div className="flex items-center gap-2 text-gray-500 mb-5">
                      <MapPin className="w-5 h-5" />
                      <span>{group.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {group.memberAvatars.map((avatar, idx) => (
                            <Avatar key={idx} className="w-10 h-10 border-2 border-white">
                              <AvatarFallback className="bg-green-500 text-white">
                                {avatar}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          +{group.memberCount} người tham gia
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate('/group-chat')}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-5"
                      >
                        Tham gia
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MOBILE VIEW ---
  return (
    <div className="pb-4 bg-white min-h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-lg font-bold">Đặt món nhóm</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCreateGroup}
            variant="outline" 
            size="icon" 
            className="rounded-full border-green-500 text-green-600"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Filter className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      {/* Find Group Section */}
      <div className="bg-green-50 px-4 py-6 mb-6">
        <h3 className="font-bold text-lg mb-2">Tìm nhóm quanh bạn</h3>
        <p className="text-sm text-gray-600 mb-4">
          Nhập thông tin để tìm những người đang cùng đặt món tại khu vực của bạn.
        </p>

        <div className="mb-3">
          <p className="text-sm font-medium mb-2">Vị trí của bạn</p>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            <Input
              placeholder="VD: 191 Bà Triệu, Hai Bà Trưng"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 border-gray-300 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-sm font-medium mb-2">Thời gian</p>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <Input
                placeholder="12:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Sở thích</p>
            <Input
              placeholder="Cơm, Phở..."
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="border-gray-300 bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-6 font-semibold">
            Tìm nhóm ngay
          </Button>
          <Button 
            onClick={handleCreateGroup}
            variant="outline" 
            className="w-full border-green-500 text-green-600 rounded-xl py-6 font-semibold bg-transparent"
          >
            + Tạo nhóm mới
          </Button>
        </div>
      </div>

      {/* Available Groups List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Các nhóm đang chờ</h3>
          <span className="text-sm text-green-500 font-medium">
            {availableGroups.length} nhóm khả dụng
          </span>
        </div>

        <div className="space-y-3">
          {availableGroups.map((group) => (
            <Card
              key={group.id}
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {group.category}
                </span>
                <span className="text-xs text-red-500 font-medium">
                  ⏰ {group.time}
                </span>
              </div>

              <h4 className="font-bold text-base mb-2">{group.title}</h4>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{group.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {group.memberAvatars.map((avatar, idx) => (
                      <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-green-500 text-white text-xs">
                          {avatar}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    +{group.memberCount} người tham gia
                  </span>
                </div>
                <Button
                  onClick={() => navigate('/group-chat')}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4"
                  size="sm"
                >
                  Tham gia
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}