import CardLoader from "@/components/loaders/CardLoader";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWait } from "../components/hooks";
import { useAuthStore } from "../stores/authStore";

function DorkoduID() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const queryGetAccessToken = useAuthStore(state => state.queryGetAccessToken);

  useEffect(() => {
    (async () => {
      if (code) await useWait(() => queryGetAccessToken(code))();
      navigate("/home");
    })()
  }, [])

  return <CardLoader />
}

export default DorkoduID