import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar, Badge, DataTable, Stack, type Column } from "../src/index";

export default { title: "Data display/DataTable", tags: ["autodocs"] } satisfies Meta;

interface Row {
  id: string;
  task: string;
  owner: string;
  status: "running" | "succeeded" | "failed" | "queued";
  points: number;
  started: Date;
}

const owners = ["Ada", "Grace", "Linus"];
const statuses: Row["status"][] = ["succeeded", "running", "failed", "queued"];
const rows: Row[] = Array.from({ length: 23 }, (_, i) => ({
  id: `task-${i + 1}`,
  task: ["Redesign checkout", "Compare payment providers", "Review pricing copy", "Write release notes", "Update docs"][i % 5] + ` #${i + 1}`,
  owner: owners[i % 3],
  status: statuses[i % 4],
  points: (i * 7) % 13 + 1,
  started: new Date(Date.UTC(2026, 8, 27, 9, 0) - i * 3600_000),
}));

const tone = { succeeded: "success", running: "info", failed: "danger", queued: "neutral" } as const;

const columns: Column<Row>[] = [
  { key: "task", header: "Task", sortable: true },
  { key: "owner", header: "Owner", sortable: true, render: (r) => <Stack direction="row" gap="2" align="center"><Avatar name={r.owner} size="sm" />{r.owner}</Stack> },
  { key: "status", header: "Status", sortable: true, render: (r) => <Badge tone={tone[r.status]} dot={r.status === "running"}>{r.status}</Badge> },
  { key: "points", header: "Points", sortable: true, align: "right", render: (r) => r.points },
  { key: "started", header: "Started", sortable: true, value: (r) => r.started, render: (r) => r.started.toISOString().slice(0, 16).replace("T", " ") },
];

export const SortingAndPaging: StoryObj = {
  name: "Sorting and pagination",
  render: () => <DataTable caption="Tasks" columns={columns} rows={rows} getRowId={(r) => r.id} pageSize={8} defaultSort={{ key: "started", direction: "desc" }} />,
};

export const Selection: StoryObj = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>([]);
    return <DataTable caption="Tasks" columns={columns} rows={rows} getRowId={(r) => r.id} pageSize={8} selectedIds={selected} onSelectionChange={setSelected} />;
  },
};

export const Loading: StoryObj = { render: () => <DataTable caption="Tasks" columns={columns} rows={[]} getRowId={(r) => r.id} loading /> };

export const Empty: StoryObj = { render: () => <DataTable caption="Tasks" columns={columns} rows={[]} getRowId={(r) => r.id} empty="No tasks match your filters." /> };
