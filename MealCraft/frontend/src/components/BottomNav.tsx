import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, ForkKnife, ShoppingCart } from "@phosphor-icons/react";

const navItems = [
    { label: "Khám phá", icon: House, path: "/home" },
    { label: "Nấu ăn", icon: ForkKnife, path: "/cook" },
    { label: "Đặt món", icon: ShoppingCart, path: "/order" },
];

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
            style={{ height: "64px" }}
            role="navigation"
            aria-label="Điều hướng chính"
        >
            <div className="max-w-[480px] mx-auto h-full flex items-stretch">
                {navItems.map(({ label, icon: Icon, path }) => {
                    const isActive = location.pathname === path;

                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary relative ${isActive ? "text-primary" : "text-gray-400 hover:text-primary"
                                }`}
                            aria-label={label}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon weight={isActive ? "duotone" : "regular"} size={24} />
                            <span className="font-inter text-xs font-medium">{label}</span>

                            {isActive && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;