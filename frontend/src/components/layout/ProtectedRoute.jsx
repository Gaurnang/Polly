import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Block access if email not verified yet
  if (user && user.email_verified === false) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
