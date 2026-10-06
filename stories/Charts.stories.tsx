import type { Meta, StoryObj } from "@storybook/react";
import { Card, Stack } from "../src/index";
import { Chart } from "../src/charts";

export default { title: "Charts/Chart", tags: ["autodocs"], parameters: { docs: { description: { component: "Highcharts, themed with Lumina tokens; charts re-theme when light/dark changes. Import from `@jaswantsandhu/lumina/charts` (peer deps: highcharts, highcharts-react-official)." } } } } satisfies Meta;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const wrap = (node: React.ReactNode) => <Card style={{ maxWidth: 760 }}>{node}</Card>;

export const Line: StoryObj = {
  render: () => wrap(<Chart type="line" title="Visits per day" categories={days} yTitle="Visits" valueSuffix=" visits" series={[{ name: "Web", data: [1200, 1900, 1500, 2400, 2100, 600, 400] }, { name: "Mobile", data: [800, 700, 1300, 900, 1600, 300, 200] }]} description="Daily visits by platform" />),
};

export const StackedArea: StoryObj = {
  name: "Stacked area",
  render: () => wrap(<Chart type="area" stacked title="Orders by status" categories={days} series={[{ name: "delivered", data: [12, 15, 11, 18, 20, 4, 3] }, { name: "returned", data: [1, 2, 1, 3, 1, 0, 0] }, { name: "cancelled", data: [0, 1, 0, 1, 2, 0, 0] }]} />),
};

export const Column: StoryObj = {
  render: () => wrap(<Chart type="column" title="Tickets closed per person" categories={["Ada", "Grace", "Linus"]} series={[{ name: "This week", data: [34, 21, 9] }, { name: "Last week", data: [28, 25, 6] }]} />),
};

export const Bar: StoryObj = {
  render: () => wrap(<Chart type="bar" title="Average page load (ms)" categories={["Home", "Search", "Product", "Checkout"]} valueSuffix=" ms" series={[{ name: "Load time", data: [182, 96, 141, 64] }]} legend={false} />),
};

export const PieAndDonut: StoryObj = {
  name: "Pie and donut",
  render: () => (
    <Stack direction="row" gap="4" wrap>
      {wrap(<Chart type="pie" title="Sign-ups" height={280} series={[{ name: "Sign-ups", data: [{ name: "organic", y: 62 }, { name: "referral", y: 38 }] }]} />)}
      {wrap(<Chart type="donut" title="Revenue by region" height={280} valueSuffix=" $" series={[{ name: "Revenue", data: [{ name: "Europe", y: 3200 }, { name: "Americas", y: 8400 }, { name: "Asia", y: 4100 }] }]} />)}
    </Stack>
  ),
};

// ---------- Lumina 0.8 ----------

export const ComboTwoAxes: StoryObj = {
  name: "Combo: columns + line, two axes",
  render: () =>
    wrap(
      <Chart
        type="column"
        title="Tokens and cost per day"
        categories={days}
        yTitle="Tokens"
        yTitle2="Cost ($)"
        series={[
          { name: "Tokens", data: [120, 190, 150, 240, 210, 60, 40] },
          { name: "Cost", data: [1.2, 1.9, 1.5, 2.6, 2.2, 0.6, 0.4], type: "line", yAxis: 1 },
        ]}
      />,
    ),
};

export const ScatterAndBubble: StoryObj = {
  name: "Scatter and bubble",
  render: () => (
    <Stack direction="row" gap="4" wrap>
      {wrap(<Chart type="scatter" title="Duration vs tokens" xTitle="Seconds" yTitle="Tokens" series={[{ name: "Runs", data: [[12, 800], [30, 2100], [45, 2600], [8, 400], [60, 5200], [25, 1500]] }]} legend={false} height={280} />)}
      {wrap(<Chart type="bubble" title="Teams: agents, runs and cost" xTitle="Agents" yTitle="Runs" series={[{ name: "Teams", data: [{ x: 3, y: 120, z: 12, name: "Acme" }, { x: 5, y: 300, z: 40, name: "Orion" }, { x: 2, y: 60, z: 6, name: "Labs" }] }]} legend={false} height={280} />)}
    </Stack>
  ),
};

const hours = ["00", "04", "08", "12", "16", "20"];
export const Heatmap: StoryObj = {
  name: "Heatmap: day × hour",
  render: () =>
    wrap(
      <Chart
        type="heatmap"
        title="Runs by day and hour"
        categories={days}
        yCategories={hours}
        series={[{ name: "Runs", data: days.flatMap((_, x) => hours.map((_, y) => [x, y, Math.round(Math.abs(Math.sin(x * 1.7 + y)) * (x < 5 ? 20 : 6))])) }]}
        height={300}
      />,
    ),
};

