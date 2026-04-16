// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'; // Use react-router-dom

export function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem('isAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}