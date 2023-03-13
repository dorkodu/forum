import { css } from "@emotion/react";
import { Flex, Popover, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
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
    (requirement.hidden && !requirement.req.test(value)) || !requirement.hidden ?
      <Requirement key={index} label={requirement.label} meets={requirement.req.test(value)} /> :
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
      {checks.length !== 0 &&
        <Popover.Dropdown>
          {checks}
        </Popover.Dropdown>
      }
    </Popover>
  )
}

export default InputRequirements

function Requirement({ meets, label }: { meets: boolean, label: string }) {
  return (
    <Text color={meets ? "teal" : "red"} size="sm">
      <Flex direction="row" align="center" gap="xs">
        {meets ?
          <IconCheck size={14} css={css`flex-shrink:0;`} /> :
          <IconX size={14} css={css`flex-shrink:0;`} />
        }
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
        { req: /^.{1,100}$/, label: t("requirements.titleLength"), hidden: true },
      ]
    case "readme":
      return [
        { req: /^.{1,100000}$/, label: t("requirements.readmeLength"), hidden: true },
      ]
    case "argument":
      return [
        { req: /^.{1,500}$/, label: t("requirements.argumentLength"), hidden: true },
      ]
    case "comment":
      return [
        { req: /^.{1,500}$/, label: t("requirements.commentLength"), hidden: true },
      ]
  }
}

export function getRequirementError(
  t: TFunction<"common", undefined>,
  requirement: Requirement,
  value: string
) {
  const requirements = getRequirement(t, requirement);

  for (let i = 0; i < requirements.length; ++i) {
    const r = requirements[i];
    if (!r) continue;
    if (!r.req.test(value)) return r.label;
  }

  return null;
}