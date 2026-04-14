import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Lightning,
    ShieldCheck,
    CheckCircle,
    Eye,
    EyeSlash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthTab = "login" | "register";

const SignupPage: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<AuthTab>("login");
    const [email, setEmail] = useState("demo@mealcraft.com");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(true);

    const validateEmail = (val: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(value.length === 0 ? true : validateEmail(value));
    };

    const handleLogin = async () => {
        if (!email || !password) return;
        if (!emailValid) return;
        if (activeTab === "register" && !username.trim()) return;

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
        navigate("/home");
    };

    const isDisabled =
        isLoading ||
        !email.trim() ||
        !password.trim() ||
        !emailValid ||
        (activeTab === "register" && !username.trim());

    return (
        <div className="min-h-screen bg-background flex flex-col animate-fade-in">
            <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col px-4 py-6">
                <header
                    className="flex items-center justify-between mb-8"
                    role="banner"
                >
                    <div className="flex items-center gap-2">
                        <Lightning weight="duotone" size={28} className="text-foreground" />
                        <span className="font-sans font-bold text-xl text-foreground">
                            MealCraft
                        </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-border flex items-center justify-center">
                        <span className="font-inter text-xs font-medium text-gray-600">
                            VN
                        </span>
                    </div>
                </header>

                <section className="mb-8" aria-label="Chào mừng">
                    <h1 className="font-sans font-bold text-[28px] leading-tight text-foreground mb-2">
                        Chào mừng trở lại!
                    </h1>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">
                        Kiến tạo bữa ăn hoàn hảo và{" "}
                        <span className="text-primary border-b-2 border-primary">
                            khám phá hương vị mỗi ngày.
                        </span>
                    </p>
                </section>

                <div
                    className="flex bg-gray-100 rounded-full p-1 mb-6 border border-gray-200"
                    role="tablist"
                    aria-label="Chọn đăng nhập hoặc đăng ký"
                >
                    {(["login", "register"] as AuthTab[]).map((tab) => (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-full text-sm font-inter font-medium transition-all duration-200 ${activeTab === tab
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab === "login" ? "Đăng nhập" : "Đăng ký"}
                        </button>
                    ))}
                </div>

                <section
                    className="flex flex-col gap-4 animate-slide-up"
                    aria-label={activeTab === "login" ? "Form đăng nhập" : "Form đăng ký"}
                >
                    {activeTab === "register" && (
                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="username"
                                className="font-inter text-sm font-medium text-foreground"
                            >
                                Tên người dùng
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên người dùng"
                                className="h-12 rounded-md border-input bg-gray-50 text-foreground placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="email"
                            className="font-inter text-sm font-medium text-foreground"
                        >
                            Email
                        </Label>

                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Nhập email của bạn"
                                className="h-12 rounded-md border-input bg-gray-50 text-foreground placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                                aria-describedby="email-hint"
                                aria-invalid={!emailValid}
                            />
                            {emailValid && email && (
                                <CheckCircle
                                    weight="duotone"
                                    size={20}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                                    aria-label="Email hợp lệ"
                                />
                            )}
                        </div>

                        {!emailValid && (
                            <p id="email-hint" className="text-xs text-red-500 font-inter">
                                Email chưa đúng định dạng.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="password"
                                className="font-inter text-sm font-medium text-foreground"
                            >
                                Mật khẩu
                            </Label>

                            <button
                                type="button"
                                className="text-primary text-xs font-inter hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                aria-label="Quên mật khẩu"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu của bạn"
                                className="h-12 rounded-md border-input bg-gray-50 text-foreground placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (
                                    <EyeSlash weight="duotone" size={20} />
                                ) : (
                                    <Eye weight="duotone" size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={isDisabled}
                        className="h-[52px] w-full rounded-full bg-gradient-primary text-primary-foreground font-sans font-bold text-base"
                        aria-label={
                            isLoading
                                ? "Đang xử lý"
                                : activeTab === "login"
                                    ? "Đăng nhập ngay"
                                    : "Đăng ký ngay"
                        }
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                {activeTab === "login" ? "Đăng nhập ngay" : "Đăng ký ngay"}
                                <ArrowRightIcon />
                            </span>
                        )}
                    </Button>
                </section>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-inter text-xs text-gray-400 uppercase tracking-widest">
                        Hoặc tiếp tục bằng
                    </span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <div className="flex gap-3">
                    <button
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-md border border-border bg-background text-foreground font-inter text-sm font-medium hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Đăng nhập bằng Google"
                    >
                        <GoogleIcon />
                        Google
                    </button>

                    <button
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-md border border-border bg-background text-foreground font-inter text-sm font-medium hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Đăng nhập bằng Apple"
                    >
                        <AppleIcon />
                        Apple
                    </button>
                </div>

                <div className="mt-6 flex items-start gap-2 bg-gray-50 rounded-md p-3 border border-border">
                    <ShieldCheck
                        weight="duotone"
                        size={20}
                        className="text-green-600 flex-shrink-0 mt-0.5"
                    />
                    <p className="font-inter text-xs text-gray-500 leading-relaxed">
                        Bảo mật 256-bit chuẩn quốc tế. Thông tin của bạn được mã hóa và bảo
                        vệ an toàn.
                    </p>
                </div>

                <p className="mt-4 text-center font-inter text-xs text-gray-400 leading-relaxed">
                    Bằng việc tiếp tục, bạn đồng ý với Điều khoản &{" "}
                    <button className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                        Chính sách bảo mật
                    </button>
                </p>

                <div className="mt-8 text-center">
                    <p className="font-inter text-xs text-gray-400 flex items-center justify-center gap-1">
                        Made with <Lightning weight="duotone" size={14} className="text-foreground" /> by
                        MealCraft
                    </p>
                </div>
            </div>
        </div>
    );
};

const ArrowRightIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
            d="M17.64 9.2c0-.64-.057-1.25-.164-1.84H9v3.48h4.84c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
        />
        <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            fill="#34A853"
        />
        <path
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
        />
        <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
        />
    </svg>
);

const AppleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
            d="M14.045 9.579c-.02-2.065 1.686-3.063 1.762-3.112-.96-1.404-2.453-1.596-2.984-1.617-1.27-.128-2.484.748-3.127.748-.643 0-1.635-.729-2.692-.71-1.386.02-2.668.806-3.38 2.044-1.44 2.497-.366 6.196 1.035 8.224.687.992 1.506 2.107 2.58 2.067 1.035-.041 1.425-.669 2.676-.669 1.25 0 1.602.669 2.696.648 1.114-.02 1.818-1.014 2.5-2.01.788-1.152 1.113-2.266 1.132-2.324-.025-.01-2.171-.833-2.198-3.289z"
            fill="#111"
        />
        <path
            d="M11.977 3.23c.563-.69.944-1.638.84-2.59-.812.034-1.815.547-2.4 1.22-.52.6-.982 1.578-.86 2.504.91.07 1.843-.46 2.42-1.134z"
            fill="#111"
        />
    </svg>
);

export default SignupPage;