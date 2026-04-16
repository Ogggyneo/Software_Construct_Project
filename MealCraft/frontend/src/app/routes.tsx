import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { IngredientFinder } from "./components/IngredientFinder";
import { GroupChat } from "./components/GroupChat";
import { OrderFood } from "./components/OrderFood";
import { Login } from "./components/Login";
//import { Register } from "./components/Register";
import { MealDetail } from "./components/MealDetail";
import { ComingSoon } from "./components/CommingSoon";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />, 
  },
  // {
  //   path: "/register",
  //   element: <Register />, 
  // },
  {
    path: "/meal-detail",
    element: <MealDetail />, 
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />, 
        children: [
          { index: true, element: <Home /> },
          { path: "ingredients", element: <IngredientFinder /> },
          { path: "order-food", element: <OrderFood /> },
          { path: "group-chat", element: <GroupChat /> },
          { path: "coming-soon", element: <ComingSoon /> },
        ],
      },
    ],
  },
]);