import { useState } from "react"
import Argument from "./Argument";
import Comment from "./Comment"

function Discussion() {
  const [favourite, setFavourite] = useState(false);
  const [showing, setShowing] = useState<"comments" | "arguments">("arguments");
  const [time, setTime] = useState<"asc" | "desc">("desc");
  const [type, setType] = useState<"any" | "positive" | "negative">("any");
  const [votes, setVotes] = useState<"any" | "most" | "least">("any");

  const [comment, setComment] = useState({ text: "" });
  const [argument, setArgument] = useState({ text: "", type: "+" as "+" | "-" });

  return (
    <>
      <div>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
        &nbsp;
        <span>16h</span>
        <div>is milk white or black?</div>
        <div>
          <button onClick={() => { setFavourite(!favourite) }}>{favourite ? "unfavourite" : "favourite"}</button>
          &nbsp;
          <span>favourites: 123</span>
          &nbsp;
          <span>arguments: 123</span>
          &nbsp;
          <span>comments: 123</span>
        </div>
      </div>

      <hr />

      <div>
        readme
        <br />
        so the milk is cow's product and it's...
      </div>

      <hr />

      <div>
        <button onClick={() => { setShowing("comments") }}>show comments</button>
        <button onClick={() => { setShowing("arguments") }}>show arguments</button>
        <br />
        {showing === "comments" &&
          <>
            <button onClick={() => { setTime("asc") }}>time asc</button>
            <button onClick={() => { setTime("desc") }}>time desc</button>
            &nbsp;
            <span>{time}</span>
          </>
        }
        {showing === "arguments" &&
          <>
            <button onClick={() => { setTime("asc") }}>time asc</button>
            <button onClick={() => { setTime("desc") }}>time desc</button>
            &nbsp;
            <span>{time}</span>
            <br />
            <button onClick={() => { setType("any") }}>show all</button>
            <button onClick={() => { setType("positive") }}>show positive</button>
            <button onClick={() => { setType("negative") }}>show negative</button>
            &nbsp;
            <span>{type}</span>
            <br />
            <button onClick={() => { setVotes("any") }}>any votes</button>
            <button onClick={() => { setVotes("most") }}>most votes</button>
            <button onClick={() => { setVotes("least") }}>least votes</button>
            &nbsp;
            <span>{votes}</span>
          </>
        }
      </div>

      <hr />

      <div>showing {showing}</div>

      <hr />

      {showing === "arguments" &&
        <>
          <input
            type="text"
            placeholder="write argument..."
            defaultValue={argument.text}
            onChange={(ev) => { setArgument({ ...argument, text: ev.target.value }) }}
          />
          <button onClick={() => { setArgument({ ...argument, type: "+" }) }}>+</button>
          <button onClick={() => { setArgument({ ...argument, type: "-" }) }}>-</button>
          &nbsp;
          <span>type: {argument.type}</span>
          <br />
          <button>send</button>
        </>
      }
      {showing === "comments" &&
        <>
          <input
            type="text"
            placeholder="write comment..."
            defaultValue={comment.text}
            onChange={(ev) => { setComment({ ...comment, text: ev.target.value }) }}
          />
          <br />
          <button>send</button>
        </>
      }

      {showing === "arguments" && [...Array(5)].map((_v, i) => <div key={i}><hr /><Argument /></div>)}
      {showing === "comments" && [...Array(5)].map((_v, i) => <div key={i}><hr /><Comment /></div>)}
    </>
  )
}

export default Discussion