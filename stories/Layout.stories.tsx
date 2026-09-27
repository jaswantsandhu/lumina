import type { Meta, StoryObj } from "@storybook/react";
import { Code, Divider, Heading, Kbd, PageHeader, Stack, Text, Button } from "../src/index";

export default { title: "Layout/Typography and layout", tags: ["autodocs"] } satisfies Meta;

export const Typography: StoryObj = {
  render: () => (
    <Stack gap="3">
      <Heading level={1}>Heading 1</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Heading level={4}>Heading 4</Heading>
      <Text>Body text for descriptions and content.</Text>
      <Text tone="muted" size="sm">
        Muted, small text for secondary details.
      </Text>
      <Text>
        Inline <Code>definitions/teams</Code> and a shortcut <Kbd>⌘K</Kbd>.
      </Text>
      <Stack direction="row" gap="3">
        <Text tone="success">Success</Text>
        <Text tone="warning">Warning</Text>
        <Text tone="danger">Danger</Text>
        <Text tone="accent">Accent</Text>
      </Stack>
    </Stack>
  ),
};

export const StackLayout: StoryObj = {
  name: "Stack",
  render: () => (
    <Stack gap="4">
      <Stack direction="row" gap="2">
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ padding: 12, background: "var(--lm-color-accent-soft)", borderRadius: 6 }}>
            Item {i}
          </div>
        ))}
      </Stack>
      <Divider />
      <Stack gap="1">
        <Text weight="semibold">Column, gap 1</Text>
        <Text tone="muted">Children stack vertically.</Text>
      </Stack>
    </Stack>
  ),
};

export const Header: StoryObj = {
  name: "PageHeader",
  render: () => <PageHeader title="Tasks" description="Work assigned to the demo team." actions={<Button variant="primary">Assign task</Button>} />,
};
