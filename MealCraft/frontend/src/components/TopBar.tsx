import React from "react";
import { useNavigate } from "react-router-dom";
import { Lightning, MagnifyingGlass } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

interface TopBarProps {
    onSearchClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearchClick }) => {
    const navigate = useNavigate();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
            style={{ height: "56px" }}
            role="banner"
        >
            <div className="max-w-[480px] mx-auto h-full flex items-center justify-between px-4">
                <button
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
                    aria-label="MealCraft - Trang chủ"
                >
                    <Lightning weight="duotone" size={28} className="text-foreground" />
                    <span className="font-sans font-bold text-lg text-foreground tracking-tight">
                        MealCraft
                    </span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onSearchClick}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        aria-label="Tìm kiếm"
                    >
                        <MagnifyingGlass
                            weight="duotone"
                            size={24}
                            className="text-foreground"
                        />
                    </button>

                    <div className="relative">
                        <Avatar className="w-9 h-9 cursor-pointer">
                            <AvatarFallback className="bg-primary text-primary-foreground font-sans font-medium text-sm">
                                M
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background"
                            aria-label="Trực tuyến"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;