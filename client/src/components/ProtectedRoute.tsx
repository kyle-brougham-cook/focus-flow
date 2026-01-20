import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: props) => {
  const { isAuthenticated, isLoading} = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to={"/login"} replace />;

  return <>{children}</>;
}

export default ProtectedRoute;
