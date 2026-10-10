import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DiffView, diffLines } from "../components/DiffView";
import { TreeView, type TreeViewNode } from "../components/TreeView";
import { JsonTree } from "../components/JsonTree";
import { composeStories } from "@storybook/react";
import * as viewerStories from "../../stories/DeveloperViewers.stories";

describe("DiffView", () => {
  it("produces minimal edits and reconstructs both sources for repeated short sequences", () => {
    const sequences = ["", "a\n", "b\n", "a\na\n", "a\nb\n", "b\na\n", "b\nb\n"];
    const lcs = (a: string[], b: string[]): number => !a.length || !b.length ? 0 : a[0] === b[0] ? 1 + lcs(a.slice(1), b.slice(1)) : Math.max(lcs(a.slice(1), b), lcs(a, b.slice(1)));
    for (const a of sequences) for (const b of sequences) {
      const lines = diffLines(a, b);
      expect(lines.filter(line => line.type !== "add").map(line => line.text).join("")).toBe(a);
      expect(lines.filter(line => line.type !== "remove").map(line => line.text).join("")).toBe(b);
      expect(lines.filter(line => line.type === "equal")).toHaveLength(lcs(a.match(/[^\n]*\n/g) ?? [], b.match(/[^\n]*\n/g) ?? []));
    }
  });
  it("aligns inserted/deleted lines rather than comparing matching indices", () => {
    expect(diffLines("a\nb\nc\n", "x\na\nc\ny\n")).toEqual([
      { type: "add", text: "x\n", newLine: 1 },
      { type: "equal", text: "a\n", oldLine: 1, newLine: 2 },
      { type: "remove", text: "b\n", oldLine: 2 },
      { type: "equal", text: "c\n", oldLine: 3, newLine: 3 },
      { type: "add", text: "y\n", newLine: 4 },
    ]);
  });
  it("handles empty input, duplicate/blank lines, CRLF, and final newline changes", () => {
    expect(diffLines("", "")).toEqual([]);
    expect(diffLines("", "\n")).toEqual([{ type: "add", text: "\n", newLine: 1 }]);
    expect(diffLines("a", "a\n").map(line => line.type)).toEqual(["remove", "add"]);
    const a = "same\r\n\r\nsame\r\nx", b = "same\r\nsame\r\n\r\nx";
    const lines = diffLines(a, b);
    expect(lines.filter(line => line.type !== "add").map(line => line.text).join("")).toBe(a);
    expect(lines.filter(line => line.type !== "remove").map(line => line.text).join("")).toBe(b);
    expect(lines.filter(line => line.type !== "equal")).toHaveLength(2);
  });
  it("bounds a large changed region and preserves its shared edges", () => {
    const a = `head\n${"old\n".repeat(1100)}tail\n`, b = `head\n${"new\n".repeat(1100)}tail\n`;
    const lines = diffLines(a, b);
    expect(lines[0].type).toBe("equal");
    expect(lines.at(-1)).toMatchObject({ type: "equal", oldLine: 1102, newLine: 1102 });
    expect(lines.filter(line => line.type !== "add").map(line => line.text).join("")).toBe(a);
    expect(lines.filter(line => line.type !== "remove").map(line => line.text).join("")).toBe(b);
  });
  it("renders unified markers and aligned split rows with correct numbers", () => {
    const { rerender } = render(<DiffView before={"a\nb\n"} after={"x\na\nb\n"} className="custom" />);
    expect(screen.getByRole("region")).toHaveClass("custom", "lm-diffview--unified");
    expect(screen.getByText("+ x")).toBeInTheDocument();
    rerender(<DiffView before={"a\nb\n"} after={"x\na\nb\n"} mode="split" />);
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getAllByRole("cell")[0]).toHaveTextContent("");
    expect(within(rows[2]).getAllByRole("cell")[0]).toHaveTextContent("1 a");
    expect(within(rows[2]).getAllByRole("cell")[1]).toHaveTextContent("2 a");
  });
});

describe("Developer viewer stories", () => {
  const stories = composeStories(viewerStories);
  for (const name of ["UnifiedDiff", "FileTree", "JsonInspector"] as const) {
    it(`${name} interaction assertions pass`, async () => {
      const Story = stories[name];
      const { container } = render(<Story />);
      await Story.play?.({ canvasElement: container });
    });
  }
});

