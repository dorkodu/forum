import InfiniteScrollComponent from "react-simple-pull-to-refresh";
import React, { ReactElement, useMemo, useRef } from "react";
import { IconArrowBigDownLineFilled } from "@tabler/icons-react";
import { Flex } from "@mantine/core";
import DefaultLoader from "./cards/DefaultLoader";
import { css } from "@emotion/react";

interface Props {
  children: React.ReactNode;

  refresh?: () => Promise<any>;
  next?: () => Promise<any>;

  hasMore: boolean;
}

function InfiniteScroll({ children, refresh, next, hasMore }: Props) {
  const working = useRef(false);
  const promise = useRef<Promise<any>>(Promise.resolve())

  const doRefresh = async () => {
    if (working.current || !refresh) return promise.current;
    working.current = true;
    await (promise.current = refresh());
    working.current = false;
  }

  const doNext = async () => {
    if (working.current || !next) return promise.current;
    working.current = true;
    await (promise.current = next());
    working.current = false;
  }

  const PullingContent = useMemo(() => {
    // TODO: h={72} -> 72 is a magic number (56 + 16 (margin md) = 72)
    return (
      <Flex direction="column" align="center" justify="center" h={72}>
        <IconArrowBigDownLineFilled />
      </Flex>
    )
  }, [])

  const RefreshingContent = useMemo(() => {
    // TODO: h={72} -> 72 is a magic number (56 + 16 (margin md) = 72)
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h={40}
        my="md"
      >
        <DefaultLoader />
      </Flex>
    )
  }, [])

  return (
    <Flex direction="column">
      <InfiniteScrollComponent
        onFetchMore={doNext}
        canFetchMore={hasMore}
        fetchMoreThreshold={100}

        onRefresh={doRefresh}
        isPullable
        // TODO: 56 is a magic number (24 + 16*2 (margin md) = 56)
        pullDownThreshold={56}
        maxPullDownDistance={56 * 2}
        resistance={1}

        pullingContent={PullingContent}
        refreshingContent={RefreshingContent}

        className={css`overflow: visible;`.name}
      >
        {children as ReactElement}
      </InfiniteScrollComponent>
    </Flex>
  )
}

export default InfiniteScroll