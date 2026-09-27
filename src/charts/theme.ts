import type Highcharts from "highcharts";

export interface ChartTheme {
  colors: string[];
  text: string;
  textMuted: string;
  grid: string;
  surface: string;
  border: string;
  fontFamily: string;
}

const FALLBACK: ChartTheme = {
  colors: ["#be185d", "#5448e3", "#1473b3", "#178148", "#b86e00", "#cc3136"],
  text: "#15181e",
  textMuted: "#525a6a",
  grid: "#dde1e8",
  surface: "#ffffff",
  border: "#dde1e8",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

/** Reads the current Lumina tokens (so charts follow light/dark). */
export function readChartTheme(el: Element = document.documentElement): ChartTheme {
  if (typeof window === "undefined") return FALLBACK;
  const css = getComputedStyle(el);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    colors: FALLBACK.colors.map((c, i) => v(`--lm-color-chart-${i + 1}`, c)),
    text: v("--lm-color-text", FALLBACK.text),
    textMuted: v("--lm-color-text-muted", FALLBACK.textMuted),
    grid: v("--lm-color-border", FALLBACK.grid),
    surface: v("--lm-color-surface-raised", FALLBACK.surface),
    border: v("--lm-color-border-strong", FALLBACK.border),
    fontFamily: v("--lm-font-family-sans", FALLBACK.fontFamily),
  };
}

export type ChartType = "line" | "spline" | "area" | "column" | "bar" | "pie" | "donut";

export interface ChartSeries {
  name: string;
  /** Numbers for cartesian charts; {name, y} points for pie/donut. */
  data: Array<number | null | { name: string; y: number }>;
  /** Override the series colour (defaults to the token palette). */
  color?: string;
}

export interface BuildOptions {
  type: ChartType;
  series: ChartSeries[];
  categories?: string[];
  title?: string;
  subtitle?: string;
  xTitle?: string;
  yTitle?: string;
  stacked?: boolean;
  height?: number;
  /** Suffix for values in tooltips and labels, e.g. " tokens" or "%". */
  valueSuffix?: string;
  legend?: boolean;
}

/** Highcharts options styled with Lumina tokens. Merge extra options over the result if needed. */
export function buildChartOptions(opts: BuildOptions, theme: ChartTheme): Highcharts.Options {
  const pie = opts.type === "pie" || opts.type === "donut";
  const axisStyle = { color: theme.textMuted, fontSize: "12px" };
  return {
    chart: {
      type: pie ? "pie" : opts.type,
      height: opts.height ?? 320,
      backgroundColor: "transparent",
      style: { fontFamily: theme.fontFamily },
      spacing: [12, 8, 8, 8],
    },
    colors: theme.colors,
    title: { text: opts.title ?? undefined, align: "left", style: { color: theme.text, fontSize: "15px", fontWeight: "600" } },
    subtitle: { text: opts.subtitle ?? undefined, align: "left", style: { color: theme.textMuted } },
    credits: { enabled: false },
    accessibility: { enabled: true },
    legend: {
      enabled: opts.legend ?? (pie || opts.series.length > 1),
      itemStyle: { color: theme.text, fontWeight: "500" },
      itemHoverStyle: { color: theme.text },
    },
    tooltip: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      shadow: false,
      style: { color: theme.text },
      valueSuffix: opts.valueSuffix,
      shared: !pie,
    },
    xAxis: pie
      ? undefined
      : {
          categories: opts.categories,
          title: { text: opts.xTitle ?? undefined, style: axisStyle },
          labels: { style: axisStyle },
          lineColor: theme.grid,
          tickColor: theme.grid,
        },
    yAxis: pie
      ? undefined
      : {
          title: { text: opts.yTitle ?? undefined, style: axisStyle },
          labels: { style: axisStyle },
          gridLineColor: theme.grid,
        },
    plotOptions: {
      series: { animation: { duration: 300 }, stacking: opts.stacked ? "normal" : undefined },
      area: { fillOpacity: 0.15, marker: { enabled: false } },
      line: { marker: { radius: 3 } },
      column: { borderRadius: 4, borderWidth: 0 },
      bar: { borderRadius: 4, borderWidth: 0 },
      pie: {
        innerSize: opts.type === "donut" ? "60%" : undefined,
        borderColor: theme.surface,
        borderWidth: 2,
        dataLabels: { enabled: true, style: { color: theme.text, textOutline: "none", fontWeight: "500" } },
      },
    },
    series: opts.series.map((s) => ({ name: s.name, data: s.data, color: s.color, type: pie ? "pie" : opts.type })) as Highcharts.SeriesOptionsType[],
  };
}
