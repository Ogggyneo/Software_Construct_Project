import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, ForkKnife, Users } from "@phosphor-icons/react";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";

const waitingGroups = [
    {
        id: "g1",
        tags: ["Món Việt", "Phở"],
        title: "Nhóm ăn phở",
        location: "Tòa nhà Keangnam, Mễ Trì",
        time: "12:30 PM",
        members: 25,
        avatars: [
            "https://i.pravatar.cc/32?img=1",
            "https://i.pravatar.cc/32?img=2",
            "https://i.pravatar.cc/32?img=3",
        ],
    },
    {
        id: "g2",
        tags: ["Món Ý", "Pizza"],
        title: "Trưa nay ăn Pizza ko ạ?",
        location: "Lotte Center, Liễu Giai",
        time: "01:15 PM",
        members: 13,
        avatars: [
            "https://i.pravatar.cc/32?img=4",
            "https://i.pravatar.cc/32?img=5",
        ],
    },
    {
        id: "g3",
        tags: ["Ăn nhanh", "Bánh mì"],
        title: "Cho ai thèm Bánh Mì Huỳnh Hoa",
        location: "Vincom Center Bà Triệu",
        time: "12:00 PM",
        members: 58,
        avatars: [
            "https://i.pravatar.cc/32?img=6",
            "https://i.pravatar.cc/32?img=7",
            "https://i.pravatar.cc/32?img=8",
        ],
    },
];

const OrderPage: React.FC = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState("");
    const [time, setTime] = useState("12:00 PM");
    const [food, setFood] = useState("");

    const handleFindGroup = () => {
        if (!location.trim() && !food.trim()) return;

        navigate("/group-chat", {
            state: {
                groupName: food.trim() ? `Nhóm ${food.trim()}` : "Nhóm mới",
                isNew: true,
                food: food.trim(),
                time,
            },
        });
    };

    const handleJoinGroup = (group: (typeof waitingGroups)[0]) => {
        navigate("/group-chat", {
            state: {
                groupName: group.title,
                isNew: false,
                time: group.time,
            },
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col animate-fade-in">
            <header
                className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
                style={{ height: "56px" }}
                role="banner"
            >
                <div className="max-w-[480px] mx-auto h-full flex items-center gap-2 px-4">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <ForkKnife weight="fill" size={18} className="text-white" />
                    </div>
                    <h1 className="font-sans font-bold text-lg text-foreground">
                        Đặt món nhóm
                    </h1>
                </div>
            </header>

            <main
                className="flex-1 max-w-[480px] mx-auto w-full pt-[56px] pb-[80px] px-4"
                role="main"
            >
                <section className="pt-6 pb-5">
                    <h2 className="font-sans font-bold text-[20px] text-foreground mb-1">
                        Tìm nhóm quanh bạn
                    </h2>
                    <p className="font-inter text-sm text-gray-500 mb-5">
                        Nhập thông tin để tìm những người đang cùng đặt món tại khu vực của
                        bạn.
                    </p>

                    <label className="block font-sans font-semibold text-sm text-foreground mb-2">
                        Vị trí của bạn
                    </label>
                    <div className="relative mb-4">
                        <MapPin
                            weight="duotone"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="VD: 191 Bà Triệu, Hai Bà Trưng"
                            className="w-full h-12 pl-9 pr-4 rounded-lg border border-input bg-white text-sm font-inter text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <label className="block font-sans font-semibold text-sm text-foreground mb-2">
                                Thời gian
                            </label>
                            <div className="relative">
                                <Clock
                                    weight="duotone"
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    placeholder="12:00 PM"
                                    className="w-full h-11 pl-8 pr-3 rounded-lg border border-input bg-white text-sm font-inter text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-sans font-semibold text-sm text-foreground mb-2">
                                Sở thích
                            </label>
                            <div className="relative">
                                <ForkKnife
                                    weight="duotone"
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={food}
                                    onChange={(e) => setFood(e.target.value)}
                                    placeholder="Cơm, Phở..."
                                    className="w-full h-11 pl-8 pr-3 rounded-lg border border-input bg-white text-sm font-inter text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleFindGroup}
                        className="w-full h-12 rounded-xl bg-primary text-white font-sans font-bold text-base hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        Tìm nhóm ngay
                    </button>
                </section>

                <section className="pt-2 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-sans font-bold text-base text-foreground">
                            Các nhóm đang chờ
                        </h2>
                        <span className="font-inter text-sm text-primary font-medium">
                            {waitingGroups.length} nhóm khả dụng
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {waitingGroups.map((group) => (
                            <div
                                key={group.id}
                                className="bg-white rounded-xl border border-border p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {group.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-green-50 text-green-700 text-[11px] font-inter font-semibold px-2 py-0.5 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1 text-orange-500">
                                        <Clock weight="duotone" size={13} />
                                        <span className="font-inter text-xs font-semibold">
                                            {group.time}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-sans font-bold text-sm text-foreground mb-1.5">
                                    {group.title}
                                </h3>

                                <div className="flex items-center gap-1 text-gray-400 mb-3">
                                    <MapPin weight="duotone" size={13} />
                                    <span className="font-inter text-xs">{group.location}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="flex -space-x-2">
                                            {group.avatars.map((av, i) => (
                                                <img
                                                    key={i}
                                                    src={av}
                                                    alt="member"
                                                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                                />
                                            ))}
                                        </div>

                                        <span className="font-inter text-xs text-gray-400 ml-2 flex items-center gap-1">
                                            <Users weight="duotone" size={12} />+{group.members} người
                                            tham gia
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleJoinGroup(group)}
                                        className="flex items-center gap-1 bg-primary text-white text-xs font-inter font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        Tham gia →
                                    </button>
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

export default OrderPage;