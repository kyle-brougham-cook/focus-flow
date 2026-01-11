import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: props) => {
  const { isAuthenticated } = useAuth();

  return (
    <>{isAuthenticated ? <div>{children}</div> : <Navigate to={"/login"} />}</>
  );
};

export default ProtectedRoute;
