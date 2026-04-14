export interface Recipe {
    id: number;
    title: string;
    titleVi: string;
    image: string;
    altText: string;
    time: string;
    kcal: string;
    category: string;
    categoryVi: string;
    cuisine: string;
    meal: string;
    ingredients: string[];
    badge?: string;
}

export const recipes: Recipe[] = [
    {
        id: 1,
        title: "Salad Ức Gà Nướng",
        titleVi: "Salad Ức Gà Nướng",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_1.png",
        altText: "Salad Ức Gà Nướng với hạt điều",
        time: "20 phút",
        kcal: "320 kcal",
        category: "Salad",
        categoryVi: "Salad",
        cuisine: "Món Tây",
        meal: "Bữa trưa",
        ingredients: ["Ức gà", "Rau xà lách", "Cà chua", "Hành lá", "Hạt điều"],
        badge: "Healthy",
    },
    {
        id: 2,
        title: "Mì Ý Sốt Cà Chua",
        titleVi: "Mì Ý Sốt Cà Chua",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_2.png",
        altText: "Mì Ý Sốt Cà Chua thơm ngon",
        time: "30 phút",
        kcal: "480 kcal",
        category: "Pasta",
        categoryVi: "Mì Ý",
        cuisine: "Món Ý",
        meal: "Bữa tối",
        ingredients: ["Mì Ý", "Cà chua", "Hành tây", "Tỏi", "Phô mai"],
        badge: "Italian",
    },
    {
        id: 3,
        title: "Phở Bò Tái Lăn",
        titleVi: "Phở Bò Tái Lăn",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
        altText: "Phở Bò Tái Lăn truyền thống Việt Nam",
        time: "45 phút",
        kcal: "410 kcal",
        category: "Soup",
        categoryVi: "Súp",
        cuisine: "Món Việt",
        meal: "Bữa sáng",
        ingredients: ["Thịt bò", "Bánh phở", "Hành lá", "Giá đỗ", "Rau thơm"],
        badge: "Healthy",
    },
    {
        id: 4,
        title: "Sushi Cuộn Nhật",
        titleVi: "Sushi Cuộn Nhật",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_4.png",
        altText: "Sushi Cuộn Nhật Bản tươi ngon",
        time: "40 phút",
        kcal: "350 kcal",
        category: "Sushi",
        categoryVi: "Sushi",
        cuisine: "Món Nhật",
        meal: "Bữa tối",
        ingredients: ["Cá hồi", "Cơm sushi", "Rong biển", "Dưa leo", "Trứng gà"],
        badge: "Asian",
    },
    {
        id: 5,
        title: "Pizza Hải Sản",
        titleVi: "Pizza Hải Sản",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_5.png",
        altText: "Pizza Hải Sản thơm ngon",
        time: "35 phút",
        kcal: "520 kcal",
        category: "Pizza",
        categoryVi: "Pizza",
        cuisine: "Món Ý",
        meal: "Bữa tối",
        ingredients: ["Bột mì", "Tôm", "Mực", "Phô mai", "Cà chua", "Hành lá"],
        badge: "Italian",
    },
    {
        id: 6,
        title: "Phở Gà Truyền Thống",
        titleVi: "Phở Gà Truyền Thống",
        image: "https://c.animaapp.com/mnoq1v5dH1DAHp/img/ai_3.png",
        altText: "Phở Gà Truyền Thống Việt Nam",
        time: "50 phút",
        kcal: "380 kcal",
        category: "Soup",
        categoryVi: "Súp",
        cuisine: "Món Việt",
        meal: "Bữa sáng",
        ingredients: ["Gà", "Bánh phở", "Hành lá", "Gừng", "Rau thơm"],
        badge: "Healthy",
    },
];

export const popularIngredients = [
    "Thịt bò",
    "Phô mai",
    "Trứng gà",
    "Cà chua",
    "Hành lá",
    "Tỏi",
    "Gừng",
    "Rau thơm",
];