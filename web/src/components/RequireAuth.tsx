import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../stores/userStore"

function RequireAuth() {
  const authorized = useUserStore(state => state.authorized);

  return authorized ? <Outlet /> : < Navigate to="/welcome" replace />
}

export default RequireAuth