import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphChart, layoutGraph } from "../charts";

const nodes = [
  { id: "a", label: "Alpha", kind: "entity" },
  { id: "b", label: "Beta", kind: "doc", pending: true },
  { id: "c", label: "Gamma", kind: "entity" },
];
const links = [
  { from: "b", to: "a", label: "mentions" },
  { from: "a", to: "c", label: "uses" },
];
const kinds = { entity: { label: "Topic" }, doc: { label: "Document", color: 1 } };

describe("GraphChart", () => {
  it("is a focusable canvas named with its size and controls", () => {
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} />);
    const canvas = screen.getByRole("application", { name: /Knowledge: 3 nodes, 2 links/ });
    expect(canvas).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("toolbar", { name: "Canvas controls" })).toBeInTheDocument();
  });

  it("zooms with the controls and the keyboard, and fits", () => {
    render(<GraphChart label="K" nodes={nodes} links={links} kinds={kinds} />);
    const pct = () => screen.getByRole("button", { name: "Zoom to 100%" }).textContent;
    fireEvent.click(screen.getByRole("button", { name: "Zoom to 100%" }));
    expect(pct()).toBe("100%");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(pct()).toBe("125%");
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(pct()).toBe("100%");
    fireEvent.keyDown(screen.getByRole("application"), { key: "+" });
    expect(pct()).toBe("125%");
    fireEvent.keyDown(screen.getByRole("application"), { key: "-" });
    expect(pct()).toBe("100%");
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));
    expect(pct()).toMatch(/^\d+%$/);
  });

  it("stops zooming at the limits", () => {
    render(<GraphChart label="K" nodes={nodes} links={links} />);
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    for (let i = 0; i < 30; i++) fireEvent.click(zoomIn);
    expect(zoomIn).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom to 100%" })).toHaveTextContent("400%");
  });

  it("lists nodes as buttons that call onNodeClick", () => {
    const onClick = vi.fn();
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} onNodeClick={onClick} selectedId="a" />);
    fireEvent.click(screen.getByRole("button", { name: "Beta (Document, pending)" }));
    expect(onClick).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: /Alpha/ })).toHaveAttribute("aria-current", "true");
  });

  it("has a links table with labels resolved", () => {
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} />);
    expect(screen.getByRole("table", { name: "Knowledge: links" })).toHaveTextContent("BetamentionsAlpha");
  });

  it("shows a legend only when several kinds are present, and survives data changes", () => {
    const { rerender } = render(<GraphChart label="K" nodes={nodes} links={links} kinds={kinds} />);
    expect(screen.getByRole("list", { name: "Node types" })).toHaveTextContent("TopicDocument");
    rerender(<GraphChart label="K" nodes={nodes} links={links} kinds={kinds} selectedId="b" />);
    rerender(<GraphChart label="K" nodes={[nodes[0]]} links={[]} kinds={kinds} />);
    expect(screen.queryByRole("list", { name: "Node types" })).toBeNull();
  });
});

describe("layoutGraph", () => {
  it("is deterministic and keeps placed nodes where they are", () => {
    const one = layoutGraph(nodes, links);
    const two = layoutGraph(nodes, links);
    expect([...one]).toEqual([...two]);
    const placed = new Map([["a", { x: 5, y: 7 }]]);
    const three = layoutGraph(nodes, links, placed);
    expect(three.get("a")).toEqual({ x: 5, y: 7 });
    for (const p of three.values()) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
  });
});

import { ConfirmDialog, DataTable, DescriptionList, Drawer } from "../index";

describe("Drawer", () => {
  it("is a labelled dialog with its content and footer", () => {
    render(
      <Drawer open onClose={() => {}} title="Request" description="From the lead" footer={<button>Delete</button>}>
        <p>Details</p>
      </Drawer>,
    );
    const d = screen.getByRole("dialog", { hidden: true });
    expect(d).toHaveAccessibleName("Request");
    expect(d).toHaveTextContent("Details");
    expect(screen.getByRole("button", { name: "Close", hidden: true })).toBeInTheDocument();
  });
});

describe("DescriptionList", () => {
  it("renders terms and values, with a dash for empty ones", () => {
    const { container } = render(<DescriptionList items={[{ term: "Agent", description: "lead" }, { term: "Response", description: "" }]} />);
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")[1]).toHaveTextContent("—");
  });
});

describe("ConfirmDialog", () => {
  it("confirms and cancels", () => {
    const yes = vi.fn();
    const no = vi.fn();
    render(<ConfirmDialog open title="Delete it?" onConfirm={yes} onCancel={no}>Gone for good.</ConfirmDialog>);
    fireEvent.click(screen.getByRole("button", { name: "Delete", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    expect(yes).toHaveBeenCalledOnce();
    expect(no).toHaveBeenCalledOnce();
  });
});

describe("DataTable clickable rows", () => {
  it("open from the keyboard", () => {
    const onRowClick = vi.fn();
    render(<DataTable caption="T" columns={[{ key: "n", header: "N" }]} rows={[{ n: "a" }]} getRowId={(r) => r.n} onRowClick={onRowClick} />);
    const row = screen.getAllByRole("row")[1];
    expect(row).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledWith({ n: "a" });
  });
});
