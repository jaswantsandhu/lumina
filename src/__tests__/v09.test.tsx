import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checklist, CodeView, codeLanguages, Dialog, markdownComponents, Prose, Quiz, resolveLanguage, SequenceDiagram, StepDiagram } from "../index";
import { buildChartOptions, readChartTheme } from "../charts";
import { layeredLayout } from "../components/diagramLayout";

describe("CodeView languages", () => {
  it("highlights shell, Java, C#, PowerShell and Dockerfile, and resolves aliases", () => {
    for (const l of ["bash", "java", "csharp", "powershell", "docker", "toml", "diff"]) expect(codeLanguages()).toContain(l);
    expect(resolveLanguage("sh")).toBe("bash");
    expect(resolveLanguage("yml")).toBe("yaml");
    expect(resolveLanguage("Dockerfile")).toBe("docker");
    expect(resolveLanguage("ps1")).toBe("powershell");
    expect(resolveLanguage(undefined)).toBe("text");
  });
  it("warns once for an unknown language instead of failing silently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveLanguage("cobol")).toBe("text");
    resolveLanguage("cobol");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
  it("renders Java with token classes", () => {
    const { container } = render(<CodeView code={"void main() { IO.println(1); }"} language="java" />);
    expect(container.querySelector(".token.keyword")).not.toBeNull();
  });
  it("does not leave a global Prism behind", () => {
    expect((globalThis as { Prism?: unknown }).Prism).toBeUndefined();
  });
});

describe("Dialog dismissible={false}", () => {
  it("has no close button and ignores Escape", () => {
    const onClose = vi.fn();
    render(<Dialog open title="Analytics?" dismissible={false} onClose={onClose} footer={<button>Decline</button>} />);
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent(document.querySelector("dialog")!, new Event("cancel", { cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("markdownComponents", () => {
  it("maps headings, callouts, code blocks and in-app links to Lumina", () => {
    const md = markdownComponents({ onInternalLink: vi.fn() });
    const { container } = render(
      <Prose>
        {md.h2({ children: "Fees" })}
        {md.blockquote({ children: "Note" })}
        {md.pre({ children: <code className="language-sh">{"java Hello.java\n"}</code> })}
        {md.a({ href: "/privacy", children: "Privacy" })}
      </Prose>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Fees" })).toBeInTheDocument();
    expect(container.querySelector(".lm-prose .lm-alert")).not.toBeNull();
    expect(container.querySelector(".lm-codeview__title")?.textContent).toBe("sh");
    expect(screen.getByRole("link", { name: "Privacy" })).not.toHaveAttribute("target");
  });
});

describe("Quiz", () => {
  it("gives feedback once per question and reports the score", () => {
    const onComplete = vi.fn();
    render(
      <Quiz
        onComplete={onComplete}
        questions={[
          { question: "7 / 2 in Java?", options: ["3.5", "3"], answer: 1, explanation: "Integer division." },
          { question: "Money type?", options: ["double", "BigDecimal"], answer: 1 },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "3.5" }));
    expect(screen.getByText("Not quite")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "BigDecimal" }));
    expect(onComplete).toHaveBeenCalledWith(1, 2);
    expect(screen.getByText("Score 1/2")).toBeInTheDocument();
  });
});

describe("Checklist", () => {
  it("tracks progress, controlled or not", () => {
    const onToggle = vi.fn();
    render(<Checklist label="Lab progress" onToggle={onToggle} items={[{ id: "a", title: "Install" }, { id: "b", title: "Run" }]} />);
    fireEvent.click(screen.getByLabelText("Step 1: Install"));
    expect(onToggle).toHaveBeenCalledWith("a", true);
    expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
  });
});

describe("StepDiagram", () => {
  const nodes = [{ id: "a", label: "Source" }, { id: "b", label: "Compiler" }, { id: "c", label: "JVM", sub: "runs it" }];
  const edges = [{ id: "ab", from: "a", to: "b" }, { id: "bc", from: "b", to: "c", label: "bytecode" }, { id: "ca", from: "c", to: "a" }];

  it("lays out nodes without coordinates, left to right, and curves the loop back", () => {
    const l = layeredLayout(nodes.map((n) => ({ ...n, w: 120, h: 42 })), edges, "LR");
    expect(l.centre.get("a")!.x).toBeLessThan(l.centre.get("b")!.x);
    expect(l.centre.get("b")!.x).toBeLessThan(l.centre.get("c")!.x);
    expect([...l.back]).toEqual(["ca"]);
  });

  it("steps through captions, values and code lines", () => {
    const { container } = render(
      <StepDiagram
        title="Run"
        nodes={nodes}
        edges={edges}
        groups={[{ id: "jdk", label: "JDK", nodes: ["b", "c"] }]}
        code={{ code: "line1\nline2\nline3", language: "text" }}
        steps={[
          { caption: "Write code", active: ["a"], lines: [1] },
          { caption: "Compile", active: ["b"], values: { c: { sub: "ready" } }, lines: [2, 3] },
        ]}
      />,
    );
    expect(screen.getByText("Write code")).toBeInTheDocument();
    expect(container.querySelectorAll(".lm-codeview__line--marked")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByText("Compile")).toBeInTheDocument();
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(container.querySelector(".lm-diagram__changed")).not.toBeNull();
    expect(container.querySelectorAll(".lm-codeview__line--marked")).toHaveLength(2);
    expect(screen.getByText("JDK")).toBeInTheDocument();
  });
});

describe("SequenceDiagram", () => {
  it("makes one step per message by default and shows participant state", () => {
    render(
      <SequenceDiagram
        participants={[{ id: "a", label: "Thread A" }, { id: "m", label: "Memory" }]}
        messages={[{ id: "r", from: "a", to: "m", label: "read 100" }, { id: "w", from: "a", to: "m", label: "write 101" }]}
      />,
    );
    expect(screen.getByText("Thread A → Memory: read 100", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("write 101")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByText("write 101")).toBeInTheDocument();
  });
  it("shows changing state values", () => {
    render(
      <SequenceDiagram
        participants={[{ id: "a", label: "A" }, { id: "m", label: "Memory" }]}
        messages={[{ id: "w", from: "a", to: "m", label: "write" }]}
        steps={[{ caption: "start", values: { m: "balance = 100" } }, { caption: "after", values: { m: "balance = 101" } }]}
      />,
    );
    expect(screen.getByText("balance = 100")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByText("balance = 101")).toBeInTheDocument();
  });
});

describe("New chart types", () => {
  const theme = readChartTheme();
  it("colours bullet bars by their target and draws limit lines", () => {
    const o = buildChartOptions(
      { type: "bullet", categories: ["ACME", "BOLT", "CRUX"], series: [{ name: "Volume", data: [{ y: 104, target: 100 }, { y: 63, target: 100 }, { y: 95, target: 100 }] }], limits: [{ value: 100, label: "Limit" }] },
      theme,
    );
    const data = (o.series![0] as { data: { color?: string }[] }).data;
    expect(data[0].color).toBe(theme.danger);
    expect(data[1].color).toBeUndefined();
    expect(data[2].color).toBe(theme.warning);
    expect(o.chart?.inverted).toBe(true);
    const plotLines = (o.yAxis as { plotLines: { value: number }[] }[])[0].plotLines;
    expect(plotLines[0].value).toBe(100);
  });
  it("supports waterfall, funnel and xrange", () => {
    const w = buildChartOptions({ type: "waterfall", series: [{ name: "Payout", data: [{ name: "Amount", y: 100 }, { name: "Fee", y: -3.2 }, { name: "Net", isSum: true }] }] }, theme);
    expect((w.xAxis as { type?: string }).type).toBe("category");
    const f = buildChartOptions({ type: "funnel", series: [{ name: "Learners", data: [["Joined", 30], ["Finished", 18]] }] }, theme);
    expect(f.xAxis).toBeUndefined();
    const x = buildChartOptions({ type: "xrange", yCategories: ["Thread A", "Thread B"], series: [{ name: "Work", data: [{ x: 0, x2: 200, y: 0 }] }] }, theme);
    expect((x.yAxis as { categories?: string[] }[])[0].categories).toEqual(["Thread A", "Thread B"]);
  });
});
