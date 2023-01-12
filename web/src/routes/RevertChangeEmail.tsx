import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useUserStore } from "../stores/userStore";

function RevertChangeEmail() {
  const [searchParams] = useSearchParams();
  const [done, setDone] = useState<undefined | boolean>(undefined);
  const queryRevertEmailChange = useUserStore(state => state.queryRevertEmailChange);

  useEffect(() => { revertEmailChange() }, []);

  const revertEmailChange = async () => {
    const token = searchParams.get("token");
    if (!token) return setDone(false);
    if (!await queryRevertEmailChange(token)) return setDone(false);
    setDone(true);
  }

  return (
    <>
      {done === undefined && <Spinner />}
      {done === false && <div>email could not be reverted.</div>}
      {done === true && <div>email is reverted.</div>}
    </>
  )
}

export default RevertChangeEmail