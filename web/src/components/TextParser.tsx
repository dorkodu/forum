import { Anchor } from "@mantine/core";
import { MouseEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import urlRegexp from "url-regex";

const usernameRegex = new RegExp("(?:@)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9_.]{1,16}(?<![_.])", "g");
const urlRegex = urlRegexp();

enum PieceType {
  Username,
  Url,
  Emoji,
}

interface Props {
  text: string;
}

function TextParser({ text }: Props) {
  const parsed = useMemo(() => {
    const elements: React.ReactNode[] = [];

    let pieces: { index: number, text: string, type: PieceType }[] = [];

    const _usernames = text.match(usernameRegex);
    _usernames?.forEach(username => {
      const index = text.indexOf(username);
      if (index !== -1)
        pieces.push({ index, text: username, type: PieceType.Username });
    })

    const _urls = text.match(urlRegex);
    _urls?.forEach(url => {
      const index = text.indexOf(url);
      if (index !== -1)
        pieces.push({ index, text: url, type: PieceType.Url });
    })

    pieces = pieces.sort((a, b) => a.index - b.index);
    let key = 0;

    for (let i = 0; i < text.length;) {
      const piece = pieces.shift();

      if (piece) {
        const diff = piece.index - i;
        if (diff > 0) {
          elements.push(<TextPiece key={key++} text={text.substring(i, i + diff)} />)
          i += diff;
        }

        switch (piece.type) {
          case PieceType.Username:
            elements.push(<UsernamePiece key={key++} username={piece.text} />)
            i += piece.text.length;
            break;
          case PieceType.Url:
            elements.push(<UrlPiece key={key++} url={piece.text} />)
            i += piece.text.length;
            break;
          case PieceType.Emoji:
            // TODO: Implement emoji parsing
            break;
        }
      }
      else {
        elements.push(<TextPiece key={key++} text={text.substring(i)} />)
        i = text.length;
      }
    }

    return elements;
  }, [text]);

  return <>{parsed}</>;
}

export default TextParser

function TextPiece({ text }: { text: string }) {
  return <>{text}</>
}

function UsernamePiece({ username }: { username: string }) {
  const navigate = useNavigate();

  const onClick = (ev: MouseEvent, username: string) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigate(`/profile/${username}`);
  }

  return (
    <Anchor
      href={`https://forum.dorkodu.com/profile/${username.substring(1)}`}
      onClick={(ev) => onClick(ev, username.substring(1))}
    >
      {username}
    </Anchor>
  )
}

function UrlPiece({ url }: { url: string }) {
  return <Anchor href={url}>{url}</Anchor>
}