import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { applyAppearance, CalendarHeatmap, Gauge, Sparkline, ThemeCustomizer, useAppearance } from "../index";
import { buildChartOptions, readChartTheme } from "../charts";

describe("Sparkline", () => {
  it("summarises the trend for screen readers", () => {
    render(<Sparkline data={[3, 5, 2, 8]} label="Runs per day" />);
    expect(screen.getByRole("img", { name: "Runs per day: from 3 to 8, low 2, high 8" })).toBeInTheDocument();
  });
  it("handles no data and bars", () => {
    render(<Sparkline data={[]} label="Empty" />);
    expect(screen.getByRole("img", { name: "Empty: no data" })).toBeInTheDocument();
    const { container } = render(<Sparkline data={[1, 2, null, 4]} type="bar" label="Bars" />);
    expect(container.querySelectorAll("rect")).toHaveLength(3);
  });
});

describe("Gauge", () => {
  it("is a meter with tones from thresholds", () => {
    const { rerender, container } = render(<Gauge value={50} max={100} label="Plan used" />);
    const m = screen.getByRole("meter", { name: "Plan used" });
    expect(m).toHaveAttribute("aria-valuenow", "50");
    expect(m).toHaveTextContent("50%");
    rerender(<Gauge value={85} max={100} label="Plan used" />);
    expect(container.querySelector(".lm-gauge--warning")).not.toBeNull();
    rerender(<Gauge value={120} max={100} label="Plan used" variant="half" valueText="Over" />);
    expect(container.querySelector(".lm-gauge--danger.lm-gauge--half")).not.toBeNull();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Over");
  });
});

describe("CalendarHeatmap", () => {
  it("names the total and active days, with a title per day", () => {
    const { container } = render(
      <CalendarHeatmap label="Runs" end="2026-09-28" weeks={4} data={[{ date: "2026-09-28", value: 4 }, { date: "2026-09-20", value: 1 }]} format={(v) => `${v} runs`} />,
    );
    expect(screen.getByRole("img", { name: "Runs: 5 runs over 4 weeks, on 2 days" })).toBeInTheDocument();
    expect(container.querySelector("title")?.textContent).toMatch(/^\d{4}-\d{2}-\d{2}: \d+ runs$/);
    expect(container.querySelectorAll("rect.lm-calendar__day--4").length).toBe(1);
  });
});

describe("Appearance", () => {
  it("sets and clears the attributes on <html>", () => {
    applyAppearance({ accent: "indigo", density: "compact", radius: "round" });
    const root = document.documentElement;
    expect(root.dataset.accent).toBe("indigo");
    expect(root.dataset.density).toBe("compact");
    expect(root.dataset.radius).toBe("round");
    applyAppearance({ accent: "rose", density: "default", radius: "default" });
    expect(root.hasAttribute("data-accent")).toBe(false);
    expect(root.hasAttribute("data-density")).toBe(false);
  });
  it("useAppearance persists and ThemeCustomizer switches accents from the keyboard", () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current[1]({ accent: "emerald" }));
    expect(document.documentElement.dataset.accent).toBe("emerald");
    expect(JSON.parse(localStorage.getItem("lumina.appearance")!).accent).toBe("emerald");
    render(<ThemeCustomizer />);
    const group = screen.getByRole("radiogroup", { name: "Accent" });
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(screen.getAllByRole("radio", { checked: true }).some((r) => r.getAttribute("aria-label") === "Amber")).toBe(true);
  });
});

describe("Chart options", () => {
  const theme = readChartTheme();
  it("heatmaps get a sequential colour axis and row categories", () => {
    const o = buildChartOptions({ type: "heatmap", series: [{ name: "Runs", data: [[0, 0, 3]] }], categories: ["Mon"], yCategories: ["9:00"] }, theme);
    expect((o as any).colorAxis.stops.length).toBe(theme.palettes.sequential.length);
    expect((o.yAxis as any[])[0].categories).toEqual(["9:00"]);
  });
  it("combo series keep their own type and axis", () => {
    const o = buildChartOptions({ type: "column", series: [{ name: "Tokens", data: [1, 2] }, { name: "Cost", data: [3, 4], type: "line", yAxis: 1 }], yTitle2: "$" }, theme);
    expect((o.series as any[])[1]).toMatchObject({ type: "line", yAxis: 1 });
    expect((o.yAxis as any[]).length).toBe(2);
  });
  it("sankey and treemap have no axes; palettes can be chosen", () => {
    const s = buildChartOptions({ type: "sankey", series: [{ name: "Flow", data: [{ from: "lead", to: "coder", weight: 3 }] }] }, theme);
    expect(s.xAxis).toBeUndefined();
    expect((s.series as any[])[0].keys).toEqual(["from", "to", "weight"]);
    const cb = buildChartOptions({ type: "line", palette: "colorblind", series: [{ name: "a", data: [1] }] }, theme);
    expect(cb.colors).toEqual(theme.palettes.colorblind);
  });
});
