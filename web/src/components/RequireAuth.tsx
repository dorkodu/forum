import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore"

function RequireAuth() {
  const authorized = useAuthStore(state => state.userId);

  return authorized ? <Outlet /> : < Navigate to="/home" replace />
}

export default RequireAuth