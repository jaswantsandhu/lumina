import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useMemo, useState } from "react";
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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", bump);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", bump);
    };
  }, []);
  return version;
}

/** A Highcharts chart themed with Lumina tokens (follows light/dark). */
export function Chart({ options, description, className, ...build }: ChartProps) {
  const version = useThemeVersion();
  const merged = useMemo(() => {
    const base = buildChartOptions(build, readChartTheme());
    const withDescription = description ? { ...base, accessibility: { ...base.accessibility, description } } : base;
    return options ? Highcharts.merge(withDescription, options) : withDescription;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, JSON.stringify(build), options, description]);
  return (
    <div className={cx("lm-chart", className)}>
      <HighchartsReact highcharts={Highcharts} options={merged} />
    </div>
  );
}