export const Treemap: StoryObj = {
  render: () =>
    wrap(
      <Chart
        type="treemap"
        title="Tokens by team and model"
        series={[
          {
            name: "Tokens",
            data: [
              { id: "acme", name: "Acme" },
              { id: "orion", name: "Orion" },
              { name: "Large model", parent: "acme", value: 620 },
              { name: "Small model", parent: "acme", value: 210 },
              { name: "Large model", parent: "orion", value: 340 },
              { name: "Own provider", parent: "orion", value: 150 },
            ],
          },
        ]}
        height={320}
      />,
    ),
};

export const Sankey: StoryObj = {
  render: () =>
    wrap(
      <Chart
        type="sankey"
        title="How work flows through the team"
        series={[
          {
            name: "Tasks",
            data: [
              { from: "Assigned", to: "Lead", weight: 40 },
              { from: "Lead", to: "Coder", weight: 18 },
              { from: "Lead", to: "Researcher", weight: 12 },
              { from: "Lead", to: "Answered directly", weight: 10 },
              { from: "Coder", to: "Succeeded", weight: 15 },
              { from: "Coder", to: "Failed", weight: 3 },
              { from: "Researcher", to: "Succeeded", weight: 12 },
            ],
          },
        ]}
        height={320}
      />,
    ),
};

export const Palettes: StoryObj = {
  name: "Palettes",
  render: () => (
    <Stack gap="4">
      {(["categorical", "colorblind", "diverging", "sequential"] as const).map((p) =>
        wrap(<Chart key={p} type="column" title={`${p} palette`} palette={p} categories={["A", "B", "C"]} series={Array.from({ length: p === "categorical" || p === "colorblind" ? 8 : 9 }, (_, i) => ({ name: `Series ${i + 1}`, data: [3 + (i % 3), 5 - (i % 4), 4] }))} height={240} />),
      )}
    </Stack>
  ),
};

export const LimitLine: StoryObj = {
  name: "Limit line",
  parameters: { docs: { description: { story: "`limits` draws reference lines on the value axis (tone danger, warning, success or neutral)." } } },
  render: () =>
    wrap(
      <Chart
        type="line"
        title="ACME month-to-date volume"
        categories={["Wk 1", "Wk 2", "Wk 3", "Wk 4"]}
        valueSuffix="M USD"
        series={[{ name: "Volume", data: [2.1, 4.8, 7.6, 9.92] }]}
        limits={[{ value: 9.5, label: "Monthly limit 9.5M", tone: "danger" }, { value: 8.55, label: "90%", tone: "warning" }]}
        legend={false}
      />,
    ),
};

export const LimitBar: StoryObj = {
  name: "Limit bar (bullet)",
  parameters: { docs: { description: { story: "`type=\"bullet\"`: each bar has a `target` marker. Bars over their target turn danger, above 90% warning." } } },
  render: () =>
    wrap(
      <Chart
        type="bullet"
        title="Volume against monthly limit (%)"
        categories={["ACME", "BOLT", "CRUX"]}
        valueSuffix="%"
        series={[{ name: "Used", data: [{ y: 104.4, target: 100 }, { y: 63, target: 100 }, { y: 96, target: 100 }] }]}
        legend={false}
        height={220}
      />,
    ),
};

export const Waterfall: StoryObj = {
  render: () =>
    wrap(
      <Chart
        type="waterfall"
        title="From payment to payout"
        valueSuffix=" USD"
        series={[{ name: "Payout", data: [{ name: "Amount", y: 100 }, { name: "Card fee", y: -3.2 }, { name: "Reserve (5%)", y: -5 }, { name: "Payout", isSum: true }] }]}
        legend={false}
      />,
    ),
};

export const Funnel: StoryObj = {
  render: () =>
    wrap(<Chart type="funnel" title="Batch progress" series={[{ name: "Learners", data: [["Joined", 30], ["Started Day 1", 28], ["Finished Day 5", 22], ["Finished Day 10", 18]] }]} legend={false} />),
};

export const SwimLanes: StoryObj = {
  name: "Swim lanes (xrange)",
  parameters: { docs: { description: { story: "`type=\"xrange\"`: bars from `x` to `x2` in lanes (`y` is the lane index, `yCategories` names them). Add `datetime` for timestamps." } } },
  render: () =>
    wrap(
      <Chart
        type="xrange"
        title="Thread timelines (ms)"
        yCategories={["Thread A", "Thread B", "Thread C"]}
        series={[
          {
            name: "Work",
            data: [
              { x: 0, x2: 200, y: 0, name: "fraud check" },
              { x: 0, x2: 200, y: 1, name: "fraud check" },
              { x: 200, x2: 260, y: 0, name: "save" },
              { x: 50, x2: 250, y: 2, name: "fraud check" },
            ],
          },
        ]}
        legend={false}
        height={240}
      />,
    ),
};
