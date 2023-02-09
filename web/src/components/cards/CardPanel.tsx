import { theme } from "@dorkodu/prism";
import { Button, Card, Flex, NativeSelect, SegmentedControl } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks";
import React from "react";

interface Props {
  segments?: {
    value: string
    setValue: (value: string) => any
    data: { label: string, value: string }[]
  }[]

  buttons?: {
    onClick: () => any
    text: string
    icon: React.ReactNode
  }[]
}

function CardPanel({ segments, buttons }: Props) {
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints?.xs}px)`);

  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">

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

        {buttons && buttons.length > 0 &&
          <Button.Group>
            {buttons.map(button =>
              <Button
                radius="md"
                variant="default"
                fullWidth
                onClick={button.onClick}
              >
                {smallScreen ? button.icon : button.text}
              </Button>
            )}
          </Button.Group>
        }

      </Flex>
    </Card>
  )
}

export default CardPanel