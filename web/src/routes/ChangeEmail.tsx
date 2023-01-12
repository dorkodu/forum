import { useRef, useState } from "react";
import { useUserStore } from "../stores/userStore";

function ChangeEmail() {
  const [done, setDone] = useState(false);
  const queryInitiateEmailChange = useUserStore(state => state.queryInitiateEmailChange);

  const changeEmailEmail = useRef<HTMLInputElement>(null);

  const initiateEmailChange = async () => {
    const email = changeEmailEmail.current?.value;
    if (!email) return;
    if (!await queryInitiateEmailChange(email)) return;
    setDone(true);
  }

  return (
    <>
      <input ref={changeEmailEmail} type={"email"} placeholder={"new email..."} />
      <br />
      <button onClick={initiateEmailChange}>initiate email change</button>
      <br />
      {done && <div>mail is sent. please check your email.</div>}
    </>
  )
}

export default ChangeEmail