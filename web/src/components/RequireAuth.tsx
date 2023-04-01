import { useAppStore } from "@/stores/appStore";
import { useLayoutEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore"

function RequireAuth() {
  const authorized = useAuthStore(state => state.userId);

  useLayoutEffect(() => {
    if (authorized) return;
    useAppStore.getState().setRequestLogin(true);
  }, []);

  return authorized ? <Outlet /> : <Navigate to="/home" replace />
}

export default RequireAuth