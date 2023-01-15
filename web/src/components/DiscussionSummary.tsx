import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DiscussionSummary() {
  const navigate = useNavigate();
  const [favourite, setFavourite] = useState(false);

  return (
    <>
      <div onClick={() => { navigate("/discussion/123") }}>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
        &nbsp;
        <span>16h</span>
        <div>is milk white or black?</div>
        <div>
          <button onClick={(ev) => { ev.stopPropagation(); setFavourite(!favourite); }}>
            {favourite ? "unfavourite" : "favourite"}
          </button>
          &nbsp;
          <span>favourites: 123</span>
          &nbsp;
          <span>arguments: 123</span>
          &nbsp;
          <span>comments: 123</span>
          &nbsp;
          <span>last update: now</span>
        </div>
      </div>
    </>
  )
}

export default DiscussionSummary