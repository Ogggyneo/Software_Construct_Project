import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    Clock,
    ForkKnife,
    Globe,
    ArrowRight,
} from "@phosphor-icons/react";
import Footer from "../components/Footer";

const mealData: Record<
    string,
    {
        title: string;
        subtitle: string;
        tags: { label: string; color: string }[];
        image: string;
        time: string;
        ingredients_count: string;
        region: string;
        ingredients: { name: string; amount: string }[];
        steps: string[];
        related: { id: string; title: string; time: string; image: string }[];
    }
> = {
    default: {
        title: "Tonkotsu Ramen Cay",
        subtitle: "Hương vị Nhật Bản truyền thống kết hợp sốt ớt đặc trưng.",
        tags: [
            { label: "Cay nóng", color: "bg-orange-500" },
            { label: "Phổ biến", color: "bg-green-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
        time: "30 phút",
        ingredients_count: "7 loại",
        region: "Nhật Bản",
        ingredients: [
            { name: "Mì Ramen tươi", amount: "200g" },
            { name: "Thịt xá xíu", amount: "3 lát" },
            { name: "Trứng lòng đào", amount: "1 quả" },
            { name: "Nước dùng xương", amount: "500ml" },
            { name: "Măng khô (Menma)", amount: "30g" },
            { name: "Hành lá", amount: "10g" },
            { name: "Rong biển khô", amount: "1 miếng" },
        ],
        steps: [
            "Đun sôi nước dùng xương heo trong 15 phút với gừng và tỏi để tăng hương vị đậm đà.",
            "Luộc mì Ramen trong nước sôi khoảng 2-3 phút cho đến khi đạt độ mềm vừa ý, sau đó vớt ra để ráo.",
            "Áp chảo nhẹ các lát thịt xá xíu cho đến khi cạnh thịt hơi cháy cạnh và tỏa mùi thơm.",
            "Cho mì vào bát, chế nước dùng nóng, xếp thịt, trứng, măng và hành lá lên trên cùng.",
        ],
        related: [
            {
                id: "1",
                title: "Sushi Cá Hồi",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
            },
            {
                id: "2",
                title: "Cơm Trộn Bibimbap",
                time: "25 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
            },
            {
                id: "3",
                title: "Bánh Xèo",
                time: "35 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
            },
        ],
    },

    "1": {
        title: "Salad Ức Gà Nướng",
        subtitle: "Món salad tươi mát, giàu đạm và rất dễ ăn.",
        tags: [
            { label: "Healthy", color: "bg-green-500" },
            { label: "Nhanh", color: "bg-blue-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
        time: "20 phút",
        ingredients_count: "5 loại",
        region: "Món Tây",
        ingredients: [
            { name: "Ức gà", amount: "150g" },
            { name: "Rau xà lách", amount: "1 bát" },
            { name: "Cà chua", amount: "1 quả" },
            { name: "Hành lá", amount: "10g" },
            { name: "Hạt điều", amount: "20g" },
        ],
        steps: [
            "Ướp ức gà với muối tiêu rồi nướng chín vàng đều.",
            "Rửa sạch rau xà lách và cắt nhỏ cà chua.",
            "Thái gà thành lát vừa ăn.",
            "Trộn tất cả nguyên liệu và rắc hạt điều lên trên.",
        ],
        related: [
            {
                id: "2",
                title: "Mì Ý Sốt Cà Chua",
                time: "30 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
            },
            {
                id: "3",
                title: "Phở Bò Tái Lăn",
                time: "45 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
            },
            {
                id: "4",
                title: "Sushi Cuộn Nhật",
                time: "40 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
            },
        ],
    },

    "2": {
        title: "Mì Ý Sốt Cà Chua",
        subtitle: "Đậm vị cà chua, thơm nhẹ phô mai, dễ ăn cho mọi bữa tối.",
        tags: [
            { label: "Italian", color: "bg-red-500" },
            { label: "Phổ biến", color: "bg-green-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
        time: "30 phút",
        ingredients_count: "6 loại",
        region: "Món Ý",
        ingredients: [
            { name: "Mì Ý", amount: "200g" },
            { name: "Cà chua", amount: "2 quả" },
            { name: "Hành tây", amount: "1/2 củ" },
            { name: "Tỏi", amount: "3 tép" },
            { name: "Phô mai", amount: "30g" },
            { name: "Dầu olive", amount: "1 muỗng" },
        ],
        steps: [
            "Luộc mì đến khi chín al dente.",
            "Phi thơm tỏi và hành tây với dầu olive.",
            "Cho cà chua vào nấu mềm thành sốt.",
            "Trộn mì với sốt và rắc phô mai lên trên.",
        ],
        related: [
            {
                id: "1",
                title: "Salad Ức Gà Nướng",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
            },
            {
                id: "4",
                title: "Sushi Cuộn Nhật",
                time: "40 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
            },
            {
                id: "5",
                title: "Pizza Hải Sản",
                time: "35 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_5.png",
            },
        ],
    },

    "3": {
        title: "Phở Bò Tái Lăn",
        subtitle: "Món phở Việt đậm đà, thơm mùi bò xào tái.",
        tags: [
            { label: "Healthy", color: "bg-green-500" },
            { label: "Việt Nam", color: "bg-yellow-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
        time: "45 phút",
        ingredients_count: "5 loại",
        region: "Món Việt",
        ingredients: [
            { name: "Thịt bò", amount: "200g" },
            { name: "Bánh phở", amount: "250g" },
            { name: "Hành lá", amount: "10g" },
            { name: "Giá đỗ", amount: "1 bát" },
            { name: "Rau thơm", amount: "1 đĩa" },
        ],
        steps: [
            "Nấu nước dùng bò cho thơm và trong.",
            "Xào tái thịt bò với chút gừng.",
            "Trụng bánh phở rồi cho vào tô.",
            "Xếp thịt bò, hành lá, rau thơm và chan nước dùng.",
        ],
        related: [
            {
                id: "6",
                title: "Phở Gà Truyền Thống",
                time: "50 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
            },
            {
                id: "1",
                title: "Salad Ức Gà Nướng",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
            },
            {
                id: "2",
                title: "Mì Ý Sốt Cà Chua",
                time: "30 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
            },
        ],
    },

    "4": {
        title: "Sushi Cuộn Nhật",
        subtitle: "Cuộn sushi tươi ngon với vị thanh nhẹ, dễ ăn.",
        tags: [
            { label: "Asian", color: "bg-purple-500" },
            { label: "Fresh", color: "bg-cyan-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
        time: "40 phút",
        ingredients_count: "5 loại",
        region: "Món Nhật",
        ingredients: [
            { name: "Cá hồi", amount: "120g" },
            { name: "Cơm sushi", amount: "1 bát" },
            { name: "Rong biển", amount: "3 lá" },
            { name: "Dưa leo", amount: "1/2 quả" },
            { name: "Trứng gà", amount: "1 quả" },
        ],
        steps: [
            "Nấu cơm sushi và để nguội bớt.",
            "Chuẩn bị cá hồi, dưa leo và trứng thái sợi.",
            "Trải cơm lên rong biển, thêm nhân vào giữa.",
            "Cuộn chặt tay và cắt thành khoanh vừa ăn.",
        ],
        related: [
            {
                id: "1",
                title: "Salad Ức Gà Nướng",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
            },
            {
                id: "2",
                title: "Mì Ý Sốt Cà Chua",
                time: "30 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
            },
            {
                id: "3",
                title: "Phở Bò Tái Lăn",
                time: "45 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
            },
        ],
    },

    "5": {
        title: "Pizza Hải Sản",
        subtitle: "Pizza giòn đế, đậm vị tôm mực và phô mai béo thơm.",
        tags: [
            { label: "Italian", color: "bg-red-500" },
            { label: "Đậm vị", color: "bg-orange-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_5.png",
        time: "35 phút",
        ingredients_count: "6 loại",
        region: "Món Ý",
        ingredients: [
            { name: "Bột mì", amount: "250g" },
            { name: "Tôm", amount: "100g" },
            { name: "Mực", amount: "100g" },
            { name: "Phô mai", amount: "100g" },
            { name: "Cà chua", amount: "2 quả" },
            { name: "Hành lá", amount: "10g" },
        ],
        steps: [
            "Cán bột thành đế pizza mỏng.",
            "Phết sốt cà chua lên bề mặt.",
            "Xếp tôm, mực và phô mai lên trên.",
            "Nướng ở nhiệt độ cao đến khi vàng giòn.",
        ],
        related: [
            {
                id: "2",
                title: "Mì Ý Sốt Cà Chua",
                time: "30 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
            },
            {
                id: "4",
                title: "Sushi Cuộn Nhật",
                time: "40 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
            },
            {
                id: "1",
                title: "Salad Ức Gà Nướng",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
            },
        ],
    },

    "6": {
        title: "Phở Gà Truyền Thống",
        subtitle: "Món phở gà thanh ngọt, quen thuộc cho bữa sáng.",
        tags: [
            { label: "Healthy", color: "bg-green-500" },
            { label: "Việt Nam", color: "bg-yellow-500" },
        ],
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
        time: "50 phút",
        ingredients_count: "5 loại",
        region: "Món Việt",
        ingredients: [
            { name: "Gà", amount: "1/2 con" },
            { name: "Bánh phở", amount: "250g" },
            { name: "Hành lá", amount: "10g" },
            { name: "Gừng", amount: "1 củ nhỏ" },
            { name: "Rau thơm", amount: "1 đĩa" },
        ],
        steps: [
            "Luộc gà với gừng và hành tím để lấy nước dùng.",
            "Xé thịt gà thành sợi vừa ăn.",
            "Trụng bánh phở rồi cho vào tô.",
            "Xếp gà, rau thơm và chan nước dùng nóng.",
        ],
        related: [
            {
                id: "3",
                title: "Phở Bò Tái Lăn",
                time: "45 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
            },
            {
                id: "1",
                title: "Salad Ức Gà Nướng",
                time: "20 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
            },
            {
                id: "4",
                title: "Sushi Cuộn Nhật",
                time: "40 ph",
                image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
            },
        ],
    },
};

const getMealData = (id?: string) => {
    if (!id) return mealData["default"];
    return mealData[id] ?? mealData["default"];
};

const MealDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [liked, setLiked] = useState(false);
    const meal = getMealData(id);

    return (
        <div className="min-h-screen bg-background flex flex-col animate-fade-in">
            <div className="fixed top-0 left-0 right-0 z-50 max-w-[480px] mx-auto">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft weight="bold" size={20} className="text-foreground" />
                    </button>

                    <h1 className="font-sans font-semibold text-base text-foreground bg-white/90 px-3 py-1 rounded-full shadow truncate max-w-[180px]">
                        Mì Ramen Cay Đặc Biệt
                    </h1>

                    <button
                        onClick={() => setLiked((prev) => !prev)}
                        className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Yêu thích"
                    >
                        <Heart
                            weight={liked ? "fill" : "regular"}
                            size={20}
                            className={liked ? "text-red-500" : "text-foreground"}
                        />
                    </button>
                </div>
            </div>

            <div className="relative h-[280px] max-w-[480px] mx-auto w-full overflow-hidden">
                <img
                    src={meal.image}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-2 mb-2">
                        {meal.tags.map((tag) => (
                            <span
                                key={tag.label}
                                className={`${tag.color} text-white text-xs font-inter font-semibold px-2.5 py-1 rounded-full`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>

                    <h2 className="font-sans font-bold text-[22px] text-white leading-tight">
                        {meal.title}
                    </h2>
                    <p className="font-inter text-sm text-white/80 mt-1 leading-snug">
                        {meal.subtitle}
                    </p>
                </div>
            </div>

            <main className="flex-1 max-w-[480px] mx-auto w-full px-4 pb-10">
                <div className="flex items-center justify-around py-5 border-b border-border">
                    <div className="flex flex-col items-center gap-1">
                        <Clock weight="duotone" size={22} className="text-primary" />
                        <span className="font-inter text-[11px] text-gray-400">Thời gian</span>
                        <span className="font-sans font-semibold text-sm text-foreground">
                            {meal.time}
                        </span>
                    </div>

                    <div className="w-px h-10 bg-border" />

                    <div className="flex flex-col items-center gap-1">
                        <ForkKnife weight="duotone" size={22} className="text-primary" />
                        <span className="font-inter text-[11px] text-gray-400">
                            Nguyên liệu
                        </span>
                        <span className="font-sans font-semibold text-sm text-foreground">
                            {meal.ingredients_count}
                        </span>
                    </div>

                    <div className="w-px h-10 bg-border" />

                    <div className="flex flex-col items-center gap-1">
                        <Globe weight="duotone" size={22} className="text-primary" />
                        <span className="font-inter text-[11px] text-gray-400">Vùng miền</span>
                        <span className="font-sans font-semibold text-sm text-foreground">
                            {meal.region}
                        </span>
                    </div>
                </div>

                <section className="mt-5 mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-sans font-bold text-base text-foreground">
                            Thành phần nguyên liệu
                        </h3>
                        <span className="font-inter text-sm text-primary font-medium">
                            Cho 1 người ăn
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {meal.ingredients.map((ing) => (
                            <span
                                key={ing.name}
                                className="bg-gray-100 text-gray-700 text-sm font-inter px-3 py-1.5 rounded-full"
                            >
                                {ing.name} <span className="text-gray-400">{ing.amount}</span>
                            </span>
                        ))}
                    </div>
                </section>

                <section className="mb-6">
                    <h3 className="font-sans font-bold text-base text-foreground mb-4">
                        Các bước thực hiện
                    </h3>

                    <div className="flex flex-col gap-4">
                        {meal.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
                                    <span className="text-white font-sans font-bold text-sm">
                                        {idx + 1}
                                    </span>
                                </div>
                                <p className="font-inter text-sm text-gray-700 leading-relaxed flex-1">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-sans font-bold text-base text-foreground">
                            Tham khảo liên quan
                        </h3>
                        <button className="flex items-center gap-1 text-primary text-sm font-inter font-medium hover:underline">
                            <ArrowRight weight="bold" size={14} />
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                        {meal.related.map((item) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0 w-[120px] cursor-pointer"
                                onClick={() => navigate(`/meal/${item.id}`)}
                            >
                                <div className="relative h-[90px] rounded-lg overflow-hidden mb-1">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-inter px-1.5 py-0.5 rounded-full">
                                        {item.time}
                                    </span>
                                </div>
                                <p className="font-inter text-xs text-foreground font-medium leading-tight">
                                    {item.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default MealDetailPage;