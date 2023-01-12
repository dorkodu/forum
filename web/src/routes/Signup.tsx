import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const querySignup = useUserStore(state => state.querySignup);
  const queryVerifySignup = useUserStore(state => state.queryVerifySignup);
  const queryConfirmSignup = useUserStore(state => state.queryConfirmSignup);

  const initialStage = searchParams.get("token") ? "verify" : "signup";
  const [stage, setStage] = useState<"signup" | "verify" | "confirm">(initialStage);
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  const signupUsername = useRef<HTMLInputElement>(null);
  const signupEmail = useRef<HTMLInputElement>(null);
  const signupPassword = useRef<HTMLInputElement>(null);

  useEffect(() => { if (stage === "verify") verifySignup() }, [])

  const signup = async () => {
    const username = signupUsername.current?.value;
    const email = signupEmail.current?.value;
    if (!username || !email) return;
    if (!await querySignup(username, email)) return;
    setStage("confirm");
  }

  const verifySignup = async () => {
    const token = searchParams.get("token");
    if (!token) return;

    const verified = await queryVerifySignup(token);
    setStatus(verified);
  }

  const confirmSignup = async () => {
    const username = signupUsername.current?.value;
    const email = signupEmail.current?.value;
    const password = signupPassword.current?.value;
    if (!username || !email || !password) return;
    if (!await queryConfirmSignup(username, email, password)) return;

    const redirect = searchParams.get("redirect");
    if (!redirect) navigate("/dashboard");
    else navigate(redirect);
  }

  return (
    <>
      {stage !== "verify" &&
        <>
          <input ref={signupUsername} type={"text"} placeholder={"username..."} disabled={stage === "confirm"} />
          <br />
          <input ref={signupEmail} type={"email"} placeholder={"email..."} disabled={stage === "confirm"} />
          <br />
          <input ref={signupPassword} type={"password"} placeholder={"password..."} disabled={stage === "confirm"} />
          <br />
          <button onClick={() => stage === "signup" ? signup() : confirmSignup()}>signup</button>
        </>
      }
      {stage === "verify" && status === undefined && <>loading...</>}
      {stage === "verify" && status === true && <>verified.</>}
      {stage === "verify" && status === false && <>couldn't verify.</>}
    </>
  )
}

export default Signup