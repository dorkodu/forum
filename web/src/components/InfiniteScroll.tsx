import CardLoader from "./cards/CardLoader";
import InfiniteScrollComponent from "react-infinite-scroll-component";

interface Props {
  children: React.ReactNode;

  refresh?: () => any;
  next?: () => any;

  length: number;
  hasMore: boolean;

  hideLoader?: boolean;
}

function InfiniteScroll({ children, refresh, next, length, hasMore, hideLoader }: Props) {
  return (
    <InfiniteScrollComponent
      next={next ?? (() => { })}
      refreshFunction={refresh}

      dataLength={length}
      hasMore={hasMore}

      loader={hideLoader ? null : <CardLoader />}

    >
      {children}
    </InfiniteScrollComponent >
  )
}

export default InfiniteScroll