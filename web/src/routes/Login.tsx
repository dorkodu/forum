import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryLogin = useUserStore(state => state.queryLogin);
  const queryVerifyLogin = useUserStore(state => state.queryVerifyLogin);

  const initialStage = searchParams.get("token") ? "verify" : "login";
  const [stage, setStage] = useState<"login" | "verify" | "confirm">(initialStage);
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  const loginInfo = useRef<HTMLInputElement>(null);
  const loginPassword = useRef<HTMLInputElement>(null);

  useEffect(() => { if (stage === "verify") verifyLogin() }, [])

  const login = async () => {
    const info = loginInfo.current?.value;
    const password = loginPassword.current?.value;
    if (!info || !password) return;
    const res = await queryLogin(info, password);
    if (res === "error") return;
    if (res === "confirm") { setStage("confirm"); return; }

    const redirect = searchParams.get("redirect");
    if (!redirect) navigate("/dashboard");
    else navigate(redirect);
  }

  const verifyLogin = async () => {
    const token = searchParams.get("token");
    if (!token) return;

    const verified = await queryVerifyLogin(token);
    setStatus(verified);
  }

  return (
    <>
      {stage !== "verify" &&
        <>
          <input ref={loginInfo} type={"text"} placeholder={"username or email..."} disabled={stage === "confirm"} />
          <br />
          <input ref={loginPassword} type={"password"} placeholder={"password..."} disabled={stage === "confirm"} />
          <br />
          <button onClick={login}>login</button>
        </>
      }
      {stage === "verify" &&
        <>
          {stage === "verify" && status === undefined && <>loading...</>}
          {stage === "verify" && status === true && <>verified.</>}
          {stage === "verify" && status === false && <>couldn't verify.</>}
        </>
      }
    </>
  )
}

export default Login