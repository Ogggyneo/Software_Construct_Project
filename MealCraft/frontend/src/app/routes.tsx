import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { IngredientFinder } from "./components/IngredientFinder";
import { GroupChat } from "./components/GroupChat";
import { OrderFood } from "./components/OrderFood";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MealDetail } from "./components/MealDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ComingSoon } from "./components/CommingSoon";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/meal-detail",
    element: (
      <ProtectedRoute>
        <MealDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coming-soon",
    element: (
      <ProtectedRoute>
        <ComingSoon />
      </ProtectedRoute>
    ),
  },
  
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "ingredients", element: <IngredientFinder /> },
      { path: "order-food", element: <OrderFood /> },
      { path: "group-chat", element: <GroupChat /> },

      // ✅ FIXED
      { path: "coming-soon", element: <Navigate to="../group-chat" replace /> },
    ],
  },

  {
    path: "/group-chat",
    element: (
      <ProtectedRoute>
        <GroupChat />
      </ProtectedRoute>
    ),
  },
]);