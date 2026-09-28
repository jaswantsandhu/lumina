import Highcharts from "highcharts";
import networkgraph from "highcharts/modules/networkgraph";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "../utils";
import { readChartTheme } from "./theme";

// Highcharts 11 modules are factories; 12+ register themselves on import.
if (typeof networkgraph === "function") (networkgraph as unknown as (h: typeof Highcharts) => void)(Highcharts);

export interface GraphNode {
  id: string;
  label: string;
  /** Key into `kinds`, for colour and the legend (e.g. "entity", "document"). */
  kind?: string;
  /** Short line shown on hover and read by screen readers. */
  description?: string;
  /** Drawn faded with a dashed outline (e.g. awaiting review). */
  pending?: boolean;
}

export interface GraphLink {
  from: string;
  to: string;
  /** Edge label, e.g. the relation's predicate. */
  label?: string;
  dashed?: boolean;
}

export interface GraphKind {
  label: string;
  /** Index into the chart palette (0-5). */
  color?: number;
  /** Node radius in px (default 9). */
  size?: number;
}

export interface GraphChartProps {
  nodes: GraphNode[];
  links: GraphLink[];
  kinds?: Record<string, GraphKind>;
  /** Called when a node is clicked or chosen from the keyboard list. */
  onNodeClick?: (id: string) => void;
  /** Highlighted node. */
  selectedId?: string | null;
  height?: number;
  /** Accessible name of the graph. */
  label: string;
  /** Show edge labels (default: when there are at most 40 links). */
  showLinkLabels?: boolean;
  className?: string;
}

function useThemeVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    media?.addEventListener("change", bump);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", bump);
    };
  }, []);
  return version;
}

/**
 * A force-directed node-link graph (Highcharts networkgraph) themed with Lumina
 * tokens. Nodes can be dragged; clicking one calls onNodeClick. Keyboard and
 * screen-reader users get a list of nodes and a table of links alongside.
 */
// Highcharts' "select" state survives the layout's redraws (attributes and
// classes set from outside don't); its look comes from marker.states.select.
function paintSelection(chart: Highcharts.Chart, selectedId: string | null | undefined) {
  const series = chart.series?.[0] as unknown as { nodes?: { id: string; selected?: boolean; select: (on: boolean, accumulate: boolean) => void }[] } | undefined;
  for (const n of series?.nodes ?? []) {
    const want = n.id === selectedId;
    if (Boolean(n.selected) !== want) n.select(want, true);
  }
}

