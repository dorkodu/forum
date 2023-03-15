import { css } from "@emotion/react";
import { Flex, Popover, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { TFunction } from "i18next";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
  requirements: { req: RegExp, label: string, hidden?: boolean }[];
  value: string;
}

function InputRequirements({ children, requirements, value }: Props) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const checks = requirements.map((requirement, index) => (
    !requirement.req.test(value) && (
      (requirement.hidden && value.length !== 0) || !requirement.hidden
    ) ?
      <Requirement key={index} label={requirement.label} /> :
      null
  )).filter(Boolean);

  return (
    <Popover opened={popoverOpened} position="bottom" width="target" transition="pop">
      <Popover.Target>
        <div
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
        >
          {children}
        </div>
      </Popover.Target>
      {checks.length !== 0 && <Popover.Dropdown>{checks}</Popover.Dropdown>}
    </Popover>
  )
}

export default InputRequirements

function Requirement({ label }: { label: string }) {
  return (
    <Text color="red" size="sm">
      <Flex direction="row" align="center" gap="xs">
        <IconX size={14} css={css`flex-shrink:0;`} />
        {label}
      </Flex>
    </Text>
  )
}

type Requirement = "title" | "readme" | "argument" | "comment";

export function getRequirement(t: TFunction<"common", undefined>, requirement: Requirement) {
  switch (requirement) {
    case "title":
      return [
        { req: /^.{1,100}$/, label: t("requirements.titleLength") },
      ]
    case "readme":
      return [
        { req: /^[\s\S]{1,100000}$/, label: t("requirements.readmeLength") },
      ]
    case "argument":
      return [
        { req: /^[\s\S]{1,500}$/, label: t("requirements.argumentLength") },
      ]
    case "comment":
      return [
        { req: /^[\s\S]{1,500}$/, label: t("requirements.commentLength") },
      ]
  }
}

export function getRequirementError(
  t: TFunction<"common", undefined>,
  requirement: Requirement,
  value: string,
  boolean?: boolean,
) {
  const requirements = getRequirement(t, requirement);

  for (let i = 0; i < requirements.length; ++i) {
    const r = requirements[i];
    if (!r) continue;
    if (!r.req.test(value)) return boolean ? true : r.label;
  }

  return null;
}