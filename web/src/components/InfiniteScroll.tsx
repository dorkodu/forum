import CardLoader from "./cards/CardLoader";
import InfiniteScrollComponent from "react-infinite-scroll-component";
import { Flex, Text } from "@mantine/core";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;

  refresh: () => any;
  next: () => any;

  length: number;
  hasMore: boolean;
}

function InfiniteScroll({ children, refresh, next, length, hasMore }: Props) {
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

  return (
    <InfiniteScrollComponent
      next={next}
      refreshFunction={refresh}

      dataLength={length}
      hasMore={hasMore}

      loader={<CardLoader />}

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