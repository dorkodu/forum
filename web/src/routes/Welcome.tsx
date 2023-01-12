import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../stores/userStore";

function Welcome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const authorized = useUserStore(state => state.authorized);

  return (
    <>
      <h3>{t("welcome")}</h3>
      {authorized &&
        <button onClick={() => { navigate("/dashboard") }}>dashboard</button>
      }
      {!authorized &&
        <>
          <button onClick={() => { navigate("/login") }}>login</button>
          <br />
          <button onClick={() => { navigate("/signup") }}>signup</button>
          <br />
          <button onClick={() => { navigate("/change_password") }}>forgot password</button>
        </>
      }
    </>
  )
}

export default Welcome