import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Info,
    Plus,
    PaperPlaneTilt,
    Clock,
} from "@phosphor-icons/react";

interface Message {
    id: number;
    sender: string;
    avatar: string;
    text: string;
    time: string;
    isMine: boolean;
}

const defaultMessages: Message[] = [
    {
        id: 1,
        sender: "Minh Anh",
        avatar: "https://i.pravatar.cc/40?img=5",
        text: "Mọi người ơi, hôm nay ăn cơm gà Hải Nam ở quán cũ nhé? Mình thấy đang có mã giảm giá 30%.",
        time: "10:30",
        isMine: false,
    },
    {
        id: 2,
        sender: "Hoàng Long",
        avatar: "https://i.pravatar.cc/40?img=12",
        text: "Duyệt luôn! Mình một suất đùi gà quay ít cơm nhé.",
        time: "10:32",
        isMine: false,
    },
    {
        id: 3,
        sender: "Bạn",
        avatar: "",
        text: "Mình gửi link gom nhóm grab nhé: abc.grab.vn.com . Mọi người tự trả tiền nhé",
        time: "10:35",
        isMine: true,
    },
    {
        id: 4,
        sender: "Minh Anh",
        avatar: "https://i.pravatar.cc/40?img=5",
        text: "Ok mình thấy rồi. Còn thiếu sếp tổng nữa là đủ đơn để áp mã giảm giá 50k nè.",
        time: "10:36",
        isMine: false,
    },
    {
        id: 5,
        sender: "Hoàng Long",
        avatar: "https://i.pravatar.cc/40?img=12",
        text: "Sếp đang họp rồi, chắc 11h mới xong. Mọi người cứ chốt trước đi.",
        time: "10:40",
        isMine: false,
    },
];

const GroupChatPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as
        | { groupName?: string; isNew?: boolean; food?: string; time?: string }
        | null;

    const groupName = state?.groupName ?? "Nhóm Cơm Trưa VP";
    const isNew = state?.isNew ?? false;

    const [messages, setMessages] = useState<Message[]>(
        isNew ? [] : defaultMessages
    );
    const [inputText, setInputText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const newMsg: Message = {
            id: Date.now(),
            sender: "Bạn",
            avatar: "",
            text: trimmed,
            time: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            isMine: true,
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputText("");
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex flex-col max-w-[480px] mx-auto">
            <header
                className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border max-w-[480px] mx-auto"
                style={{ height: "56px" }}
            >
                <div className="h-full flex items-center justify-between px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft weight="bold" size={22} className="text-foreground" />
                    </button>

                    <h1 className="font-sans font-bold text-base text-foreground truncate max-w-[200px]">
                        {groupName}
                    </h1>

                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Thông tin nhóm"
                    >
                        <Info weight="regular" size={22} className="text-foreground" />
                    </button>
                </div>
            </header>

            <div className="fixed top-[56px] left-0 right-0 z-40 max-w-[480px] mx-auto">
                <div className="bg-orange-50 border-b border-orange-200 flex items-center gap-2 px-4 py-2.5">
                    <Clock
                        weight="duotone"
                        size={16}
                        className="text-orange-500 flex-shrink-0"
                    />
                    <span className="font-inter text-xs font-semibold text-orange-600 uppercase tracking-wide">
                        Hết hạn đặt sau {state?.time ?? "15:20"}
                    </span>
                </div>
            </div>

            <main className="flex-1 pt-[56px] pb-[100px] overflow-y-auto px-4">
                <div className="pt-[40px]">
                    <div className="flex items-center justify-center my-4">
                        <span className="font-inter text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                            HÔM NAY
                        </span>
                    </div>

                    {isNew && (
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 max-w-[260px] text-center">
                                <p className="font-inter text-sm text-green-700 font-medium">
                                    Nhóm mới được tạo!
                                </p>
                                <p className="font-inter text-xs text-green-500 mt-1">
                                    Chia sẻ nhóm để mọi người cùng đặt món {state?.food ?? ""}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isMine ? "justify-end" : "justify-start"} gap-2`}
                            >
                                {!msg.isMine && (
                                    <img
                                        src={msg.avatar}
                                        alt={msg.sender}
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 self-end"
                                    />
                                )}

                                <div
                                    className={`max-w-[72%] ${msg.isMine ? "items-end" : "items-start"} flex flex-col`}
                                >
                                    {!msg.isMine && (
                                        <span className="font-inter text-xs text-gray-500 mb-1 ml-1">
                                            {msg.sender}
                                        </span>
                                    )}

                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm font-inter leading-relaxed ${msg.isMine
                                                ? "bg-primary text-white rounded-br-sm"
                                                : "bg-white text-foreground rounded-bl-sm shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    <span className="font-inter text-[10px] text-gray-400 mt-1 mx-1">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div ref={bottomRef} />
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
                        <Plus weight="bold" size={18} className="text-gray-500" />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Nhập tin nhắn hoặc món ăn..."
                        className="flex-1 h-10 px-4 rounded-full bg-gray-100 text-sm font-inter text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                        onClick={handleSend}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-50"
                        aria-label="Gửi"
                    >
                        <PaperPlaneTilt weight="fill" size={18} className="text-white" />
                    </button>
                </div>

                <p className="font-inter text-[10px] text-gray-400 text-center mt-1.5">
                    Gõ tên món ăn để thảo luận cùng nhóm
                </p>
            </div>
        </div>
    );
};

export default GroupChatPage;