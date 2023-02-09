import { theme } from "@dorkodu/prism";
import { Button, Card, Flex, NativeSelect, SegmentedControl } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks";
import React from "react";

interface IButton {
  onClick: () => any;
  text: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface ISegment {
  value: string;
  setValue: (value: string) => any;
  data: { label: string, value: string }[];
}

interface Props {
  segments?: ISegment[];
  buttons?: IButton[];
}

function _CardPanelComponent({ segments, buttons }: Props) {
  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        <Segments segments={segments} />
        <Buttons buttons={buttons} />
      </Flex>
    </Card>
  )
}

function Segments({ segments }: { segments?: ISegment[] }) {
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints?.xs}px)`);

  return (
    <>
      {smallScreen && segments?.map(segment =>
        <NativeSelect
          radius="md"
          variant="default"
          value={segment.value}
          onChange={(ev) => segment.setValue(ev.currentTarget.value)}
          data={segment.data}
        />
      )}

      {!smallScreen && segments?.map(segment =>
        <SegmentedControl
          radius="md"
          fullWidth
          value={segment.value}
          onChange={segment.setValue}
          data={segment.data}
        />
      )}
    </>
  )
}

function Buttons({ buttons }: { buttons?: IButton[] }) {
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints?.xs}px)`);

  return (
    <>
      {buttons && buttons.length > 0 &&
        <Button.Group>
          {buttons.map(button =>
            <Button
              radius="md"
              variant="default"
              fullWidth
              onClick={button.onClick}
              disabled={button.disabled}
            >
              {smallScreen ? button.icon : button.text}
            </Button>
          )}
        </Button.Group>
      }
    </>
  )
}

export default _CardPanelComponent
export const CardPanel = { Buttons, Segments }