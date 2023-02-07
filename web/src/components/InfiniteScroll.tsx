import { useEffect, useRef } from "react";
import CardLoader from "./CardLoader";

interface Props {
  children: React.ReactNode;

  onTop?: () => Promise<any>;
  onBottom?: () => Promise<any>;

  loaders: {
    top: boolean;
    bottom: boolean;
    mid: boolean;
  }
}

function InfiniteScroll({ children, onTop, onBottom, loaders }: Props) {
  const previousHeightEqual = () => previousHeight.current === document.body.offsetHeight;
  const scrolledTop = () => window.scrollY <= 0;
  const scrolledBottom = () => window.innerHeight + window.scrollY + 1 >= document.body.offsetHeight;

  const previousHeight = useRef(document.body.offsetHeight);
  const overScrolled = useRef(false);

  const onScroll = (): void => {
    if (!previousHeightEqual()) return void (previousHeight.current = document.body.offsetHeight);

    if (scrolledTop() && !overScrolled.current) {
      onTop && onTop();
    }
    else if (scrolledBottom() && !overScrolled.current) {
      onBottom && onBottom();
    }

    overScrolled.current = scrolledTop() || scrolledBottom();
  }

  useEffect(() => {
    if (!loaders.bottom) {
      if (scrolledBottom()) window.scrollTo(0, window.scrollY - 1);
      overScrolled.current = false;
      return;
    }
  }, [loaders.bottom])

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [])

  return (
    <>
      {loaders.top && <CardLoader />}
      {loaders.mid ? <CardLoader /> : <>{children}</>}
      {loaders.bottom && <CardLoader />}
    </>
  )
}

export default InfiniteScroll