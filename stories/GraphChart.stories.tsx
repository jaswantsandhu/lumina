import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge, Card, Grid, Stack, Text } from "../src/index";
import { GraphChart, type GraphLink, type GraphNode } from "../src/charts";

export default {
  title: "Charts/GraphChart",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A node-link graph on a canvas for knowledge graphs and dependencies. Drag the dotted canvas to pan, drag nodes to rearrange, zoom with the control bar, ctrl/⌘ + wheel, a pinch, or the keyboard (+, −, 0 fits, arrows pan). Labels appear as you zoom in; hovering or selecting a node highlights its neighbours. Nodes have kinds (colour + legend) and can be pending (dashed). Keyboard users also get a node list (appears on Tab) and screen readers a links table. Import from `@jaswantsandhu/lumina/charts`.",
      },
    },
  },
} satisfies Meta;

const kinds = { entity: { label: "Topic", color: 0 }, doc: { label: "Document", color: 1, size: 12 }, person: { label: "Person", color: 3 } };
const nodes: GraphNode[] = [
  { id: "acme", label: "Acme", kind: "entity", description: "Customer since 2021" },
  { id: "billing", label: "Billing", kind: "entity" },
  { id: "invoices", label: "Invoices", kind: "entity" },
  { id: "ada", label: "Ada", kind: "person", description: "Account owner" },
  { id: "grace", label: "Grace", kind: "person" },
  { id: "runbook", label: "Billing runbook", kind: "doc", description: "How month-end billing runs" },
  { id: "contract", label: "Acme contract", kind: "doc" },
  { id: "refunds", label: "Refunds", kind: "entity", pending: true, description: "Suggested by an agent" },
];
const links: GraphLink[] = [
  { from: "acme", to: "billing", label: "uses" },
  { from: "billing", to: "invoices", label: "produces" },
  { from: "ada", to: "acme", label: "owns" },
  { from: "grace", to: "billing", label: "maintains" },
  { from: "runbook", to: "billing", label: "mentions" },
  { from: "runbook", to: "invoices", label: "mentions" },
  { from: "contract", to: "acme", label: "mentions" },
  { from: "billing", to: "refunds", label: "handles", dashed: true },
];

export const KnowledgeGraph: StoryObj = {
  name: "Knowledge graph with overview",
  render: function Render() {
    const [selected, setSelected] = useState<string | null>("runbook");
    const node = nodes.find((n) => n.id === selected);
    const related = links.filter((l) => l.from === selected || l.to === selected);
    return (
      <Grid min="18rem">
        <Card style={{ gridColumn: "span 2" }}>
          <GraphChart label="Team knowledge" nodes={nodes} links={links} kinds={kinds} selectedId={selected} onNodeClick={setSelected} />
        </Card>
        <Card>
          {node ? (
            <Stack gap="2">
              <Stack direction="row" gap="2" align="center">
                <Text weight="semibold">{node.label}</Text>
                <Badge tone={node.pending ? "warning" : "neutral"}>{node.pending ? "Pending review" : kinds[node.kind as keyof typeof kinds].label}</Badge>
              </Stack>
              {node.description && <Text tone="muted">{node.description}</Text>}
              {related.map((l, i) => (
                <Text key={i} size="sm">
                  {nodes.find((n) => n.id === l.from)?.label} <b>{l.label}</b> {nodes.find((n) => n.id === l.to)?.label}
                </Text>
              ))}
            </Stack>
          ) : (
            <Text tone="muted">Select a node.</Text>
          )}
        </Card>
      </Grid>
    );
  },
};

export const Empty: StoryObj = {
  render: () => (
    <Card>
      <GraphChart label="Empty graph" nodes={[]} links={[]} height={200} />
    </Card>
  ),
};

// A larger graph: labels hide until you zoom in or hover a node.
const teams = ["Billing", "Search", "Mobile", "Data", "Support", "Security"];
const big: GraphNode[] = teams.flatMap((t, i) => [
  { id: t, label: t, kind: "entity" },
  ...Array.from({ length: 6 }, (_, j) => ({ id: `${t}-${j}`, label: `${t} ${["API", "runbook", "owner", "roadmap", "alerts", "backlog"][j]}`, kind: j === 1 || j === 3 ? "doc" : j === 2 ? "person" : "entity" })),
  ...(i % 2 ? [{ id: `${t}-p`, label: `${t} idea`, kind: "entity", pending: true }] : []),
]);
const bigLinks: GraphLink[] = teams.flatMap((t, i) => [
  ...Array.from({ length: 6 }, (_, j) => ({ from: `${t}-${j}`, to: t, label: ["part of", "documents", "owns", "plans", "watches", "tracks"][j] })),
  { from: t, to: teams[(i + 1) % teams.length], label: "depends on" },
  ...(i % 2 ? [{ from: `${t}-p`, to: t, label: "suggested for", dashed: true }] : []),
]);

export const Canvas: StoryObj = {
  name: "Larger graph on the canvas",
  render: function Render() {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <Card>
        <GraphChart label="Organisation knowledge" nodes={big} links={bigLinks} kinds={kinds} selectedId={selected} onNodeClick={(id) => setSelected((s) => (s === id ? null : id))} height={520} />
      </Card>
    );
  },
};
