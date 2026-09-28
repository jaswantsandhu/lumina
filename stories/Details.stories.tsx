import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, ConfirmDialog, DataTable, DescriptionList, Drawer, Stack, Text, type Column } from "../src/index";

export default {
  title: "Overlays/Details and confirmation",
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Drawer shows one item's details beside the list (row click or Enter). DescriptionList lays out labelled values. ConfirmDialog asks before a destructive action." } } },
} satisfies Meta;

interface Req {
  id: string;
  request: string;
  outcome: "approved" | "rejected" | "answered";
  by: string;
  when: string;
}
const rows: Req[] = [
  { id: "1", request: "rm -rf build/", outcome: "approved", by: "Ada", when: "2h ago" },
  { id: "2", request: "Which region should we deploy to?", outcome: "answered", by: "Grace", when: "3h ago" },
  { id: "3", request: "git push origin main", outcome: "rejected", by: "Linus", when: "1d ago" },
];

export const HistoryWithDetails: StoryObj = {
  name: "History: details drawer and delete",
  render: function Render() {
    const [list, setList] = useState(rows);
    const [open, setOpen] = useState<Req | null>(null);
    const [confirm, setConfirm] = useState(false);
    const columns: Column<Req>[] = [
      { key: "outcome", header: "Outcome", render: (r) => <Badge tone={r.outcome === "rejected" ? "danger" : "success"}>{r.outcome}</Badge> },
      { key: "request", header: "Request" },
      { key: "by", header: "By" },
      { key: "when", header: "When" },
    ];
    return (
      <Card>
        <CardHeader title="History" description="Select a row for details." />
        <DataTable caption="History" columns={columns} rows={list} getRowId={(r) => r.id} onRowClick={setOpen} />
        <Drawer
          open={Boolean(open)}
          onClose={() => setOpen(null)}
          title={open?.request ?? ""}
          description="Resolved request"
          footer={
            <>
              <Button variant="danger" onClick={() => setConfirm(true)}>
                Delete
              </Button>
              <Button onClick={() => setOpen(null)}>Close</Button>
            </>
          }
        >
          {open && (
            <DescriptionList
              items={[
                { term: "Outcome", description: <Badge tone={open.outcome === "rejected" ? "danger" : "success"}>{open.outcome}</Badge> },
                { term: "Resolved by", description: open.by },
                { term: "When", description: open.when },
                { term: "Note", description: "" },
              ]}
            />
          )}
        </Drawer>
        <ConfirmDialog
          open={confirm}
          title="Delete this entry?"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setList((l) => l.filter((r) => r.id !== open?.id));
            setConfirm(false);
            setOpen(null);
          }}
        >
          <Text>It's removed from the history for everyone on the team.</Text>
        </ConfirmDialog>
      </Card>
    );
  },
};

export const Descriptions: StoryObj = {
  name: "DescriptionList layouts",
  render: () => (
    <Stack gap="4">
      <Card>
        <DescriptionList items={[{ term: "Agent", description: "coder" }, { term: "Status", description: <Badge tone="success">approved</Badge> }, { term: "Response", description: "" }]} />
      </Card>
      <Card>
        <DescriptionList
          layout="columns"
          items={[
            { term: "Requests", description: "1,204" },
            { term: "Tokens", description: "2.4M" },
            { term: "Cost", description: "$12.40" },
            { term: "Summary", description: "Long text spans the full width in the columns layout.", wide: true },
          ]}
        />
      </Card>
    </Stack>
  ),
};
