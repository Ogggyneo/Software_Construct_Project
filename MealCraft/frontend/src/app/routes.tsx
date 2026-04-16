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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
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
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Home },
      { path: "ingredients", Component: IngredientFinder },
      { path: "order-food", Component: OrderFood },
      { path: "group-chat", Component: GroupChat },
    ],
  },
]);