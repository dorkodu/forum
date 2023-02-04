import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";

function DorkoduID() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const setAuthLoading = useAppStore(state => state.setAuthLoading);
  const queryGetAccessToken = useAuthStore(state => state.queryGetAccessToken);

  useEffect(() => {
    (async () => {
      setAuthLoading(true);
      if (code) await queryGetAccessToken(code);
      navigate("/home");
    })()
  }, [])

  return (<></>)
}

export default DorkoduID