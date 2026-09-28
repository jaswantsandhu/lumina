import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphChart } from "../charts";

const nodes = [
  { id: "a", label: "Alpha", kind: "entity" },
  { id: "b", label: "Beta", kind: "doc", pending: true },
];
const links = [{ from: "b", to: "a", label: "mentions" }];
const kinds = { entity: { label: "Topic" }, doc: { label: "Document", color: 1 } };

describe("GraphChart", () => {
  it("names the graph and summarises it", () => {
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} />);
    expect(screen.getByRole("img", { name: /Knowledge: 2 nodes, 1 links/ })).toBeInTheDocument();
  });
  it("lists nodes as buttons that call onNodeClick", () => {
    const onClick = vi.fn();
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} onNodeClick={onClick} selectedId="a" />);
    const beta = screen.getByRole("button", { name: "Beta (Document, pending)" });
    fireEvent.click(beta);
    expect(onClick).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: /Alpha/ })).toHaveAttribute("aria-current", "true");
  });
  it("has a links table with labels resolved", () => {
    render(<GraphChart label="Knowledge" nodes={nodes} links={links} kinds={kinds} />);
    const table = screen.getByRole("table", { name: "Knowledge: links" });
    expect(table).toHaveTextContent("BetamentionsAlpha");
  });
  it("shows a legend only when several kinds are present", () => {
    const { rerender } = render(<GraphChart label="K" nodes={nodes} links={links} kinds={kinds} />);
    expect(screen.getByRole("list", { name: "Node types" })).toHaveTextContent("TopicDocument");
    rerender(<GraphChart label="K" nodes={nodes} links={links} kinds={kinds} selectedId="b" />);
    rerender(<GraphChart label="K" nodes={[nodes[0]]} links={[]} kinds={kinds} />);
    expect(screen.queryByRole("list", { name: "Node types" })).toBeNull();
  });
});
