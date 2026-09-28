import type { Meta, StoryObj } from "@storybook/react";
import { CalendarHeatmap, Card, CardHeader, DataTable, Gauge, Grid, Sparkline, Stack, StatCard, Text, type Column } from "../src/index";

export default {
  title: "Charts/Small charts",
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Sparkline, Gauge and CalendarHeatmap are plain SVG (no Highcharts), themed with tokens and accessible (summaries, role=meter, per-day titles). Sequential colours follow the accent." } } },
} satisfies Meta;

const trend = [12, 18, 15, 22, 30, 26, 34, 31, 40, 38, 44, 52, 49, 61];

export const InStatCards: StoryObj = {
  name: "Sparklines in stat cards",
  render: () => (
    <Grid min="14rem">
      <StatCard label="Tokens this week" value="648k" trend={{ value: "+12%", tone: "positive" }}>
        <Sparkline data={trend} type="area" label="Tokens per day, last 14 days" />
      </StatCard>
      <StatCard label="Runs" value="1,114" hint="Last 14 days">
        <Sparkline data={trend.map((v) => Math.round(v / 3))} type="bar" label="Runs per day" />
      </StatCard>
      <StatCard label="Failures" value="3%" trend={{ value: "-1%", tone: "positive" }}>
        <Sparkline data={[6, 5, 7, 4, 3, 5, 3, 2, 3]} tone="danger" label="Failure rate" />
      </StatCard>
    </Grid>
  ),
};

interface Row {
  team: string;
  trend: number[];
}
const rows: Row[] = [
  { team: "Acme", trend },
  { team: "Orion", trend: trend.map((v, i) => v + (i % 3) * 6) },
  { team: "Labs", trend: trend.map((v) => 70 - v) },
];
export const InTables: StoryObj = {
  name: "Sparklines in a table",
  render: () => {
    const columns: Column<Row>[] = [
      { key: "team", header: "Team" },
      { key: "trend", header: "Tokens, 14 days", render: (r) => <div style={{ width: 140 }}><Sparkline data={r.trend} label={`${r.team} tokens per day`} height={24} /></div> },
    ];
    return (
      <Card>
        <DataTable caption="Teams" columns={columns} rows={rows} getRowId={(r) => r.team} />
      </Card>
    );
  },
};

export const Gauges: StoryObj = {
  render: () => (
    <Stack direction="row" gap="6" wrap align="center">
      <Gauge value={1.2} max={2} label="Plan used" valueText="60%" caption="1.2M of 2M" />
      <Gauge value={85} label="Disk used" caption="85% full" />
      <Gauge value={16} max={16} label="Containers" valueText="16/16" caption="at the cap" />
      <Gauge value={42} label="CPU" variant="half" caption="4 cores" size={140} />
    </Stack>
  ),
};

const today = new Date("2026-09-28T00:00:00Z");
const activity = Array.from({ length: 180 }, (_, i) => {
  const d = new Date(today.getTime() - i * 864e5);
  const weekday = d.getUTCDay() % 6 !== 0;
  return { date: d.toISOString().slice(0, 10), value: Math.max(0, Math.round((weekday ? 8 : 1) * Math.abs(Math.sin(i * 0.7)) - (i % 11 === 0 ? 9 : 0))) };
});
export const Calendar: StoryObj = {
  name: "Calendar heatmap",
  render: () => (
    <Card>
      <CardHeader title="Runs per day" description="Last 26 weeks" />
      <CalendarHeatmap label="Runs per day" data={activity} end="2026-09-28" format={(v) => `${v} run${v === 1 ? "" : "s"}`} />
      <Text size="xs" tone="muted">
        Hover a day for its count.
      </Text>
    </Card>
  ),
};
