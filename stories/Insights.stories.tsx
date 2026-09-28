import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card, CardHeader, Disclosure, Grid, Progress, StatCard, Stack, Text, Timeline } from "../src/index";

export default { title: "Data display/Insights", tags: ["autodocs"] } satisfies Meta;

export const StatCards: StoryObj = {
  render: () => (
    <Grid min="12rem">
      <StatCard label="Tasks this week" value="503" hint="1,204 in total" trend={{ value: "+12%", tone: "positive" }} />
      <StatCard label="Succeeded" value="93%" hint="384 of 412 finished" />
      <StatCard label="Failed runs" value="28" trend={{ value: "+4", tone: "negative" }} />
      <StatCard label="Tokens this month" value="1.4M" hint="of 2M plan">
        <Progress value={1_400_000} max={2_000_000} aria-label="Plan used" size="sm" />
      </StatCard>
    </Grid>
  ),
};

export const ProgressMeters: StoryObj = {
  render: () => (
    <Stack gap="4" style={{ maxWidth: 480 }}>
      <Progress label="Qwen3.8 · monthly plan" valueText="420k of 2M" value={420_000} max={2_000_000} />
      <Progress label="Claude Sonnet · monthly plan" valueText="850k of 1M" value={850_000} max={1_000_000} />
      <Progress label="GPT-4.1 · monthly plan" valueText="500k of 500k" value={500_000} max={500_000} />
      <Progress label="Upload" valueText="64%" value={64} thresholds={null} />
    </Stack>
  ),
};

export const TimelineOfAgentActivity: StoryObj = {
  render: () => (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader title="coder's activity" />
      <Timeline
        aria-label="coder's activity"
        maxHeight="20rem"
        live
        items={[
          { id: "1", icon: "💭", title: "Thinking", preview: "The user wants the test suite fixed; start by running it." },
          { id: "2", icon: "🔧", title: "bash: npm test", status: { label: "completed", tone: "success" }, detail: "Input:\nnpm test\n\nOutput:\n3 failing" },
          { id: "3", icon: "🔧", title: "edit: src/app.ts", status: { label: "completed", tone: "success" }, detail: "- return a+b\n+ return a + b" },
          { id: "4", icon: "🔧", title: "bash: npm test", status: { label: "running", tone: "info" }, live: true, meta: "12s" },
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
          <Text tone="muted">Research the options, compare them and write a short report with sources.</Text>
        </Disclosure>
        <Disclosure variant="card" open={open} onOpenChange={setOpen} summary={<Text size="sm" weight="semibold">Activity (6 steps)</Text>}>
          <Text size="sm">Controlled: open = {String(open)}</Text>
        </Disclosure>
      </Stack>
    );
  },
};
