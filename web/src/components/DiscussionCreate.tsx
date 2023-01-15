import { useState } from "react"

function DiscussionCreate() {
  const [discussion, setDiscussion] = useState({ title: "", readme: "" })

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

      <button>create</button>
    </>
  )
}

export default DiscussionCreate