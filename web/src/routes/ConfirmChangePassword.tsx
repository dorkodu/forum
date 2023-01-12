import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

function ConfirmChangePassword() {
  const [searchParams] = useSearchParams();
  const [done, setDone] = useState(false);
  const queryConfirmPasswordChange = useUserStore(state => state.queryConfirmPasswordChange);
  const changePasswordPassword = useRef<HTMLInputElement>(null);

  const confirmChangePassword = async () => {
    const password = changePasswordPassword.current?.value;
    const token = searchParams.get("token");
    if (!password || !token) return;
    if (!await queryConfirmPasswordChange(password, token)) return;
    setDone(true);
  }

  return (
    <>
      <input ref={changePasswordPassword} type={"text"} placeholder={"new password..."} />
      <br />
      <button onClick={confirmChangePassword}>confirm password change</button>
      {done && <div>password is changed. please login.</div>}
    </>
  )
}

export default ConfirmChangePassword