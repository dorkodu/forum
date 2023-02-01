import { SegmentedControl, Center, useMantineColorScheme, } from "@mantine/core";

import { IconSun, IconMoon } from "@tabler/icons";

export function ColorToggleSegmented() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      radius="md"
      value={colorScheme}
      onChange={(value: "light" | "dark") => {
        toggleColorScheme(value);
      }}
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