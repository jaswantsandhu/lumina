import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { Alert, Badge, Button, Card, CardHeader, CodeView, Field, Input, Stack, Switch, Text } from "../src/index";

export default { title: "Foundations/Dark mode", parameters: { layout: "fullscreen" } } satisfies Meta;

// data-theme works on any element, so both themes can be shown side by side.
function Pane({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) {
  return (
    <div data-theme={theme} className="lm-root" style={{ flex: 1, minWidth: 320, padding: "var(--lm-space-6)", background: "var(--lm-color-bg)", color: "var(--lm-color-text)", borderRadius: "var(--lm-radius-lg)" }}>
      <Text size="xs" tone="muted" weight="semibold" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
        {theme}
      </Text>
      {children}
    </div>
  );
}

const Sample = () => (
  <Stack gap="4">
    <Card>
      <CardHeader title="Deploy checklist" description="Assigned 2m ago" actions={<Badge tone="info" dot>running</Badge>} />
      <Field label="Team name" hint="Lowercase letters and dashes.">
        <Input defaultValue="research" />
      </Field>
      <Switch checked onCheckedChange={() => {}} label="Notify me" />
      <Stack direction="row" gap="2">
        <Button variant="primary">Assign task</Button>
        <Button>Cancel</Button>
        <Button variant="danger">Delete</Button>
      </Stack>
    </Card>
    <Alert tone="warning" title="Budget 80% used">16,000 of 20,000 tokens.</Alert>
    <CodeView language="tsx" title="Example.tsx" code={'import { Button } from "@jaswantsandhu/lumina";\n\nexport const Save = () => <Button variant="primary">Save</Button>;'} />
  </Stack>
);

export const SideBySide: StoryObj = {
  name: "Light and dark side by side",
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: 16 }}>
      <Pane theme="light">
        <Sample />
      </Pane>
      <Pane theme="dark">
        <Sample />
      </Pane>
    </div>
  ),
};
