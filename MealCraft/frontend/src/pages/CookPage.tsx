import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MagnifyingGlass,
    X,
    Plus,
    Clock,
    CheckCircle,
    Warning,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { recipes, popularIngredients } from "../data/recipes";

const CookPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [activeIngredients, setActiveIngredients] = useState<string[]>([
        "Trứng gà",
        "Cà chua",
        "Hành lá",
    ]);
    const [sortBy, setSortBy] = useState("Thiếu ít nhất");

    const addIngredient = (ingredient: string) => {
        if (!activeIngredients.includes(ingredient)) {
            setActiveIngredients((prev) => [...prev, ingredient]);
        }
    };

    const removeIngredient = (ingredient: string) => {
        setActiveIngredients((prev) => prev.filter((i) => i !== ingredient));
    };

    const clearAll = () => setActiveIngredients([]);

    const handleSearchAdd = () => {
        const trimmed = searchValue.trim();
        if (trimmed && !activeIngredients.includes(trimmed)) {
            setActiveIngredients((prev) => [...prev, trimmed]);
            setSearchValue("");
        }
    };

    const matchedRecipes = useMemo(() => {
        if (activeIngredients.length === 0) return recipes;

        return recipes
            .map((recipe) => {
                const missing = recipe.ingredients.filter(
                    (ing) =>
                        !activeIngredients.some(
                            (a) =>
                                ing.toLowerCase().includes(a.toLowerCase()) ||
                                a.toLowerCase().includes(ing.toLowerCase())
                        )
                );

                return {
                    ...recipe,
                    missingCount: missing.length,
                    missingIngredients: missing,
                };
            })
            .sort((a, b) => {
                if (sortBy === "Thiếu ít nhất") return a.missingCount - b.missingCount;
                return b.missingCount - a.missingCount;
            });
    }, [activeIngredients, sortBy]);

    const availableSuggestions = popularIngredients.filter(
        (ing) => !activeIngredients.includes(ing)
    );

    return (
        <div className="min-h-screen bg-background flex flex-col animate-fade-in">
            <header
                className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
                style={{ height: "56px" }}
                role="banner"
            >
                <div className="max-w-[480px] mx-auto h-full flex items-center gap-3 px-4">
                    <button
                        onClick={() => navigate("/home")}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        aria-label="Quay lại trang chủ"
                    >
                        <ArrowLeft weight="bold" size={24} />
                    </button>

                    <h1 className="font-sans font-bold text-lg text-foreground">
                        Nấu ăn
                    </h1>
                </div>
            </header>

            <main
                className="flex-1 max-w-[480px] mx-auto w-full pt-[56px] pb-[80px] px-4"
                role="main"
                id="main-content"
            >
                <section className="pt-6 pb-4" aria-label="Tìm kiếm nguyên liệu">
                    <h2 className="font-sans font-bold text-[22px] leading-tight text-foreground mb-1">
                        Bạn có gì trong tủ lạnh?
                    </h2>
                    <p className="font-inter text-sm text-gray-500">
                        Thêm nguyên liệu để tìm công thức phù hợp
                    </p>
                </section>

                <section className="mb-4" aria-label="Nhập nguyên liệu">
                    <div className="relative mb-3">
                        <MagnifyingGlass
                            weight="duotone"
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchAdd()}
                            placeholder="Thêm nguyên liệu (ví dụ: Thịt bò...)"
                            className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-gray-50 text-foreground placeholder:text-gray-400 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-150"
                            aria-label="Tìm kiếm nguyên liệu"
                        />
                    </div>

                    {activeIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {activeIngredients.map((ing) => (
                                <button
                                    key={ing}
                                    onClick={() => removeIngredient(ing)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-inter font-medium transition-all duration-100 ease-in hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label={`Xóa nguyên liệu ${ing}`}
                                >
                                    {ing}
                                    <X weight="bold" size={12} />
                                </button>
                            ))}

                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 rounded-full text-sm font-inter font-medium text-gray-500 hover:text-red-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label="Xóa tất cả nguyên liệu"
                            >
                                Xóa hết
                            </button>
                        </div>
                    )}
                </section>

                {availableSuggestions.length > 0 && (
                    <section className="mb-6" aria-label="Gợi ý phổ biến">
                        <h3 className="font-sans font-medium text-sm text-foreground mb-2">
                            Gợi ý phổ biến
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableSuggestions.map((ing) => (
                                <button
                                    key={ing}
                                    onClick={() => addIngredient(ing)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-inter transition-all duration-100 ease-in hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label={`Thêm nguyên liệu ${ing}`}
                                >
                                    <Plus weight="bold" size={12} />
                                    {ing}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mb-4" aria-label="Kết quả tìm kiếm">
                    <div className="flex items-center justify-between">
                        <p className="font-inter text-sm text-gray-500">
                            Tìm thấy{" "}
                            <span className="font-medium text-foreground">
                                {matchedRecipes.length} món ăn
                            </span>{" "}
                            phù hợp
                        </p>

                        <div className="flex items-center gap-1">
                            <span className="font-inter text-xs text-gray-400">
                                Sắp xếp:
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="font-inter text-xs text-primary bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                aria-label="Sắp xếp kết quả"
                            >
                                <option value="Thiếu ít nhất">Thiếu ít nhất</option>
                                <option value="Thiếu nhiều nhất">Thiếu nhiều nhất</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section
                    className="grid grid-cols-2 gap-4"
                    role="list"
                    aria-label="Danh sách công thức"
                >
                    {matchedRecipes.map((recipe) => {
                        const missingCount = (recipe as any).missingCount ?? 0;
                        const isComplete = missingCount === 0;

                        return (
                            <div
                                key={recipe.id}
                                role="listitem"
                                className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/meal/${recipe.id}`);
                                    }
                                }}
                                aria-label={`Công thức ${recipe.titleVi}`}
                            >
                                <div className="relative h-[110px] overflow-hidden">
                                    <img
                                        src={recipe.image}
                                        alt={recipe.altText}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                                    />

                                    <div className="absolute top-2 left-2">
                                        <Badge
                                            className={`text-xs font-inter font-medium px-2 py-0.5 rounded-full border-0 ${isComplete
                                                    ? "bg-success text-success-foreground"
                                                    : "bg-accent text-accent-foreground"
                                                }`}
                                        >
                                            {isComplete ? "Đủ" : `Thiếu ${missingCount}`}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-3 flex flex-col gap-1.5">
                                    <p className="font-sans font-medium text-sm text-foreground leading-tight">
                                        {recipe.titleVi}
                                    </p>

                                    <p className="font-inter text-xs text-gray-400 leading-tight">
                                        {recipe.cuisine} • {recipe.meal}
                                    </p>

                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock weight="duotone" size={12} />
                                        <span className="font-inter text-xs">{recipe.time}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-1">
                                            {isComplete ? (
                                                <CheckCircle
                                                    weight="duotone"
                                                    size={14}
                                                    className="text-green-600"
                                                />
                                            ) : (
                                                <Warning
                                                    weight="duotone"
                                                    size={14}
                                                    className="text-amber-500"
                                                />
                                            )}

                                            <span
                                                className={`font-inter text-xs font-medium ${isComplete ? "text-green-600" : "text-amber-500"
                                                    }`}
                                            >
                                                {isComplete
                                                    ? "Đủ nguyên liệu"
                                                    : `Thiếu ${missingCount} nguyên liệu`}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/meal/${recipe.id}`)}
                                        className="mt-1 text-primary text-xs font-inter font-medium hover:underline text-left focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                        aria-label={`Xem ngay công thức ${recipe.titleVi}`}
                                    >
                                        Xem ngay →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <div className="mt-8">
                    <Footer />
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default CookPage;