const nodes: TreeViewNode[] = [{ id: "root", label: "Root", children: [{ id: "branch", label: "Branch", children: [{ id: "leaf", label: "Leaf" }] }, { id: "child", label: "Child" }] }, { id: "last", label: "Last", children: [] }];
describe("TreeView", () => {
  it("navigates visible nodes, expands/collapses, and selects independently of focus", async () => {
    const user = userEvent.setup(), onSelect = vi.fn();
    render(<TreeView label="Files" nodes={nodes} onSelect={onSelect} className="custom" />);
    const root = screen.getByRole("treeitem", { name: "Root" });
    await user.tab();
    expect(root).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const branch = screen.getByRole("treeitem", { name: "Branch" });
    expect(branch).toHaveFocus();
    expect(branch).toHaveAttribute("aria-level", "2");
    expect(onSelect).not.toHaveBeenCalled();
    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    expect(screen.getByRole("treeitem", { name: "Leaf" })).toHaveAttribute("aria-selected", "true");
    expect(onSelect).toHaveBeenLastCalledWith("leaf");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(branch).toHaveFocus();
    expect(branch).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowDown} ");
    expect(onSelect).toHaveBeenLastCalledWith("child");
    await user.keyboard("{End}{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: "Last" })).toHaveFocus();
    expect(screen.getByRole("treeitem", { name: "Last" })).not.toHaveAttribute("aria-expanded");
    await user.keyboard("{Home}{ArrowUp}");
    expect(root).toHaveFocus();
    expect(screen.getAllByRole("treeitem").filter(item => item.tabIndex === 0)).toHaveLength(1);
    expect(screen.getByRole("tree")).toHaveClass("custom");
  });
  it("supports controlled expansion/selection and pointer disclosure without selecting", () => {
    const onExpandedChange = vi.fn(), onSelect = vi.fn();
    const { rerender } = render(<TreeView label="Files" nodes={nodes} expandedIds={[]} selectedId={null} onExpandedChange={onExpandedChange} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("treeitem", { name: "Root" }).querySelector(".lm-treeview__toggle")!);
    expect(onExpandedChange).toHaveBeenCalledWith(["root"]);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("treeitem", { name: "Branch" })).toBeNull();
    rerender(<TreeView label="Files" nodes={nodes} expandedIds={["root"]} selectedId="child" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("treeitem", { name: "Branch" }));
    expect(onSelect).toHaveBeenCalledWith("branch");
    expect(screen.getByRole("treeitem", { name: "Child" })).toHaveAttribute("aria-selected", "true");
  });
  it("retains a single tab stop after focused data is removed", () => {
    const { rerender } = render(<TreeView label="Files" nodes={nodes} />);
    act(() => { screen.getByRole("treeitem", { name: "Last" }).focus(); });
    rerender(<TreeView label="Files" nodes={nodes.slice(0, 1)} />);
    expect(screen.getByRole("treeitem", { name: "Root" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("treeitem", { name: "Root" })).toHaveFocus();
  });
  it("restores focus when a controlled expansion hides the focused child", () => {
    const { rerender } = render(<TreeView label="Files" nodes={nodes} expandedIds={["root"]} />);
    act(() => { screen.getByRole("treeitem", { name: "Child" }).focus(); });
    rerender(<TreeView label="Files" nodes={nodes} expandedIds={[]} />);
    expect(screen.getByRole("treeitem", { name: "Root" })).toHaveFocus();
  });
});

describe("JsonTree", () => {
  it("displays all primitives and empty containers without disclosure buttons", () => {
    render(<JsonTree className="custom" value={{ n: null, a: [], o: {}, s: "", b: false, num: 0 }} />);
    for (const text of ['"n": null', '"a": []', '"o": {}', '"s": ""', '"b": false', '"num": 0']) expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("region")).toHaveClass("custom");
  });
  it("lazily expands arrays/objects with keyboard-operable buttons and linked content", async () => {
    const user = userEvent.setup();
    render(<JsonTree value={{ items: [{ name: "Ada" }] }} />);
    const items = screen.getByRole("button", { name: /"items": Array/ });
    expect(items).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(items.getAttribute("aria-controls")!)).toHaveAttribute("hidden");
    act(() => { items.focus(); });
    await user.keyboard("{Enter}");
    const first = screen.getByRole("button", { name: /\[0\]: Object/ });
    await user.click(first);
    expect(screen.getByText('"name": "Ada"')).toBeVisible();
    await user.click(items);
    expect(screen.queryByText('"name": "Ada"')).toBeNull();
  });
  it("handles primitive roots and an initially collapsed root", () => {
    const { rerender } = render(<JsonTree value={null} />);
    expect(screen.getByText("JSON: null")).toBeInTheDocument();
    rerender(<JsonTree value={{ secret: "value" }} defaultExpandedDepth={0} key="new" />);
    expect(screen.queryByText('"secret": "value"')).toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });
});
