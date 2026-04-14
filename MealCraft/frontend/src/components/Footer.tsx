import React from "react";
import { Lightning } from "@phosphor-icons/react";

const Footer: React.FC = () => {
    return (
        <footer className="py-4 text-center" role="contentinfo">
            <p className="font-inter text-xs text-gray-400 flex items-center justify-center gap-1">
                Made with{" "}
                <Lightning
                    weight="duotone"
                    size={14}
                    className="text-foreground"
                />{" "}
                by MealCraft
            </p>
        </footer>
    );
};

export default Footer;