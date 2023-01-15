import { useState } from "react"
import Comment from "./Comment"

function Discussion() {
  const [showing, setShowing] = useState<"comments" | "arguments">("arguments");

  return (
    <>
      <div>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
        &nbsp;
        <span>16h</span>
      </div>

      <hr />

      <div>
        readme
      </div>

      <hr />

      <div>
        <button onClick={() => { setShowing("comments") }}>show comments</button>
        <button onClick={() => { setShowing("arguments") }}>show arguments</button>
        <br />
        {showing === "comments" &&
          <>
            <button>time asc</button>
            <button>time desc</button>
          </>
        }
        {showing === "arguments" &&
          <>
            <button>time asc</button>
            <button>time desc</button>
            <br />
            <button>show all</button>
            <button>show positive</button>
            <button>show negative</button>
            <br />
            <button>any votes</button>
            <button>most votes</button>
            <button>least votes</button>
          </>
        }
      </div>

      <hr />

      <div>showing {showing}</div>

      {[...Array(5)].map((_v, i) => <div key={i}><hr /><Comment /></div>)}
    </>
  )
}

export default Discussion