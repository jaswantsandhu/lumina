import type { Meta, StoryObj } from "@storybook/react";
import { Card, Stack } from "../src/index";
import { Chart } from "../src/charts";

export default { title: "Charts/Chart", tags: ["autodocs"], parameters: { docs: { description: { component: "Highcharts, themed with Lumina tokens; charts re-theme when light/dark changes. Import from `@jaswantsandhu/lumina/charts` (peer deps: highcharts, highcharts-react-official)." } } } } satisfies Meta;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const wrap = (node: React.ReactNode) => <Card style={{ maxWidth: 760 }}>{node}</Card>;

export const Line: StoryObj = {
  render: () => wrap(<Chart type="line" title="Tokens per day" categories={days} yTitle="Tokens" valueSuffix=" tokens" series={[{ name: "coder", data: [1200, 1900, 1500, 2400, 2100, 600, 400] }, { name: "researcher", data: [800, 700, 1300, 900, 1600, 300, 200] }]} description="Daily token usage by agent" />),
};

export const StackedArea: StoryObj = {
  name: "Stacked area",
  render: () => wrap(<Chart type="area" stacked title="Tasks by status" categories={days} series={[{ name: "succeeded", data: [12, 15, 11, 18, 20, 4, 3] }, { name: "failed", data: [1, 2, 1, 3, 1, 0, 0] }, { name: "cancelled", data: [0, 1, 0, 1, 2, 0, 0] }]} />),
};

export const Column: StoryObj = {
  render: () => wrap(<Chart type="column" title="Subtasks per agent" categories={["coder", "researcher", "reviewer"]} series={[{ name: "This week", data: [34, 21, 9] }, { name: "Last week", data: [28, 25, 6] }]} />),
};

export const Bar: StoryObj = {
  render: () => wrap(<Chart type="bar" title="Average run time (s)" categories={["Implement", "Research", "Review", "Test"]} valueSuffix=" s" series={[{ name: "Run time", data: [182, 96, 41, 64] }]} legend={false} />),
};

export const PieAndDonut: StoryObj = {
  name: "Pie and donut",
  render: () => (
    <Stack direction="row" gap="4" wrap>
      {wrap(<Chart type="pie" title="Replies" height={280} series={[{ name: "Replies", data: [{ name: "delegated", y: 62 }, { name: "direct", y: 38 }] }]} />)}
      {wrap(<Chart type="donut" title="Tokens by agent" height={280} valueSuffix=" tokens" series={[{ name: "Tokens", data: [{ name: "lead", y: 3200 }, { name: "coder", y: 8400 }, { name: "researcher", y: 4100 }] }]} />)}
    </Stack>
  ),
};
