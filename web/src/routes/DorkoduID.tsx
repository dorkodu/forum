import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/authStore";

function DorkoduID() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const queryGetAccessToken = useUserStore(state => state.queryGetAccessToken);

  useEffect(() => {
    (async () => {
      if (!code) return;
      const status = await queryGetAccessToken(code);
      if (status) navigate("/home");
    })()
  }, [])

  return (
    <>
      dorkodu id
    </>
  )
}

export default DorkoduID