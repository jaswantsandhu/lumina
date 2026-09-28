import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import more from "highcharts/highcharts-more";
import heatmap from "highcharts/modules/heatmap";
import treemap from "highcharts/modules/treemap";
import sankey from "highcharts/modules/sankey";

// Highcharts 11 modules are factories; 12+ register themselves on import.
for (const mod of [more, heatmap, treemap, sankey]) if (typeof mod === "function") (mod as unknown as (h: typeof Highcharts) => void)(Highcharts);
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "../utils";
import { buildChartOptions, readChartTheme, type BuildOptions, type ChartSeries, type ChartType } from "./theme";

export type { ChartSeries, ChartType };

export interface ChartProps extends BuildOptions {
  /** Extra Highcharts options, merged over Lumina's. */
  options?: Highcharts.Options;
  /** Accessible description of what the chart shows. */
  description?: string;
  className?: string;
}

// Re-reads tokens when the theme changes (data-theme on <html>, or the OS setting).
function useThemeVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent", "class"] });
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    media?.addEventListener("change", bump);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", bump);
    };
  }, []);
  return version;
}

/** A Highcharts chart themed with Lumina tokens (follows light/dark). */
// The chart SVG is exposed as an image: give it a name (title, description or a summary).
function nameSvg(chart: Highcharts.Chart, name: string) {
  const svg = chart.container?.querySelector("svg");
  if (!svg) return;
  svg.setAttribute("aria-label", name);
  let t = svg.querySelector(":scope > title");
  if (!t) {
    t = document.createElementNS("http://www.w3.org/2000/svg", "title");
    svg.insertBefore(t, svg.firstChild);
  }
  t.textContent = name;
}

export function Chart({ options, description, className, ...build }: ChartProps) {
  const version = useThemeVersion();
  const nameRef = useRef("Chart");
  const merged = useMemo(() => {
    const base = buildChartOptions(build, readChartTheme());
    // Without a title or description the chart still needs a name for screen readers.
    const fallback = !build.title && !description ? `${build.type} chart: ${build.series.map((x) => x.name).join(", ")}` : undefined;
    const text = description ?? fallback;
    const name = build.title ?? text ?? "Chart";
    const withDescription: Highcharts.Options = {
      ...base,
      ...(text ? { accessibility: { ...base.accessibility, description: text } } : {}),
    };
    nameRef.current = name;
    return options ? Highcharts.merge(withDescription, options) : withDescription;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, JSON.stringify(build), options, description]);
  return (
    <div className={cx("lm-chart", className)}>
      <HighchartsReact highcharts={Highcharts} options={merged} callback={(chart: Highcharts.Chart) => nameSvg(chart, nameRef.current)} />
    </div>
  );
}
