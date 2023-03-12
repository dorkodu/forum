import { css } from "@emotion/react";
import { Button, Card, createStyles, Flex, SegmentedControl, Tooltip, useMantineTheme } from "@mantine/core"
import { useClickOutside } from "@mantine/hooks";
import React, { useState } from "react";

const useStyles = createStyles((_theme) => ({
  root: { flexWrap: "wrap", },
  control: { minWidth: 0, },
}));

interface IButton {
  onClick: () => any;
  text: React.ReactNode;
  disabled?: boolean;
}

interface ISegment {
  value: string;
  setValue: (value: string) => any;
  data: { label: string, value: string }[];
  label: string;
}

interface Props {
  segments?: ISegment[];
  buttons?: IButton[];
}

function _CardPanel({ segments, buttons }: Props) {
  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        <Segments segments={segments} />
        <Buttons buttons={buttons} />
      </Flex>
    </Card>
  )
}

function Segments({ segments }: { segments?: ISegment[] }) {
  return (
    <>
      {segments?.map((segment, index) => <SingleSegment segment={segment} key={index} />)}
    </>
  )
}

function SingleSegment({ segment }: { segment: ISegment }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));

  const findLabel = (segment: ISegment) => {
    for (let i = 0; i < segment.data.length; ++i) {
      const data = segment.data[i];
      if (data && segment.value === data.value) return data.label;
    }

    return "";
  }

  return (
    <Tooltip
      label={`${segment.label}: ${findLabel(segment)}`}
      position="top"
      withinPortal
      opened={opened}
      zIndex={99}
      styles={{ tooltip: { border: `1px solid ${theme.colors.dark[4]}` } }}
    >
      <Flex direction="row" align="center" gap="md">
        <SegmentedControl
          radius="md"
          value={segment.value}
          onChange={segment.setValue}
          data={segment.data}
          classNames={{ root: classes.root, control: classes.control }}
          onClick={() => setOpened(true)}
          ref={ref}
          css={css`flex-grow: 1;`}
        />
      </Flex>
    </Tooltip>
  )
}

function Buttons({ buttons }: { buttons?: IButton[] }) {
  return (
    <>
      {buttons && buttons.length > 0 &&
        <Button.Group>
          {buttons.map((button, index) =>
            <Button
              radius="md"
              variant="default"
              fullWidth
              onClick={button.onClick}
              disabled={button.disabled}
              key={index}
            >
              {button.text}
            </Button>
          )}
        </Button.Group>
      }
    </>
  )
}

export default _CardPanel
export const CardPanel = { Buttons, Segments }