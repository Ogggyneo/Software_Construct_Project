import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Trophy, Clock3, Star, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Recipe } from './Home';

export function CookingMission() {
    const navigate = useNavigate();
    const location = useLocation();

    const recipe = location.state?.recipe as Recipe | undefined;
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    if (!recipe) {
        return (
            <div className="h-full overflow-y-auto bg-white px-4 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-gray-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                <div className="rounded-3xl border border-gray-200 p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">Không tìm thấy nhiệm vụ nấu ăn</h2>
                    <p className="text-gray-500 mb-4">
                        Vui lòng chọn món ăn từ trang chi tiết trước.
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

    const totalSteps = recipe.steps.length;
    const progress = Math.round((completedSteps.length / totalSteps) * 100);

    const handleCompleteStep = () => {
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleGoToStep = (index: number) => {
        setCurrentStep(index);
    };

    if (isFinished) {
        return (
            <div className="h-full overflow-y-auto bg-white px-4 py-8 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </div>

                    <h1 className="text-3xl font-bold mb-3">Hoàn thành món ăn!</h1>
                    <p className="text-gray-500 mb-6">
                        Bạn đã hoàn thành nhiệm vụ nấu món <strong>{recipe.name}</strong>.
                    </p>

                    <div className="rounded-3xl bg-gray-50 p-5 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="font-bold text-lg">+100 Cooking XP</p>
                        <p className="text-sm text-gray-500">Bạn đã mở khóa huy hiệu Beginner Chef</p>
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-4 rounded-2xl bg-green-500 text-white font-semibold mb-3"
                    >
                        Về trang chủ
                    </button>

                    <button
                        onClick={() => navigate('/meal-detail', { state: { recipe } })}
                        className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold"
                    >
                        Xem lại công thức
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white pb-8">
            {/* Header */}
            <div className="relative h-56">
                <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-sm text-white/80 mb-1">Cooking Mission</p>
                    <h1 className="text-2xl font-bold">{recipe.name}</h1>
                </div>
            </div>

            <div className="px-4 pt-5">
                {/* Progress */}
                <div className="rounded-3xl bg-gray-50 p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold">Tiến độ nhiệm vụ</p>
                        <p className="text-green-500 font-bold">{progress}%</p>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                        Đã hoàn thành {completedSteps.length}/{totalSteps} bước
                    </p>
                </div>

                {/* Step selector */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
                    {recipe.steps.map((_, index) => {
                        const isCompleted = completedSteps.includes(index);
                        const isActive = currentStep === index;

                        return (
                            <button
                                key={index}
                                onClick={() => handleGoToStep(index)}
                                className={`flex-shrink-0 w-11 h-11 rounded-full font-bold transition-all ${isActive
                                        ? 'bg-green-500 text-white'
                                        : isCompleted
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {isCompleted ? '✓' : index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Current mission card */}
                <div className="rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-5">
                    <div className="bg-green-50 px-5 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-semibold">
                                Nhiệm vụ {currentStep + 1}
                            </p>
                            <h2 className="text-xl font-bold">Hoàn thành bước này</h2>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Clock3 className="w-6 h-6 text-green-500" />
                        </div>
                    </div>

                    <div className="p-5">
                        <p className="text-gray-700 text-lg leading-8 mb-5">
                            {recipe.steps[currentStep]}
                        </p>

                        <div className="rounded-2xl bg-gray-50 p-4 mb-5">
                            <p className="font-semibold mb-2">Mini Challenge</p>
                            <p className="text-sm text-gray-500">
                                Hãy hoàn thành thao tác này thật cẩn thận. Khi xong, bấm “Hoàn thành bước”.
                            </p>
                        </div>

                        <button
                            onClick={handleCompleteStep}
                            className="w-full py-4 rounded-2xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {currentStep === totalSteps - 1 ? 'Hoàn thành món ăn' : 'Hoàn thành bước'}
                        </button>
                    </div>
                </div>

                {/* Mission list */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Danh sách nhiệm vụ</h3>

                    <div className="space-y-3">
                        {recipe.steps.map((step, index) => {
                            const isCompleted = completedSteps.includes(index);
                            const isActive = currentStep === index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleGoToStep(index)}
                                    className={`w-full text-left rounded-2xl p-4 border transition-all ${isActive
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-100 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isActive
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            {isCompleted ? '✓' : index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-semibold mb-1">Bước {index + 1}</p>
                                            <p className="text-sm text-gray-500 line-clamp-2">{step}</p>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}