export function GraphChart({ nodes, links, kinds = {}, onNodeClick, selectedId, height = 420, label, showLinkLabels, className }: GraphChartProps) {
  const version = useThemeVersion();
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const clickRef = useRef(onNodeClick);
  clickRef.current = onNodeClick;
  const kindsKey = JSON.stringify(kinds);
  // The selection ring is drawn on the node's SVG directly: networkgraph can't
  // update its nodes in place (and a remount would re-run the layout). Applied
  // after every chart render (the layout draws nodes late) and on selection change.
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  useEffect(() => {
    if (chartRef.current?.chart) paintSelection(chartRef.current.chart, selectedRef.current);
  }, [selectedId]);

  const options = useMemo<Highcharts.Options>(() => {
    const t = readChartTheme();
    const colorOf = (n: GraphNode) => t.colors[(kinds[n.kind ?? ""]?.color ?? 0) % t.colors.length];
    const labels = showLinkLabels ?? links.length <= 40;
    return {
      chart: {
        type: "networkgraph",
        height,
        backgroundColor: "transparent",
        style: { fontFamily: t.fontFamily },
        // The wrapper names the graph and the lists below carry its content.
        events: {
          load() {
            this.container.querySelector("svg")?.setAttribute("aria-hidden", "true");
          },
          render() {
            paintSelection(this, selectedRef.current);
          },
        },
      },
      title: { text: undefined },
      credits: { enabled: false },
      accessibility: { enabled: false },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.border,
        style: { color: t.text },
        formatter(this: unknown) {
          const p = (this as { point?: { id?: string; fromNode?: { name: string }; toNode?: { name: string }; label?: string } }).point;
          if (p?.fromNode && p.toNode) return `${p.fromNode.name} <b>${p.label ?? "→"}</b> ${p.toNode.name}`;
          const n = p?.id ? byId.get(p.id) : undefined;
          if (!n) return false;
          const kind = kinds[n.kind ?? ""]?.label;
          return `<b>${n.label}</b>${kind ? ` · ${kind}` : ""}${n.pending ? " · pending" : ""}${n.description ? `<br/>${n.description}` : ""}`;
        },
      },
      plotOptions: {
        networkgraph: {
          keys: ["from", "to"],
          layoutAlgorithm: { enableSimulation: nodes.length <= 150, integration: "verlet", linkLength: 90, gravitationalConstant: 0.06 },
          draggable: true,
          link: { color: t.grid, width: 1.5 },
          dataLabels: {
            enabled: true,
            linkFormat: labels ? "{point.label}" : "",
            allowOverlap: false,
            style: { color: t.text, textOutline: "none", fontWeight: "500", fontSize: "11px" },
            linkTextPath: { enabled: true, attributes: { dy: -4 } },
          },
          point: { events: { click: (e) => { const id = (e.point as unknown as { id?: string }).id; if (id) clickRef.current?.(id); } } },
          cursor: "pointer",
        },
      },
      series: [
        {
          type: "networkgraph",
          name: label,
          data: links.map((l) => ({ from: l.from, to: l.to, label: l.label, dashStyle: l.dashed ? "Dash" : "Solid" })) as never,
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.label,
            color: colorOf(n),
            opacity: n.pending ? 0.55 : 1,
            marker: {
              radius: kinds[n.kind ?? ""]?.size ?? 9,
              lineWidth: n.pending ? 2 : 1,
              lineColor: n.pending ? t.textMuted : t.surface,
              states: { select: { enabled: true, fillColor: colorOf(n), lineColor: t.text, lineWidth: 3, radiusPlus: 3 } },
            },
          })) as never,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, nodes, links, kindsKey, height, label, showLinkLabels, byId]);

  // networkgraph can't update in place (it throws): any change to what's drawn remounts it.
  const structure = useMemo(() => JSON.stringify([version, kindsKey, height, label, showLinkLabels, nodes, links]), [version, kindsKey, height, label, showLinkLabels, nodes, links]);
  const legend = Object.entries(kinds).filter(([k]) => nodes.some((n) => n.kind === k));
  const t = readChartTheme();
  return (
    <div className={cx("lm-graph", className)}>
      <div role="img" aria-label={`${label}: ${nodes.length} nodes, ${links.length} links. The lists below have the same content.`}>
        <HighchartsReact key={structure} ref={chartRef} highcharts={Highcharts} options={options} />
      </div>
      {legend.length > 1 && (
        <ul className="lm-graph__legend" aria-label="Node types">
          {legend.map(([k, v]) => (
            <li key={k}>
              <span className="lm-graph__swatch" style={{ background: t.colors[(v.color ?? 0) % t.colors.length] }} aria-hidden="true" />
              {v.label}
            </li>
          ))}
        </ul>
      )}
      <nav className="lm-graph__nodes" aria-label={`${label}: nodes`}>
        <ul>
          {nodes.map((n) => (
            <li key={n.id}>
              <button type="button" aria-current={n.id === selectedId ? "true" : undefined} onClick={() => onNodeClick?.(n.id)}>
                {n.label}
                {n.kind && kinds[n.kind] ? ` (${kinds[n.kind].label}${n.pending ? ", pending" : ""})` : n.pending ? " (pending)" : ""}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <table className="lm-visually-hidden">
        <caption>{label}: links</caption>
        <thead>
          <tr>
            <th scope="col">From</th>
            <th scope="col">Link</th>
            <th scope="col">To</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l, i) => (
            <tr key={i}>
              <td>{byId.get(l.from)?.label ?? l.from}</td>
              <td>{l.label ?? "linked to"}</td>
              <td>{byId.get(l.to)?.label ?? l.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
