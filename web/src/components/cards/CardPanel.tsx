import { Button, Card, Flex, NativeSelect } from "@mantine/core"
import React from "react";

interface IButton {
  onClick: () => any;
  text: React.ReactNode;
  disabled?: boolean;
}

interface ISegment {
  value: string;
  setValue: (value: string) => any;
  data: { label: string, value: string }[];
  label?: string;
}

interface Props {
  segments?: ISegment[];
  buttons?: IButton[];
}

function _CardPanel({ segments, buttons }: Props) {
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
  return (
    <>
      {segments?.map((segment, index) =>
        <NativeSelect
          label={segment.label}
          radius="md"
          variant="default"
          value={segment.value}
          onChange={(ev) => segment.setValue(ev.currentTarget.value)}
          data={segment.data}
          key={index}
        />
      )}
    </>
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