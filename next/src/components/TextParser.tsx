import { Anchor } from "@mantine/core";
import { useMemo } from "react";
import { emoji as emojiCSS } from "../styles/css";
import twemoji from "twemoji";

import urlRegexp from "url-regex";
import emojiRegexp from "emoji-regex";
import CustomLink from "./custom/CustomLink";

const usernameRegex = new RegExp("(?:@)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9_.]{1,16}(?<![_.])", "g");
const discussionRegex = new RegExp("#[0-9]+", "g");
const urlRegex = urlRegexp();
const emojiRegex = emojiRegexp();

export enum PieceType {
  Username,
  Discussion,
  Url,
  Emoji,
}

interface Props {
  text: string;
  types?: PieceType[];
}

function TextParser({ text, types }: Props) {
  const parsed = useMemo(() => {
    const elements: React.ReactNode[] = [];
    let pieces: { index: number, text: string, type: PieceType }[] = [];

    if (!types || types.indexOf(PieceType.Username) !== -1) {
      pieces.push(...index(text, usernameRegex, PieceType.Username))
    }
    if (!types || types.indexOf(PieceType.Discussion) !== -1) {
      pieces.push(...index(text, discussionRegex, PieceType.Discussion))
    }
    if (!types || types.indexOf(PieceType.Url) !== -1) {
      pieces.push(...index(text, urlRegex, PieceType.Url))
    }
    if (!types || types.indexOf(PieceType.Emoji) !== -1) {
      pieces.push(...index(text, emojiRegex, PieceType.Emoji))
    }

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

function index(text: string, regex: RegExp, type: PieceType) {
  let pieces: { index: number, text: string, type: PieceType }[] = [];
  let i = -1;

  const _pieces = text.match(regex);
  _pieces?.forEach(piece => {
    const index = text.indexOf(piece, i);
    if (index !== -1) {
      pieces.push({ index, text: piece, type });
      i = index + piece.length;
    }
  })

  return pieces;
}

function TextPiece({ text }: { text: string }) {
  return <>{text}</>
}

function UsernamePiece({ username }: { username: string }) {
  return (
    <CustomLink href={`/profile/${username}`}>
      <Anchor component="div">{username}</Anchor>
    </CustomLink>
  )
}

function DiscussionPiece({ discussion }: { discussion: string }) {
  return (
    <CustomLink href={`/discussion/${discussion}`}>
      <Anchor component="div">{discussion}</Anchor>
    </CustomLink>
  )
}

function UrlPiece({ url }: { url: string }) {
  return <Anchor href={url}>{url}</Anchor>
}

function EmojiPiece({ emoji }: { emoji: string }) {
  const element = document.createElement("div");
  element.innerHTML = twemoji.parse(
    emoji,
    { ext: ".svg", folder: "svg", base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/" }
  );
  const src = (element.firstChild as HTMLImageElement).src;

  return (
    <img
      src={src}
      style={emojiCSS}
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