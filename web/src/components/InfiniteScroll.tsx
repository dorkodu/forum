import { useEffect, useRef } from "react";
import CardLoader from "./cards/CardLoader";

interface Props {
  children: React.ReactNode;

  onTop?: () => Promise<any>;
  onBottom?: () => Promise<any>;

  loader: "top" | "bottom" | undefined;
}

function InfiniteScroll({ children, onTop, onBottom, loader }: Props) {
  const previousHeightEqual = () => previousHeight.current === document.body.offsetHeight;
  const scrolledTop = () => window.scrollY <= 0;
  const scrolledBottom = () => window.innerHeight + window.scrollY + 1 >= document.body.offsetHeight;

  const previousHeight = useRef(document.body.offsetHeight);
  const overScrolled = useRef(false);
  const loading = useRef(false);

  const onScroll = async (): Promise<void> => {
    if (!previousHeightEqual()) return void (previousHeight.current = document.body.offsetHeight);
    overScrolled.current = scrolledTop() || scrolledBottom();

    if (!overScrolled.current) return;
    if (loading.current) return;

    loading.current = true;
    if (scrolledTop()) onTop && await onTop();
    else if (scrolledBottom()) onBottom && await onBottom();
    setTimeout(() => {
      loading.current = false;

      // Scroll 1px up to make it easier to scroll bottom
      if (scrolledBottom()) {
        window.scrollTo(0, window.scrollY - 1);
        overScrolled.current = false;
      }
    }, 500);
  }

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onTop, onBottom])

  return (
    <>
      {loader === "top" && <CardLoader />}
      {children}
      {loader === "bottom" && <CardLoader />}
    </>
  )
}

export default InfiniteScroll