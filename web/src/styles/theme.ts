import { theme as PrismTheme } from "@dorkodu/prism";
import { MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  ...PrismTheme,
  components: {
    TextInput: {},
  },
};

export default theme;
