import { useEffect, useReducer } from "react"
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";

interface Props {
  id: string | undefined;
}

interface State {
  title: string;
  readme: string;

  edit: {
    loading: boolean;
    status: boolean | undefined;
  }

  create: {
    loading: boolean;
    status: boolean | undefined;
  }
}

function DiscussionEditor({ id }: Props) {
  const [state, setState] = useReducer((prev: State, next: State) => {
    const newState = { ...prev, ...next };

    if (newState.title.length > 100)
      newState.title = newState.title.substring(0, 100);

    if (newState.readme.length > 100000)
      newState.title = newState.title.substring(0, 100000);

    return newState;
  }, {
    title: "", readme: "",
    create: { loading: false, status: undefined },
    edit: { loading: false, status: undefined },
  })

  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);
  const queryEditDiscussion = useDiscussionStore(state => state.queryEditDiscussion);

  const createDiscussion = async () => {
    if (state.create.loading) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, create: { ...state.create, loading: true, status: undefined } });
    const status = await queryCreateDiscussion(state.title, state.readme);
    setState({ ...state, create: { ...state.create, loading: false, status: status } });
  }

  const editDiscussion = async () => {
    if (state.edit.loading) return;
    if (!id) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, edit: { ...state.edit, loading: true, status: undefined } });
    const status = await queryEditDiscussion(id, state.title, state.readme);
    setState({ ...state, edit: { ...state.edit, loading: false, status: status } });
  }

  const fetchDiscussion = async (id: string) => {
    const res = await sage.get(
      { a: sage.query("getDiscussion", { discussionId: id }), },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const discussion = res?.a.data;

    return { status, title: discussion?.title, readme: discussion?.readme };
  }

  useEffect(() => {
    (async () => {
      if (!id) return;
      setState({ ...state, edit: { ...state.edit, loading: true, status: undefined } });
      const out = await fetchDiscussion(id);
      setState({
        ...state,
        title: out.title ?? "",
        readme: out.readme ?? "",
        edit: { ...state.edit, loading: false, status: out.status },
      });
    })()
  }, [])

  return (
    <>
      <input
        type="text"
        placeholder="title"
        disabled={id ? state.edit.loading : state.create.loading}
        defaultValue={state.title}
        onChange={(ev) => { setState({ ...state, title: ev.target.value }) }}
      />

      <br />

      <textarea
        placeholder="readme"
        disabled={id ? state.edit.loading : state.create.loading}
        defaultValue={state.readme}
        onChange={(ev) => { setState({ ...state, readme: ev.target.value }) }}
      ></textarea>

      <br />

      <button
        disabled={id ? state.edit.loading : state.create.loading}
        onClick={id ? editDiscussion : createDiscussion}
      >
        {id ? <>edit</> : <>create</>}
      </button>

      {state.create.loading && <><br />loading...</>}
      {state.create.status === true && <><br />success...</>}
      {state.create.status === false && <><br />fail...</>}

      {state.edit.loading && <><br />loading...</>}
      {state.edit.status === true && <><br />success...</>}
      {state.edit.status === false && <><br />fail...</>}
    </>
  )
}

export default DiscussionEditor