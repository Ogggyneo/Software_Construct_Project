import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import CookPage from "./pages/CookPage";
import OrderPage from "./pages/OrderPage";
import MealDetailPage from "./pages/MealDetailPage";
import GroupChatPage from "./pages/GroupChatPage";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/signup" replace />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/cook" element={<CookPage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/meal/:id" element={<MealDetailPage />} />
                <Route path="/group-chat" element={<GroupChatPage />} />
                <Route path="*" element={<Navigate to="/signup" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;