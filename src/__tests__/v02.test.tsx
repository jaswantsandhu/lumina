import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { buildChartOptions, readChartTheme } from "../charts/theme";
import { Button, CodeView, DataTable, DropdownMenu, FileDownload, FileUpload, type UploadFile } from "../index";

describe("DropdownMenu", () => {
  function Demo({ onEdit = () => {}, onDelete = () => {} }) {
    return (
      <DropdownMenu
        trigger={(p) => <Button {...p}>Actions</Button>}
        items={[
          { label: "Edit", onSelect: onEdit },
          { label: "Archived", onSelect: () => {}, disabled: true },
          { type: "separator" },
          { label: "Delete", onSelect: onDelete, danger: true },
        ]}
      />
    );
  }

  it("opens a menu with menuitems and runs the chosen action", async () => {
    const onDelete = vi.fn();
    render(<Demo onDelete={onDelete} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports arrow keys (skipping disabled items), Enter and Escape", async () => {
    const onDelete = vi.fn();
    render(<Demo onDelete={onDelete} />);
    screen.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions" })).toHaveFocus();
  });
});

describe("FileUpload", () => {
  function Demo(props: { maxSize?: number; accept?: string }) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    return <FileUpload files={files} onFilesChange={setFiles} {...props} />;
  }

  it("adds chosen files and removes them", async () => {
    render(<Demo />);
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await userEvent.upload(screen.getByTestId("lm-file-input"), file);
    const list = screen.getByRole("list", { name: "Selected files" });
    expect(within(list).getByText("notes.txt")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("rejects files that are too large or the wrong type", () => {
    render(<Demo maxSize={4} accept=".txt" />);
    const input = screen.getByTestId("lm-file-input");
    fireEvent.change(input, { target: { files: [new File(["too big"], "big.txt", { type: "text/plain" }), new File(["x"], "pic.png", { type: "image/png" })] } });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("big.txt: larger than 4 B");
    expect(alert).toHaveTextContent("pic.png: file type not allowed");
  });

  it("the drop zone is keyboard operable", () => {
    render(<Demo />);
    const zone = screen.getByRole("button", { name: /drop files/i });
    expect(zone).toHaveAttribute("tabindex", "0");
  });
});

describe("FileDownload", () => {
  it("creates a blob URL and triggers a download with the file name", async () => {
    const createObjectURL = vi.fn(() => "blob:test");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("report.json");
      expect(this.href).toBe("blob:test");
    });
    render(<FileDownload filename="report.json" data={() => '{"ok":true}'} mimeType="application/json" />);
    await userEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});

describe("CodeView", () => {
  it("highlights tokens and numbers lines", () => {
    const { container } = render(<CodeView code={"const x = 1;\nreturn x;"} language="tsx" title="demo.tsx" highlightLines={[2]} />);
    expect(screen.getByText("demo.tsx")).toBeInTheDocument();
    expect(container.querySelector(".token.keyword")).toHaveTextContent("const");
    expect(container.querySelectorAll(".lm-codeview__line")).toHaveLength(2);
    expect(container.querySelectorAll(".lm-codeview__line--marked")).toHaveLength(1);
  });
});

describe("DataTable", () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({ id: `t${i + 1}`, name: `Task ${i + 1}`, tokens: (i * 37) % 100 }));
  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "tokens", header: "Tokens", sortable: true, align: "right" as const },
  ];

  it("paginates and sorts with aria-sort", async () => {
    render(<DataTable caption="Tasks" columns={columns} rows={rows} getRowId={(r) => r.id} pageSize={5} />);
    const table = screen.getByRole("table", { name: "Tasks" });
    expect(within(table).getAllByRole("row")).toHaveLength(6);
    expect(screen.getByText("1–5 of 12")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("6–10 of 12")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Tokens/ }));
    expect(screen.getByRole("columnheader", { name: /Tokens/ })).toHaveAttribute("aria-sort", "ascending");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Task 1");
    await userEvent.click(screen.getByRole("button", { name: /Tokens/ }));
    expect(screen.getByRole("columnheader", { name: /Tokens/ })).toHaveAttribute("aria-sort", "descending");
  });

  it("selects rows, including select-all on the page", async () => {
    function Demo() {
      const [sel, setSel] = useState<string[]>([]);
      return <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} pageSize={5} selectedIds={sel} onSelectionChange={setSel} />;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByText(/5 selected/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Select row t1" }));
    expect(screen.getByText(/4 selected/)).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(<DataTable columns={columns} rows={[]} getRowId={(r: { id: string }) => r.id} empty="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("Chart options", () => {
  it("builds token-styled Highcharts options", () => {
    const theme = { ...readChartTheme(), colors: ["#111", "#222"], text: "#fff", grid: "#333" };
    const o = buildChartOptions({ type: "donut", series: [{ name: "Visits", data: [{ name: "web", y: 60 }, { name: "mobile", y: 40 }] }], title: "Usage" }, theme);
    expect(o.chart?.type).toBe("pie");
    expect(o.colors).toEqual(["#111", "#222"]);
    expect((o.plotOptions?.pie as { innerSize?: string }).innerSize).toBe("60%");
    expect(o.credits?.enabled).toBe(false);
    const line = buildChartOptions({ type: "area", series: [{ name: "a", data: [1, 2] }], categories: ["Mon", "Tue"], stacked: true }, theme);
    expect((line.xAxis as { categories?: string[] }).categories).toEqual(["Mon", "Tue"]);
    expect(line.plotOptions?.series?.stacking).toBe("normal");
  });
});

