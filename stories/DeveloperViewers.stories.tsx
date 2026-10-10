import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "@storybook/test";
import { DiffView } from "../src/components/DiffView";
import { TreeView, type TreeViewNode } from "../src/components/TreeView";
import { JsonTree } from "../src/components/JsonTree";

const meta = { title: "Data display/Developer viewers", component: DiffView, args: { before: "", after: "" }, tags: ["autodocs"] } satisfies Meta<typeof DiffView>;
export default meta;
type Story = StoryObj<typeof meta>;
const before = "const enabled = false;\n\nstart();\n";
const after = "// Enable the feature\nconst enabled = true;\n\nstart();\nstop();\n";

export const UnifiedDiff: Story = {
  args: { before, after, mode: "unified" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("- const enabled = false;")).toBeVisible();
    await expect(canvas.getByText("+ const enabled = true;")).toBeVisible();
    await expect(canvas.getByText("start();", { exact: false })).toBeVisible();
  },
};
export const SplitDiff: Story = { args: { before, after, mode: "split", beforeLabel: "main.ts (old)", afterLabel: "main.ts (new)" } };
export const DiffLayouts: Story = {
  render: () => {
    const [mode, setMode] = useState<"unified" | "split">("unified");
    return <><button type="button" onClick={() => setMode(mode === "unified" ? "split" : "unified")}>Switch layout</button><DiffView before={before} after={after} mode={mode} /></>;
  },
};
const nodes: TreeViewNode[] = [
  { id: "src", label: "src", children: [{ id: "components", label: "components", children: [{ id: "button", label: "Button.tsx" }] }, { id: "index", label: "index.ts" }] },
  { id: "package", label: "package.json" },
];
export const FileTree: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    return <><TreeView nodes={nodes} label="Project files" selectedId={selected} onSelect={setSelected} /><p>Selected: {selected ?? "none"}</p></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("treeitem", { name: "src" }));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "components" })).toHaveFocus();
    await expect(canvas.getByText("Selected: components")).toBeVisible();
  },
};
export const JsonInspector: Story = {
  render: () => <JsonTree label="Response" value={{ ok: true, count: 2, message: "Hello", missing: null, emptyList: [], emptyObject: {}, users: [{ name: "Ada", roles: ["admin", "editor"] }] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const users = canvas.getByRole("button", { name: /"users": Array/ });
    await userEvent.click(users);
    await userEvent.click(canvas.getByRole("button", { name: /\[0\]: Object/ }));
    await expect(canvas.getByText('"name": "Ada"')).toBeVisible();
    await userEvent.click(users);
    await expect(canvas.queryByText('"name": "Ada"')).not.toBeInTheDocument();
  },
};
export const JsonPrimitives: Story = { render: () => <><JsonTree label="Null" value={null} /><JsonTree label="Empty array" value={[]} /><JsonTree label="Empty object" value={{}} /><JsonTree label="String" value="" /><JsonTree label="Number" value={0} /><JsonTree label="Boolean" value={false} /></> };
