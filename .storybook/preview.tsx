import type { Decorator, Preview } from "@storybook/react";
import { useEffect } from "react";
import "../src/tokens/tokens.css";
import "../src/styles/base.css";
import { ToastProvider } from "../src/index";

// Component styles, in the same order as the published styles.css.
import.meta.glob("../src/components/*.css", { eager: true });

// Applies the toolbar theme to the document and wraps stories in the Lumina root.
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as string;
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    document.body.classList.add("lm-root");
  }, [theme]);
  return (
    <ToastProvider>
      <div className="lm-root" style={{ padding: "1.5rem", minHeight: "100%" }}>
        <Story />
      </div>
    </ToastProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Lumina theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  // Follows the OS by default; use the Theme toolbar button to force light or dark.
  initialGlobals: { theme: "system" },
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    a11y: { test: "error" },
    options: { storySort: { order: ["Introduction", "Foundations", "Layout", "Actions", "Forms", "Files", "Data display", "Charts", "Feedback", "Navigation", "Patterns"] } },
  },
};

export default preview;
