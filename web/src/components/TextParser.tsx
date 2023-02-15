import { Anchor } from "@mantine/core";
import { MouseEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { emoji as emojiCSS } from "../styles/css";
import twemoji from "twemoji";

import urlRegexp from "url-regex";
import emojiRegexp from "emoji-regex";

const usernameRegex = new RegExp("(?:@)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9_.]{1,16}(?<![_.])", "g");
const discussionRegex = new RegExp("#[0-9]+", "g");
const urlRegex = urlRegexp();
const emojiRegex = emojiRegexp();

enum PieceType {
  Username,
  Discussion,
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

    let discussionIndex = -1;
    const _discussions = text.match(discussionRegex);
    _discussions?.forEach(discussion => {
      const index = text.indexOf(discussion, discussionIndex);
      if (index !== -1) {
        pieces.push({ index, text: discussion, type: PieceType.Discussion });
        discussionIndex = index + discussion.length;
      }
    })

    let usernameIndex = -1;
    const _usernames = text.match(usernameRegex);
    _usernames?.forEach(username => {
      const index = text.indexOf(username, usernameIndex);
      if (index !== -1) {
        pieces.push({ index, text: username, type: PieceType.Username });
        usernameIndex = index + username.length;
      }
    })

    let urlIndex = -1;
    const _urls = text.match(urlRegex);
    _urls?.forEach(url => {
      const index = text.indexOf(url, urlIndex);
      if (index !== -1) {
        pieces.push({ index, text: url, type: PieceType.Url });
        urlIndex = index + url.length;
      }
    })

    let emojiIndex = -1;
    const _emojis = text.match(emojiRegex);
    _emojis?.forEach(emoji => {
      const index = text.indexOf(emoji, emojiIndex);
      if (index !== -1) {
        pieces.push({ index, text: emoji, type: PieceType.Emoji });
        emojiIndex = index + emoji.length;
      }
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
            break;
          case PieceType.Discussion:
            elements.push(<DiscussionPiece key={key++} discussion={piece.text} />)
            break;
          case PieceType.Url:
            elements.push(<UrlPiece key={key++} url={piece.text} />)
            break;
          case PieceType.Emoji:
            elements.push(<EmojiPiece key={key++} emoji={piece.text} />)
            break;
        }

        i += piece.text.length;
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

function DiscussionPiece({ discussion }: { discussion: string }) {
  const navigate = useNavigate();

  const onClick = (ev: MouseEvent, discussion: string) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigate(`/discussion/${discussion}`);
  }

  return (
    <Anchor
      href={`https://forum.dorkodu.com/discussion/${discussion.substring(1)}`}
      onClick={(ev) => onClick(ev, discussion.substring(1))}
    >
      {discussion}
    </Anchor>
  )
}

function UrlPiece({ url }: { url: string }) {
  return <Anchor href={url}>{url}</Anchor>
}

function EmojiPiece({ emoji }: { emoji: string }) {
  const element = document.createElement("div");
  element.innerHTML = twemoji.parse(emoji, { ext: ".svg", folder: "svg" });
  const src = (element.firstChild as HTMLImageElement).src;

  return (
    <img
      src={src}
      css={emojiCSS}
      alt={emoji}
      draggable={false}
    />
  )
}

export const Piece = {
  Text: TextPiece,
  Username: UsernamePiece,
  Discussion: DiscussionPiece,
  Url: UrlPiece,
  Emoji: EmojiPiece,
}