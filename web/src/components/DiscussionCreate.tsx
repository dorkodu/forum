import { useReducer } from "react"
import { useDiscussionStore } from "../stores/discussionStore";

interface State {
  title: string;
  readme: string;
  loading: boolean;
  status: boolean | undefined;
}

function DiscussionCreate() {
  const [discussion, setDiscussion] = useReducer((prev: State, next: State) => {
    const newDiscussion = { ...prev, ...next };

    if (newDiscussion.title.length > 100)
      newDiscussion.title = newDiscussion.title.substring(0, 100);

    if (newDiscussion.readme.length > 100000)
      newDiscussion.title = newDiscussion.title.substring(0, 100000);

    return newDiscussion;
  }, { title: "", readme: "", loading: false, status: undefined })

  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);

  const createDiscussion = async () => {
    if (discussion.title.length === 0) return;
    if (discussion.title.length > 100) return;
    if (discussion.readme.length === 0) return;
    if (discussion.readme.length > 100000) return;

    setDiscussion({ ...discussion, loading: true, status: undefined });
    const status = await queryCreateDiscussion(discussion.title, discussion.readme);
    setDiscussion({ ...discussion, loading: false, status: status });
  }

  return (
    <>
      <input
        type="text"
        placeholder="title"
        disabled={discussion.loading}
        defaultValue={discussion.title}
        onChange={(ev) => { setDiscussion({ ...discussion, title: ev.target.value }) }}
      />

      <br />

      <textarea
        placeholder="readme"
        disabled={discussion.loading}
        defaultValue={discussion.readme}
        onChange={(ev) => { setDiscussion({ ...discussion, readme: ev.target.value }) }}
      ></textarea>

      <br />

      <button
        disabled={discussion.loading}
        onClick={createDiscussion}
      >
        create
      </button>

      {discussion.loading && <><br />loading...</>}
      {discussion.status === true && <><br />success...</>}
      {discussion.status === false && <><br />fail...</>}
    </>
  )
}

export default DiscussionCreate