import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

// Storybook's own UI follows the OS light/dark setting, styled to match Lumina.
const dark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;

addons.setConfig({
  theme: create({
    base: dark ? "dark" : "light",
    brandTitle: "✦ Lumina",
    colorPrimary: dark ? "#f472b6" : "#be185d",
    colorSecondary: dark ? "#f472b6" : "#be185d",
    appBg: dark ? "#15181e" : "#f6f7f9",
    appContentBg: dark ? "#0d0f13" : "#ffffff",
    appBorderColor: dark ? "#272c36" : "#dde1e8",
    fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontCode: '"JetBrains Mono", ui-monospace, monospace',
  }),
});
