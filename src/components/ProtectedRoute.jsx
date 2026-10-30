import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "./UI";

export default function ProtectedRoute({ children }) {
  const { token, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <LoadingScreen label="Checking your session…" />;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
