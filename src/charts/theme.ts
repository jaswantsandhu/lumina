import type Highcharts from "highcharts";

export type ChartPalette = "categorical" | "colorblind" | "sequential" | "diverging";

export interface ChartTheme {
  /** The categorical palette (8 colours; chart-1 follows the accent). */
  colors: string[];
  palettes: Record<ChartPalette, string[]>;
  text: string;
  textMuted: string;
  grid: string;
  surface: string;
  border: string;
  fontFamily: string;
}

const FALLBACK_COLORS = ["#be185d", "#5448e3", "#1473b3", "#178148", "#b86e00", "#cc3136", "#7c3aed", "#0d9488"];
const FALLBACK: ChartTheme = {
  colors: FALLBACK_COLORS,
  palettes: {
    categorical: FALLBACK_COLORS,
    colorblind: ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9", "#8a7a00", "#000000"],
    sequential: ["#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
    diverging: ["#b91c1c", "#ef4444", "#fca5a5", "#fee2e2", "#f1f5f9", "#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1"],
  },
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
  const list = (prefix: string, fallback: string[]) => fallback.map((c, i) => v(`${prefix}${i + 1}`, c));
  const colors = list("--lm-color-chart-", FALLBACK.palettes.categorical);
  return {
    colors,
    palettes: {
      categorical: colors,
      colorblind: list("--lm-color-chart-cb-", FALLBACK.palettes.colorblind),
      sequential: list("--lm-color-chart-seq-", FALLBACK.palettes.sequential),
      diverging: list("--lm-color-chart-div-", FALLBACK.palettes.diverging),
    },
    text: v("--lm-color-text", FALLBACK.text),
    textMuted: v("--lm-color-text-muted", FALLBACK.textMuted),
    grid: v("--lm-color-border", FALLBACK.grid),
    surface: v("--lm-color-surface-raised", FALLBACK.surface),
    border: v("--lm-color-border-strong", FALLBACK.border),
    fontFamily: v("--lm-font-family-sans", FALLBACK.fontFamily),
  };
}

export type ChartType = "line" | "spline" | "area" | "column" | "bar" | "pie" | "donut" | "scatter" | "bubble" | "heatmap" | "treemap" | "sankey";
type SeriesType = "line" | "spline" | "area" | "column" | "bar" | "scatter" | "bubble";

export interface ChartSeries {
  name: string;
  /**
   * Numbers for cartesian charts; {name, y} for pie/donut; [x, y] or [x, y, size]
   * (or {x, y, z, name}) for scatter/bubble; [xIndex, yIndex, value] for heatmap;
   * {id, name, parent?, value?} for treemap; {from, to, weight} for sankey.
   */
  data: Array<unknown>;
  /** Override the series colour (defaults to the palette). */
  color?: string;
  /** Combo charts: this series' own type (e.g. columns with a line on top). */
  type?: SeriesType;
  /** Combo charts: 1 plots the series on the right-hand axis (see yTitle2). */
  yAxis?: 0 | 1;
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
  /** Colours: "categorical" (default), "colorblind", "sequential" (follows the accent) or "diverging". Heatmaps default to sequential. */
  palette?: ChartPalette;
  /** Heatmap row labels. */
  yCategories?: string[];
  /** Title of the right-hand axis, for series with yAxis: 1. */
  yTitle2?: string;
}

/** Highcharts options styled with Lumina tokens. Merge extra options over the result if needed. */
export function buildChartOptions(opts: BuildOptions, theme: ChartTheme): Highcharts.Options {
  const pie = opts.type === "pie" || opts.type === "donut";
  const noAxes = pie || opts.type === "treemap" || opts.type === "sankey";
  const heat = opts.type === "heatmap";
  const which = opts.palette ?? (heat ? "sequential" : "categorical");
  // Categorical is the theme's own colours (so a custom ChartTheme's colors still apply).
  const palette = which === "categorical" ? theme.colors : (theme.palettes?.[which] ?? theme.colors);
  const dual = opts.series.some((s) => s.yAxis === 1);
  const axisStyle = { color: theme.textMuted, fontSize: "12px" };
  return {
    chart: {
      type: pie ? "pie" : opts.type,
      height: opts.height ?? 320,
      backgroundColor: "transparent",
      style: { fontFamily: theme.fontFamily },
      spacing: [12, 8, 8, 8],
    },
    colors: palette,
    title: { text: opts.title ?? undefined, align: "left", style: { color: theme.text, fontSize: "15px", fontWeight: "600" } },
    subtitle: { text: opts.subtitle ?? undefined, align: "left", style: { color: theme.textMuted } },
    credits: { enabled: false },
    accessibility: { enabled: true },
    legend: {
      enabled: opts.legend ?? (heat || pie || opts.series.length > 1),
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
      shared: !noAxes && !heat && !["scatter", "bubble"].includes(opts.type),
    },
    xAxis: noAxes
      ? undefined
      : {
          categories: opts.categories,
          title: { text: opts.xTitle ?? undefined, style: axisStyle },
          labels: { style: axisStyle },
          lineColor: theme.grid,
          tickColor: theme.grid,
        },
    yAxis: noAxes
      ? undefined
      : [
          {
            title: { text: opts.yTitle ?? undefined, style: axisStyle },
            labels: { style: axisStyle },
            gridLineColor: theme.grid,
            ...(heat ? { categories: opts.yCategories, reversed: true, gridLineWidth: 0 } : {}),
          },
          ...(dual ? [{ title: { text: opts.yTitle2 ?? undefined, style: axisStyle }, labels: { style: axisStyle }, gridLineWidth: 0, opposite: true }] : []),
        ],
    ...(heat ? { colorAxis: { min: 0, stops: palette.map((c, i) => [i / (palette.length - 1), c] as [number, string]), labels: { style: axisStyle } } } : {}),
    plotOptions: {
      series: { animation: { duration: 300 }, stacking: opts.stacked ? "normal" : undefined },
      area: { fillOpacity: 0.15, marker: { enabled: false } },
      line: { marker: { radius: 3 } },
      column: { borderRadius: 4, borderWidth: 0 },
      bar: { borderRadius: 4, borderWidth: 0 },
      scatter: { marker: { radius: 5, symbol: "circle" } },
      bubble: { minSize: 8, maxSize: "18%", marker: { fillOpacity: 0.55 } },
      heatmap: { borderWidth: 2, borderColor: theme.surface, dataLabels: { enabled: false } },
      treemap: { layoutAlgorithm: "squarified", ...({ borderColor: theme.surface, borderWidth: 2 } as object), colorByPoint: true, dataLabels: { enabled: true, style: { textOutline: "none", fontWeight: "600" } }, levels: [{ level: 1, dataLabels: { enabled: true, style: { fontSize: "13px" } }, borderWidth: 3 }] },
      sankey: { nodeWidth: 14, linkOpacity: 0.35, curveFactor: 0.5, dataLabels: { style: { color: theme.text, textOutline: "none", fontWeight: "500" } } },
      pie: {
        innerSize: opts.type === "donut" ? "60%" : undefined,
        borderColor: theme.surface,
        borderWidth: 2,
        dataLabels: { enabled: true, style: { color: theme.text, textOutline: "none", fontWeight: "500" } },
      },
    },
    series: opts.series.map((s) => ({
      name: s.name,
      data: s.data,
      color: s.color,
      type: pie ? "pie" : (s.type ?? opts.type),
      ...(s.yAxis === 1 ? { yAxis: 1 } : {}),
      ...(opts.type === "sankey" ? { keys: ["from", "to", "weight"] } : {}),
      ...(opts.type === "treemap" ? { allowTraversingTree: true } : {}),
    })) as Highcharts.SeriesOptionsType[],
  };
}
