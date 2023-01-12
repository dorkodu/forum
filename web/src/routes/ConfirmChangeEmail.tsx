import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useUserStore } from "../stores/userStore";

function ConfirmChangeEmail() {
  const [searchParams] = useSearchParams();
  const [done, setDone] = useState<undefined | boolean>(undefined);
  const queryConfirmEmailChange = useUserStore(state => state.queryConfirmEmailChange);

  useEffect(() => { confirmEmailChange() }, []);

  const confirmEmailChange = async () => {
    const token = searchParams.get("token");
    if (!token) return setDone(false);
    if (!await queryConfirmEmailChange(token)) return setDone(false);
    setDone(true);
  }

  return (
    <>
      {done === undefined && <Spinner />}
      {done === false && <div>email could not be changed.</div>}
      {done === true && <div>email is changed.</div>}
    </>
  )
}

export default ConfirmChangeEmail