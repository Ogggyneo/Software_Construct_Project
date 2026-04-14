import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Fire, ArrowRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { recipes } from "../data/recipes";

const categoryFilters = ["Tất cả", "Châu Á"];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState("Tất cả");

    const featuredRecipes = recipes.slice(0, 2);
    const filteredRecipes =
        activeFilter === "Châu Á"
            ? recipes.filter((r) => ["Món Việt", "Món Nhật"].includes(r.cuisine))
            : recipes;

    const gridRecipes = filteredRecipes.slice(0, 6);

    return (
        <div className="min-h-screen bg-background flex flex-col animate-fade-in">
            <TopBar />

            <main
                className="flex-1 max-w-[480px] mx-auto w-full pt-[56px] pb-[80px] px-4"
                role="main"
                id="main-content"
            >
                <section className="pt-6 pb-4" aria-label="Lời chào">
                    <p className="font-inter text-sm text-gray-500 mb-1">Xin chào, Minh!</p>
                    <h1 className="font-sans font-bold text-[28px] leading-tight text-foreground tracking-tight">
                        Bạn muốn ăn gì hôm <span className="text-primary">nay?</span>
                    </h1>
                </section>

                <section className="mb-4" aria-label="Gợi ý cho bạn">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-sans font-medium text-base text-foreground">
                            Gợi ý cho bạn
                        </h2>
                        <button
                            onClick={() => navigate("/cook")}
                            className="flex items-center gap-1 text-primary text-sm font-inter font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            aria-label="Xem thêm gợi ý"
                        >
                            Xem thêm
                            <ArrowRight weight="bold" size={14} />
                        </button>
                    </div>

                    <div
                        className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
                        role="list"
                        aria-label="Công thức nổi bật"
                    >
                        {featuredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                role="listitem"
                                className="relative flex-shrink-0 w-[220px] h-[160px] rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-[1.02] border border-border"
                                onClick={() => navigate(`/meal/${recipe.id}`)}
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && navigate(`/meal/${recipe.id}`)
                                }
                                aria-label={`Xem công thức ${recipe.titleVi}`}
                            >
                                <img
                                    src={recipe.image}
                                    alt={recipe.altText}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {recipe.badge && (
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-background text-foreground text-xs font-inter font-medium px-2 py-0.5 rounded-full border-0">
                                            {recipe.badge}
                                        </Badge>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Fire weight="fill" size={12} className="text-orange-400" />
                                        <span className="text-white/90 text-xs font-inter">
                                            {recipe.categoryVi}
                                        </span>
                                    </div>
                                    <p className="text-white font-sans font-medium text-sm leading-tight mb-1">
                                        {recipe.titleVi}
                                    </p>
                                    <div className="flex items-center gap-1 text-white/80">
                                        <Clock size={12} />
                                        <span className="text-xs font-inter">{recipe.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-4" aria-label="Lọc theo danh mục">
                    <div className="flex gap-2 mb-4" role="tablist" aria-label="Lọc theo danh mục">
                        {categoryFilters.map((filter) => (
                            <button
                                key={filter}
                                role="tab"
                                aria-selected={activeFilter === filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-inter font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${activeFilter === filter
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                <section aria-label="Danh sách món ăn">
                    <div
                        className="grid grid-cols-2 gap-4"
                        role="list"
                        aria-label="Danh sách món ăn"
                    >
                        {gridRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                role="listitem"
                                className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1"
                                onClick={() => navigate(`/meal/${recipe.id}`)}
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && navigate(`/meal/${recipe.id}`)
                                }
                                aria-label={`Xem công thức ${recipe.titleVi}`}
                            >
                                <div className="relative h-[110px] overflow-hidden">
                                    <img
                                        src={recipe.image}
                                        alt={recipe.altText}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                                    />
                                </div>

                                <div className="p-3">
                                    <span className="font-inter text-xs text-gray-500 uppercase tracking-wide">
                                        {recipe.categoryVi}
                                    </span>
                                    <p className="font-sans font-medium text-sm text-foreground mt-0.5 leading-tight">
                                        {recipe.titleVi}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Footer />
            </main>

            <BottomNav />
        </div>
    );
};

export default HomePage;