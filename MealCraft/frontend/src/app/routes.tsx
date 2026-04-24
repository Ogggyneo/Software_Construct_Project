import { createBrowserRouter, Navigate } from "react-router-dom";
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
import { CookingMission } from "./components/CookingMission";
import { CreateGroup } from "./components/CreateGroup";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  // Default redirect
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Auth
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Main App Layout
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
      { path: "profile", element: <Profile /> },
    ],
  },

  // ✅ Add direct access routes (fix 404)
  {
    path: "/order-food",
    element: <Navigate to="/home/order-food" replace />,
  },
  {
    path: "/ingredients",
    element: <Navigate to="/home/ingredients" replace />,
  },
  {
    path: "/group-chat",
    element: <Navigate to="/home/group-chat" replace />,
  },

  // Other pages
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

  // ❌ Catch all (important)
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/cooking-mission",
    element: (
      <ProtectedRoute>
        <CookingMission />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-group",
    element: (
      <ProtectedRoute>
        <CreateGroup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: <Navigate to="/home/profile" replace />,
  },
]);