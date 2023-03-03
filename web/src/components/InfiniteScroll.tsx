import CardLoader from "./cards/CardLoader";
import InfiniteScrollComponent from "react-infinite-scroll-component";
import { Flex, Text } from "@mantine/core";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;

  refresh?: () => any;
  next?: () => any;

  length: number;
  hasMore: boolean;

  hideLoader?: boolean;
}

function InfiniteScroll({ children, refresh, next, length, hasMore, hideLoader }: Props) {
  const { t } = useTranslation();

  const pulldownToRefresh = () => (
    <Flex direction="row" justify="center" my="md">
      <Text align="center" css={css`user-select: none;`}>
        &#8595; {t("pulldownToRefresh")}
      </Text>
    </Flex>
  )

  const releaseToRefresh = () => (
    <Flex direction="row" justify="center" my="md">
      <Text align="center" css={css`user-select: none;`}>
        &#8593; {t("releaseToRefresh")}
      </Text>
    </Flex>
  )

  const [scroll, setScroll] = useState(scrollY);
  const onScroll = () => { setScroll(scrollY) }

  useEffect(() => {
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <InfiniteScrollComponent
      next={next ?? (() => { })}
      refreshFunction={refresh}

      dataLength={length + (scroll <= 0 ? 1 : 0)}
      hasMore={scroll <= 0 || hasMore}

      loader={hideLoader ? null : <CardLoader />}

      pullDownToRefresh
      pullDownToRefreshThreshold={54}
      pullDownToRefreshContent={pulldownToRefresh()}
      releaseToRefreshContent={releaseToRefresh()}
    >
      {children}
    </InfiniteScrollComponent>
  )
}

export default InfiniteScroll