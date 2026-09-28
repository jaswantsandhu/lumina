import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Card, Code, Divider, Grid, Heading, Kbd, List, ListItem, PageHeader, SplitView, Stack, Text } from "../src/index";

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
  render: () => <PageHeader title="Projects" description="Everything your team is working on." actions={<Button variant="primary">Assign task</Button>} />,
};

export const ResponsiveGrid: StoryObj = {
  render: () => (
    <Grid min="10rem">
      {["Overview", "Chat", "Tasks", "Schedules", "Memory", "Approvals"].map((n) => (
        <Card key={n}>
          <Text weight="semibold">{n}</Text>
        </Card>
      ))}
    </Grid>
  ),
};

export const ListAndDetail: StoryObj = {
  parameters: { layout: "fullscreen" },
  render: function Render() {
    const items = ["Research options", "Fix flaky test", "Weekly report"];
    const [selected, setSelected] = useState<string | undefined>();
    return (
      <div style={{ height: 420, border: "1px solid var(--lm-color-border)" }}>
        <SplitView
          listLabel="Tasks"
          showDetail={selected !== undefined}
          onBack={() => setSelected(undefined)}
          backLabel="All tasks"
          list={
            <List aria-label="Tasks">
              {items.map((i) => (
                <ListItem key={i} title={i} selected={i === (selected ?? items[0])} onClick={() => setSelected(i)} />
              ))}
            </List>
          }
        >
          <PageHeader title={selected ?? items[0]} description="On phones only one pane shows, with a back link." />
        </SplitView>
      </div>
    );
  },
};

export const LongListWithAction: StoryObj = {
  name: "List and detail: long list with an action",
  render: () => (
    <div style={{ height: 420, border: "1px solid var(--lm-color-border)" }}>
      <SplitView
        listLabel="Conversations"
        list={
          <>
            <Button variant="primary" fullWidth>
              New conversation
            </Button>
            {Array.from({ length: 30 }, (_, i) => (
              <Card key={i}>
                <Text weight="medium">Conversation {i + 1}</Text>
                <Text size="sm" tone="muted">
                  Ada · {i + 1}m ago
                </Text>
              </Card>
            ))}
          </>
        }
      >
        <PageHeader title="Conversation 1" description="The list scrolls; its items keep their height." />
      </SplitView>
    </div>
  ),
};
