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

  const [scroll, setScroll] = useState({ y: scrollY, scrolled: false });
  const onScroll = () => { setScroll({ y: scrollY, scrolled: true }) };
  const onResize = () => { setScroll({ y: scrollY, scrolled: false }) };

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    }
  }, []);

  return (
    <InfiniteScrollComponent
      next={next ?? (() => { })}
      refreshFunction={refresh}

      dataLength={length + ((scroll.scrolled && scroll.y <= 0) ? 1 : 0)}
      hasMore={scroll.scrolled && (scroll.y <= 0 || hasMore)}

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