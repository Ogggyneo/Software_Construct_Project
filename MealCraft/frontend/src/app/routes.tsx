import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { IngredientFinder } from "./components/IngredientFinder";
import { GroupChat } from "./components/GroupChat";
import { OrderFood } from "./components/OrderFood";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MealDetail } from "./components/MealDetail";
import { ComingSoon } from "./components/CommingSoon";
import {ProtectedRoute} from "./components/ProtectedRoute";

export const router = createBrowserRouter([
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
    Component: MealDetail,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
          path: "/",
          Component: Layout,
          children: [
            { index: true, Component: Home },
            { path: "ingredients", Component: IngredientFinder },
            { path: "order-food", Component: OrderFood },
            { path: "group-chat", Component: GroupChat },
            { path: "coming-soon", Component: ComingSoon },
          ],
      }],
  },
]);