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
        <Badge tone="accent">delegated</Badge>
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
          <TH>Agent</TH>
          <TH>Status</TH>
          <TH>Task</TH>
          <TH style={{ textAlign: "right" }}>Tokens</TH>
        </TR>
      </THead>
      <TBody>
        {[
          ["coder", "running", "Implement login", "1,284"],
          ["researcher", "succeeded", "Compare OAuth libraries", "842"],
          ["reviewer", "failed", "Review the diff", "311"],
        ].map(([agent, status, task, tokens], i) => (
          <TR key={agent} selected={i === 1}>
            <TD>
              <Stack direction="row" gap="2" align="center">
                <Avatar name={agent} size="sm" /> {agent}
              </Stack>
            </TD>
            <TD>
              <Badge tone={status === "running" ? "info" : status === "succeeded" ? "success" : "danger"} dot={status === "running"}>
                {status}
              </Badge>
            </TD>
            <TD>{task}</TD>
            <TD numeric>{tokens}</TD>
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
        <ListItem title="Deploy checklist" meta="2m ago" selected leading={<Avatar name="lead" size="sm" />} />
        <ListItem title="Compare databases" meta="1h ago" leading={<Avatar name="researcher" size="sm" />} />
        <ListItem title="Weekly summary" meta="yesterday" trailing={<Badge>3</Badge>} leading={<Avatar name="coder" size="sm" />} />
      </List>
    </Card>
  ),
};

export const Avatars: StoryObj = {
  render: () => (
    <Stack direction="row" gap="3" align="center">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Grace Hopper" />
      <Avatar name="coder" size="lg" />
      <Avatar name="researcher" size="lg" />
    </Stack>
  ),
};

export const Code: StoryObj = {
  render: () => <CodeBlock language="json" code={JSON.stringify({ bash: { "*": "allow", "rm *": "ask" }, webfetch: "deny" }, null, 2)} />,
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
        <EmptyState icon={<span aria-hidden>✦</span>} title="No tasks yet" description="Assign work to the team lead and it will delegate to sub-agents." action={<Button variant="primary">Assign task</Button>} />
      </Card>
    </Stack>
  ),
};
