import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "../components/Session";
import Access from "../components/Access";
import Spinner from "../components/Spinner";
import { date } from "../lib/date";
import { useUserStore } from "../stores/userStore"
import { request, sage } from "../stores/api";
import { array } from "../lib/array";

function Dashboard() {
  const navigate = useNavigate();

  const setUser = useUserStore(state => state.setUser);
  const setCurrentSession = useUserStore(state => state.setCurrentSession);
  const setSessions = useUserStore(state => state.setSessions);
  const setAccesses = useUserStore(state => state.setAccesses);

  const queryGetSessions = useUserStore(state => state.queryGetSessions);
  const queryGetAccesses = useUserStore(state => state.queryGetAccesses);
  const queryLogout = useUserStore(state => state.queryLogout);

  const user = useUserStore(state => state.user);
  const currentSession = useUserStore(state => state.currentSession);
  const sessions = useUserStore(state => state.session.sorted);
  const accesses = useUserStore(state => state.access.sorted);

  useEffect(() => {
    (async () => {
      const sessionAnchor = array.getAnchor(sessions, "id", "-1", "newer", true);
      const accessAnchor = array.getAnchor(accesses, "id", "-1", "newer", true);

      const res = await sage.get({
        a: sage.query("getUser", undefined, { ctx: "ctx", }),
        b: sage.query("getCurrentSession", undefined, { ctx: "ctx", wait: "a" }),
        c: sage.query("getSessions", { anchor: sessionAnchor, type: "newer" }, { ctx: "ctx", wait: "a" }),
        d: sage.query("getAccesses", { anchor: accessAnchor, type: "newer" }, { ctx: "ctx", wait: "a" }),
      }, (query) => request(query));

      setUser(res?.a.data);
      setCurrentSession(res?.b.data);
      setSessions(res?.c.data, true);
      setAccesses(res?.d.data, true);
    })();
  }, []);

  const logout = async () => {
    await queryLogout() && navigate("/welcome");
  }

  const getSessions = async (type: "older" | "newer", refresh?: boolean) => {
    if (!user) return;
    await queryGetSessions(type, refresh);
  }

  const getAccesses = async (type: "older" | "newer", refresh?: boolean) => {
    if (!user) return;
    await queryGetAccesses(type, refresh);
  }

  return (
    <>
      <div>
        <div>username: {user?.username}</div>
        <div>email: {user?.email}</div>
        <div>joined at: {user && date(user.joinedAt).format('lll')}</div>
      </div>

      <br />

      <div>
        <button onClick={() => { navigate("/change_username") }}>change username</button>
        <br />
        <button onClick={() => { navigate("/change_email") }}>change email</button>
        <br />
        <button onClick={() => { navigate("/change_password") }}>change password</button>
      </div>

      <br />

      <div>
        <div>current session:</div>
        {currentSession ?
          <Session session={currentSession} /> :
          <Spinner />
        }
      </div>

      <br />

      <div>
        <div>all sessions:</div>
        <button onClick={() => { getSessions("older") }}>load older</button>
        <button onClick={() => { getSessions("newer") }}>load newer</button>
        <button onClick={() => { getSessions("newer", true) }}>refresh</button>
        {
          sessions.map(session => <Session session={session} key={session.id} />)
        }
      </div>

      <br />

      <div>
        <div>all accesses:</div>
        <button onClick={() => { getAccesses("older") }}>load older</button>
        <button onClick={() => { getAccesses("newer") }}>load newer</button>
        <button onClick={() => { getAccesses("newer", true) }}>refresh</button>
        {
          accesses.map(access => <Access access={access} key={access.id} />)
        }
      </div>

      <br />

      <button onClick={logout}>logout</button>
    </>
  )
}

export default Dashboard