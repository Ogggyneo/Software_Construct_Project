import { useState } from 'react';
import { User, Mail, MapPin, ChefHat, Heart, Clock3, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Profile() {
    const [name, setName] = useState('Minh Tú');
    const [email, setEmail] = useState('demo@mealcraft.com');
    const [location, setLocation] = useState('105 Ton Dat Tien, Tan My Ward, Ho Chi Minh City');
    const [cookingLevel, setCookingLevel] = useState('beginner');
    const [mealHabit, setMealHabit] = useState('balanced');
    const [cookingFrequency, setCookingFrequency] = useState('weekly');
    const [preferences, setPreferences] = useState<string[]>(['Món Việt', 'Healthy', 'Món nhanh']);

    const preferenceOptions = [
        'Món Việt',
        'Món Hàn',
        'Món Nhật',
        'Món Ý',
        'Healthy',
        'Ăn chay',
        'Ít cay',
        'Nhiều protein',
        'Món nhanh',
        'Đồ ngọt',
    ];

    const togglePreference = (item: string) => {
        if (preferences.includes(item)) {
            setPreferences(preferences.filter((p) => p !== item));
        } else {
            setPreferences([...preferences, item]);
        }
    };

    const handleSave = () => {
        const profileData = {
            name,
            email,
            location,
            cookingLevel,
            mealHabit,
            cookingFrequency,
            preferences,
        };

        localStorage.setItem('mealcraftUserProfile', JSON.stringify(profileData));
        alert('Profile saved successfully!');
    };

    return (
        <div className="h-full overflow-y-auto bg-white pb-8">
            <div className="px-6 py-6 border-b">
                <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 mt-1">
                    Cập nhật thông tin để MealCraft gợi ý món ăn phù hợp hơn.
                </p>
            </div>

            <div className="px-6 pt-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-green-500" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-gray-500">{email}</p>
                        <p className="text-sm text-green-600 mt-1">MealCraft Beginner Chef</p>
                    </div>
                </div>

                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Thông tin cá nhân</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-gray-50 p-4">
                            <label className="font-semibold mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-green-500" />
                                Tên người dùng
                            </label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <label className="font-semibold mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-green-500" />
                                Email
                            </label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4 md:col-span-2">
                            <label className="font-semibold mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-500" />
                                Khu vực sinh sống
                            </label>
                            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Trình độ nấu ăn</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: 'beginner', title: 'Mới bắt đầu', desc: 'Ít kinh nghiệm, cần hướng dẫn rõ' },
                            { id: 'home-cook', title: 'Nấu cơ bản', desc: 'Có thể nấu món quen thuộc' },
                            { id: 'advanced', title: 'Thành thạo', desc: 'Tự tin thử món mới' },
                        ].map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setCookingLevel(level.id)}
                                className={`rounded-2xl border p-4 text-left transition-all ${cookingLevel === level.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <ChefHat className="w-6 h-6 text-green-500 mb-3" />
                                <p className="font-bold">{level.title}</p>
                                <p className="text-sm text-gray-500 mt-1">{level.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Sở thích món ăn</h3>

                    <div className="flex flex-wrap gap-3">
                        {preferenceOptions.map((item) => (
                            <button
                                key={item}
                                onClick={() => togglePreference(item)}
                                className={`px-4 py-2 rounded-full border font-medium transition-all ${preferences.includes(item)
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Heart className="w-4 h-4 inline mr-2" />
                                {item}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Thói quen ăn uống</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-gray-50 p-4">
                            <label className="font-semibold mb-2 block">Phong cách ăn uống</label>
                            <select
                                value={mealHabit}
                                onChange={(e) => setMealHabit(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                            >
                                <option value="balanced">Cân bằng</option>
                                <option value="healthy">Ưu tiên healthy</option>
                                <option value="quick">Ưu tiên món nhanh</option>
                                <option value="high-protein">Nhiều protein</option>
                                <option value="vegetarian">Ăn chay</option>
                            </select>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <label className="font-semibold mb-2 flex items-center gap-2">
                                <Clock3 className="w-4 h-4 text-green-500" />
                                Tần suất nấu ăn
                            </label>
                            <select
                                value={cookingFrequency}
                                onChange={(e) => setCookingFrequency(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                            >
                                <option value="daily">Hằng ngày</option>
                                <option value="weekly">Vài lần mỗi tuần</option>
                                <option value="rarely">Hiếm khi nấu</option>
                                <option value="learning">Đang tập nấu</option>
                            </select>
                        </div>
                    </div>
                </section>

                <Button
                    onClick={handleSave}
                    className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-base flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    Lưu hồ sơ
                </Button>
            </div>
        </div>
    );
}