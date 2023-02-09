import { Anchor } from "@mantine/core";
import { Fragment, MouseEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import urlRegex from "url-regex";

const usernameRegex = new RegExp(/^(?:@)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9_.]{1,16}(?<![_.])$/);

interface Props {
  text: string;
}

function TextParser({ text }: Props) {
  const navigate = useNavigate();
  const parsed = useMemo(() => text.split(" "), [text]);

  const onClick = (ev: MouseEvent, username: string) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigate(`/profile/${username}`);
  }

  return (
    <>
      {parsed.map((p, i) => {
        if (p.match(urlRegex())) {
          return (
            <Fragment key={i}>
              <Anchor href={p}>{p}</Anchor>
              {" "}
            </Fragment>
          )
        }
        else if (p.match(usernameRegex)) {
          return (
            <Fragment key={i}>
              <Anchor
                href={`https://forum.dorkodu.com/profile/${p.substring(1)}`}
                onClick={(ev) => onClick(ev, p.substring(1))}
              >
                {p}
              </Anchor>
              {" "}
            </Fragment>
          )
        }
        else {
          return <Fragment key={i}>{p + " "}</Fragment>
        }
      })}
    </>
  )
}

export default TextParser