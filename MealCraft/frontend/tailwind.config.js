/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["DM Sans", "sans-serif"],
                mono: ["IBM Plex Mono", "monospace"],
                inter: ["Inter", "sans-serif"],
            },
            colors: {
                primary: {
                    DEFAULT: "hsl(145, 100%, 40%)",
                    foreground: "hsl(0, 0%, 100%)",
                    hover: "hsl(145, 100%, 35%)",
                    active: "hsl(145, 99%, 30%)",
                },
                secondary: {
                    DEFAULT: "hsl(145, 70%, 50%)",
                    foreground: "hsl(0, 0%, 98%)",
                    hover: "hsl(145, 70%, 45%)",
                    active: "hsl(145, 70%, 40%)",
                },
                tertiary: {
                    DEFAULT: "hsl(0, 0%, 96%)",
                    foreground: "hsl(0, 0%, 20%)",
                },
                accent: {
                    DEFAULT: "hsl(27, 97%, 54%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
                background: "hsl(0, 0%, 100%)",
                foreground: "hsl(0, 0%, 6%)",
                border: "hsl(0, 0%, 90%)",
                success: {
                    DEFAULT: "hsl(145, 90%, 40%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
                warning: {
                    DEFAULT: "hsl(40, 98%, 50%)",
                    foreground: "hsl(35, 100%, 10%)",
                },
                error: {
                    DEFAULT: "hsl(0, 80%, 50%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
                info: {
                    DEFAULT: "hsl(210, 80%, 55%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
                gray: {
                    50: "hsl(0, 0%, 98%)",
                    100: "hsl(0, 0%, 95%)",
                    200: "hsl(0, 0%, 90%)",
                    300: "hsl(0, 0%, 80%)",
                    400: "hsl(0, 0%, 60%)",
                    500: "hsl(0, 0%, 45%)",
                    600: "hsl(0, 0%, 35%)",
                    700: "hsl(0, 0%, 25%)",
                    800: "hsl(0, 0%, 15%)",
                    900: "hsl(0, 0%, 8%)",
                },
                card: {
                    DEFAULT: "hsl(0, 0%, 100%)",
                    foreground: "hsl(0, 0%, 6%)",
                },
                muted: {
                    DEFAULT: "hsl(0, 0%, 96%)",
                    foreground: "hsl(0, 0%, 45%)",
                },
                popover: {
                    DEFAULT: "hsl(0, 0%, 100%)",
                    foreground: "hsl(0, 0%, 6%)",
                },
                input: "hsl(0, 0%, 85%)",
                ring: "hsl(145, 100%, 40%)",
                destructive: {
                    DEFAULT: "hsl(0, 80%, 50%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
            },
            borderRadius: {
                sm: "8px",
                md: "12px",
                lg: "16px",
                xl: "20px",
                full: "9999px",
                DEFAULT: "12px",
            },
            boxShadow: {
                sm: "0 1px 2px hsla(0, 0%, 0%, 0.05)",
                md: "0 4px 6px hsla(0, 0%, 0%, 0.08)",
                lg: "0 10px 20px hsla(0, 0%, 0%, 0.1)",
                xl: "0 20px 40px hsla(145, 100%, 20%, 0.08)",
                card: "0 4px 16px hsla(0, 0%, 0%, 0.05)",
                "card-hover": "0 6px 20px hsla(145, 100%, 30%, 0.1)",
                "btn-primary": "0 4px 12px hsla(145, 100%, 30%, 0.25)",
            },
            backgroundImage: {
                "gradient-primary":
                    "linear-gradient(135deg, hsl(145, 100%, 45%) 0%, hsl(145, 100%, 38%) 100%)",
                "gradient-secondary":
                    "linear-gradient(135deg, hsl(145, 70%, 55%) 0%, hsl(145, 70%, 45%) 100%)",
                "gradient-accent":
                    "linear-gradient(135deg, hsl(37, 98%, 60%) 0%, hsl(27, 97%, 54%) 100%)",
            },
            transitionTimingFunction: {
                "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
                "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
                "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
            },
            animation: {
                "fade-in": "fadeIn 250ms ease-in-out",
                "slide-up": "slideUp 300ms ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};