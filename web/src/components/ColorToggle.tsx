import { SegmentedControl, Center, useMantineColorScheme, } from "@mantine/core";

import { IconSun, IconMoon } from "@tabler/icons";

export function ColorToggleSegmented() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const toggle = (value: string) => {
    if (value !== "light" && value !== "dark") return;
    toggleColorScheme(value);
  }

  return (
    <SegmentedControl
      radius="md"
      value={colorScheme}
      onChange={toggle}
      data={[
        {
          value: "light",
          label: (
            <Center>
              <IconSun size={18} stroke={3} />
            </Center>
          ),
        },
        {
          value: "dark",
          label: (
            <Center>
              <IconMoon size={18} stroke={3} />
            </Center>
          ),
        },
      ]}
    />
  );
}