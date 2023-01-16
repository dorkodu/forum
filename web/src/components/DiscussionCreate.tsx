import { useReducer } from "react"
import { useDiscussionStore } from "../stores/discussionStore";

interface State {
  title: string;
  readme: string;
}

function DiscussionCreate() {
  const [discussion, setDiscussion] = useReducer((prev: State, next: State) => {
    const newDiscussion = { ...prev, ...next };

    if (newDiscussion.title.length > 100)
      newDiscussion.title = newDiscussion.title.substring(0, 100);

    if (newDiscussion.readme.length > 100000)
      newDiscussion.title = newDiscussion.title.substring(0, 100000);

    return newDiscussion;
  }, { title: "", readme: "" })

  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);

  const createDiscussion = async () => {
    if (discussion.title.length === 0) return;
    if (discussion.readme.length === 0) return;

    const status = await queryCreateDiscussion(discussion.title, discussion.readme);
    console.log(status);
  }

  return (
    <>
      <input
        type="text"
        placeholder="title"
        defaultValue={discussion.title}
        onChange={(ev) => { setDiscussion({ ...discussion, title: ev.target.value }) }}
      />

      <br />

      <textarea
        placeholder="readme"
        defaultValue={discussion.readme}
        onChange={(ev) => { setDiscussion({ ...discussion, readme: ev.target.value }) }}
      ></textarea>

      <br />

      <button onClick={createDiscussion}>create</button>
    </>
  )
}

export default DiscussionCreate