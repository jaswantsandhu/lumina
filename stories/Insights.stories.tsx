import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card, CardHeader, Disclosure, Grid, Progress, StatCard, Stack, Text, Timeline } from "../src/index";

export default { title: "Data display/Insights", tags: ["autodocs"] } satisfies Meta;

export const StatCards: StoryObj = {
  render: () => (
    <Grid min="12rem">
      <StatCard label="Orders this week" value="503" hint="1,204 this month" trend={{ value: "+12%", tone: "positive" }} />
      <StatCard label="Delivered on time" value="93%" hint="384 of 412 orders" />
      <StatCard label="Returns" value="28" trend={{ value: "+4", tone: "negative" }} />
      <StatCard label="Storage used" value="14 GB" hint="of 20 GB plan">
        <Progress value={14} max={20} aria-label="Storage used" size="sm" />
      </StatCard>
    </Grid>
  ),
};

export const ProgressMeters: StoryObj = {
  render: () => (
    <Stack gap="4" style={{ maxWidth: 480 }}>
      <Progress label="API calls this month" valueText="420k of 2M" value={420_000} max={2_000_000} />
      <Progress label="Storage" valueText="17 of 20 GB" value={17} max={20} />
      <Progress label="Seats" valueText="10 of 10" value={10} max={10} />
      <Progress label="Upload" valueText="64%" value={64} thresholds={null} />
    </Stack>
  ),
};

export const TimelineOfAgentActivity: StoryObj = {
  render: () => (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader title="Deploy pipeline" />
      <Timeline
        aria-label="Deploy pipeline"
        maxHeight="20rem"
        live
        items={[
          { id: "1", icon: "📦", title: "Install", status: { label: "done", tone: "success" }, preview: "412 packages in 9s" },
          { id: "2", icon: "🧪", title: "Test", status: { label: "done", tone: "success" }, detail: "$ npm test\n128 passing" },
          { id: "3", icon: "🏗️", title: "Build", status: { label: "done", tone: "success" }, detail: "$ npm run build\ndist/ 1.2 MB" },
          { id: "4", icon: "🚀", title: "Deploy to production", status: { label: "running", tone: "info" }, live: true, meta: "12s" },
        ]}
      />
    </Card>
  ),
};

export const Disclosures: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <Stack gap="3" style={{ maxWidth: 560 }}>
        <Disclosure summary={<Text weight="semibold">Instructions</Text>}>
          <Text tone="muted">Compare the options and write a short summary with links.</Text>
        </Disclosure>
        <Disclosure variant="card" open={open} onOpenChange={setOpen} summary={<Text size="sm" weight="semibold">Details (6 items)</Text>}>
          <Text size="sm">Controlled: open = {String(open)}</Text>
        </Disclosure>
      </Stack>
    );
  },
};
