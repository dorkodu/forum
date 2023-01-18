import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore"

function RequireAuth() {
  const authorized = useAuthStore(state => state.authorized);

  return authorized ? <Outlet /> : < Navigate to="/welcome" replace />
}

export default RequireAuth