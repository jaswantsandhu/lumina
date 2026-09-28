import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CodeBlock,
  EmptyState,
  List,
  ListItem,
  Skeleton,
  Stack,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Text,
} from "../src/index";

export default { title: "Data display/Components", tags: ["autodocs"] } satisfies Meta;

export const Badges: StoryObj = {
  render: () => (
    <Stack gap="3">
      <Stack direction="row" wrap gap="2">
        <Badge>queued</Badge>
        <Badge tone="info" dot>running</Badge>
        <Badge tone="success">succeeded</Badge>
        <Badge tone="warning">waiting input</Badge>
        <Badge tone="danger">failed</Badge>
        <Badge tone="accent">featured</Badge>
      </Stack>
      <Stack direction="row" wrap gap="2">
        <Badge tone="accent" variant="outline">outline</Badge>
        <Badge tone="danger" variant="solid">3</Badge>
        <Badge tone="success" variant="solid">live</Badge>
      </Stack>
    </Stack>
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <Stack direction="row" wrap gap="4">
      <Card style={{ width: 340 }}>
        <CardHeader title="Weekly report" description="Mondays 09:00 · Europe/London" actions={<Badge tone="success">enabled</Badge>} />
        <Text tone="muted">Summarise the week's completed tasks and open questions.</Text>
        <CardFooter>
          <Button size="sm" variant="ghost">Disable</Button>
          <Button size="sm">Run now</Button>
        </CardFooter>
      </Card>
      <Card interactive style={{ width: 340 }} tabIndex={0}>
        <CardHeader title="Interactive card" description="Hover me." />
        <CardBody>
          <Text tone="muted">Use for clickable summaries.</Text>
        </CardBody>
      </Card>
    </Stack>
  ),
};

export const DataTable: StoryObj = {
  name: "Table",
  render: () => (
    <Table>
      <THead>
        <TR>
          <TH>Owner</TH>
          <TH>Status</TH>
          <TH>Task</TH>
          <TH style={{ textAlign: "right" }}>Points</TH>
        </TR>
      </THead>
      <TBody>
        {[
          ["Ada", "running", "Redesign checkout", "8"],
          ["Grace", "succeeded", "Compare payment providers", "5"],
          ["Linus", "failed", "Review pricing copy", "2"],
        ].map(([owner, status, task, points], i) => (
          <TR key={owner} selected={i === 1}>
            <TD>
              <Stack direction="row" gap="2" align="center">
                <Avatar name={owner} size="sm" /> {owner}
              </Stack>
            </TD>
            <TD>
              <Badge tone={status === "running" ? "info" : status === "succeeded" ? "success" : "danger"} dot={status === "running"}>
                {status}
              </Badge>
            </TD>
            <TD>{task}</TD>
            <TD numeric>{points}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  ),
};

export const Lists: StoryObj = {
  render: () => (
    <Card style={{ width: 320 }} padding="sm">
      <List>
        <ListItem title="Launch checklist" meta="2m ago" selected leading={<Avatar name="Sam" size="sm" />} />
        <ListItem title="Compare databases" meta="1h ago" leading={<Avatar name="Grace" size="sm" />} />
        <ListItem title="Weekly summary" meta="yesterday" trailing={<Badge>3</Badge>} leading={<Avatar name="Ada" size="sm" />} />
      </List>
    </Card>
  ),
};

export const Avatars: StoryObj = {
  render: () => (
    <Stack direction="row" gap="3" align="center">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus Torvalds" size="lg" />
      <Avatar name="Sam" size="lg" />
    </Stack>
  ),
};

export const Code: StoryObj = {
  render: () => <CodeBlock language="json" code={JSON.stringify({ theme: "system", digest: "weekly" }, null, 2)} />,
};

export const LoadingAndEmpty: StoryObj = {
  name: "Loading and empty states",
  render: () => (
    <Stack gap="5" style={{ maxWidth: 560 }}>
      <Stack direction="row" gap="3" align="center">
        <Skeleton circle width={32} height={32} />
        <Skeleton width={220} />
      </Stack>
      <Skeleton lines={3} />
      <Card>
        <EmptyState icon={<span aria-hidden>✦</span>} title="No projects yet" description="Create a project to start planning with your team." action={<Button variant="primary">New project</Button>} />
      </Card>
    </Stack>
  ),
};
