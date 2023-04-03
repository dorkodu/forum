import { Tooltip } from "@mantine/core";
import React from "react"

interface Props {
  label: React.ReactNode;
  children: React.ReactNode;
}

function CustomTooltip({ label, children }: Props) {
  return (
    <Tooltip label={label} events={{ hover: true, focus: false, touch: true }}>
      {children}
    </Tooltip>
  )
}

export default CustomTooltip