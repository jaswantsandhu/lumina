import { useMemo, type ReactNode } from "react";
import { cx } from "../utils";
import { layeredLayout } from "./diagramLayout";
import { DiagramCodePanel, StepControls, textWidth, useStepper, useSvgId, valuesAt, type DiagramCode } from "./diagramShared";

export interface DiagramNode {
  id: string;
  label: string;
  /** Second line, in monospace (a type, a value, a detail). */
  sub?: string;
  /** Centre position. Leave x and y out on every node for automatic layout. */
  x?: number;
  y?: number;
  /** Size; defaults fit the text. */
  w?: number;
  h?: number;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  /** Curve the arrow (positive bends left of its direction). Loops back are curved automatically. */
  bend?: number;
  dashed?: boolean;
}

export interface DiagramGroup {
  id: string;
  label: string;
  /** Node ids drawn inside this group's box. */
  nodes: string[];
}

/** A node value override: a new label, or { label?, sub? }. */
export type DiagramValue = string | { label?: string; sub?: string };

export interface DiagramStep {
  caption: ReactNode;
  /** Ids (nodes, edges, groups) highlighted at this step. */
  active?: string[];
  /** Ids revealed at this step; they stay visible afterwards. If no step uses `show`, everything is visible. */
  show?: string[];
  /**
   * Change what a node or edge says from this step on: { balance: { sub: "101" }, e1: "4 payments" }.
   * Changed items flash briefly. A string sets a node's label or an edge's label.
   */
  values?: Record<string, DiagramValue>;
  /** Lines to highlight in `code` (1-based). */
  lines?: number[];
}

export interface StepDiagramProps {
  title?: string;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  groups?: DiagramGroup[];
  steps: DiagramStep[];
  /** Automatic layout direction (left→right or top→bottom), used when nodes have no x/y. */
  direction?: "LR" | "TB";
  /** Canvas size in SVG units; computed for automatic layout. */
  width?: number;
  height?: number;
  /** Source code shown under the diagram; steps highlight lines with `lines`. */
  code?: DiagramCode;
  /** Milliseconds per step when playing (default 2200). */
  interval?: number;
  className?: string;
}

interface Box {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const nodeSize = (n: DiagramNode) => ({
  w: n.w ?? Math.max(110, textWidth(n.label) + 32, textWidth(n.sub, true) + 28),
  h: n.h ?? (n.sub ? 54 : 42),
});

/**
 * A step-through diagram: boxes and arrows, with a caption per step and Back / Next / Play.
 * Steps highlight, reveal and change parts of the picture, and can highlight lines in linked code.
 */
export function StepDiagram({ title, nodes, edges = [], groups = [], steps, direction = "LR", width, height, code, interval, className }: StepDiagramProps) {
  const stepper = useStepper(steps.length, interval);
  const arrow = useSvgId("lm-arrow");
  const step = steps[stepper.index] ?? { caption: "" };

  const layout = useMemo(() => {
    const auto = nodes.some((n) => n.x === undefined || n.y === undefined);
    // Size each box for the longest text any step gives it.
    const sized = nodes.map((n) => {
      const vs = steps.map((st) => st.values?.[n.id]).filter((v) => v !== undefined);
      const labels = [n.label, ...vs.map((v) => (typeof v === "string" ? v : v!.label)).filter(Boolean)] as string[];
      const subs = [n.sub, ...vs.map((v) => (typeof v === "string" ? undefined : v!.sub))].filter(Boolean) as string[];
      const widest = (xs: string[]) => xs.sort((a, b) => b.length - a.length)[0];
      return { ...n, ...nodeSize({ ...n, label: widest(labels), sub: subs.length ? widest(subs) : undefined }) };
    });
    if (!auto) {
      const right = Math.max(...sized.map((n) => n.x! + n.w / 2)) + 24;
      const bottom = Math.max(...sized.map((n) => n.y! + n.h / 2)) + 24;
      return { boxes: sized as Box[], width: width ?? right, height: height ?? bottom, back: new Set<string>() };
    }
    // Reserve room for the longest label an edge will ever show, including ones set by later steps.
    const longest = (e: DiagramEdge) =>
      [e.label, ...steps.map((st) => st.values?.[e.id])].filter((v): v is string => typeof v === "string").sort((x, y) => y.length - x.length)[0];
    const l = layeredLayout(sized, edges.map((e) => ({ ...e, label: longest(e) })), direction);
    const boxes = sized.map((n) => ({ ...n, ...l.centre.get(n.id)! })) as Box[];
    return { boxes, width: width ?? l.width, height: height ?? l.height, back: l.back };
  }, [nodes, edges, steps, direction, width, height]);

  const usesShow = steps.some((s) => s.show);
  const visible = new Set(
    usesShow ? steps.slice(0, stepper.index + 1).flatMap((s) => s.show ?? []) : [...nodes, ...edges, ...groups].map((e) => e.id),
  );
  const active = new Set(step.active ?? []);
  const { now: values, changed } = valuesAt(steps, stepper.index);
  const byId = Object.fromEntries(layout.boxes.map((b) => [b.id, b]));
  const pairs = new Set(edges.map((e) => `${e.from}>${e.to}`));

  const text = (b: Box) => {
    const v = values[b.id];
    return typeof v === "string" ? { label: v, sub: b.sub } : { label: v?.label ?? b.label, sub: v?.sub ?? b.sub };
  };

  return (
    <figure className={cx("lm-diagram", className)}>
      {title && <figcaption className="lm-diagram__title">{title}</figcaption>}
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={`${title ?? "Diagram"}: ${typeof step.caption === "string" ? step.caption : ""}`} className="lm-diagram__svg" style={{ maxWidth: layout.width * 1.25 }}>
        <defs>
          {["", "-active"].map((k) => (
            <marker key={k} id={`${arrow}${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={cx("lm-diagram__arrowhead", k && "lm-diagram__arrowhead--active")} />
            </marker>
          ))}
        </defs>

        {groups
          .filter((g) => visible.has(g.id))
          .map((g) => {
            const members = g.nodes.map((id) => byId[id]).filter(Boolean);
            if (!members.length) return null;
            const pad = 16;
            const x0 = Math.min(...members.map((m) => m.x - m.w / 2)) - pad;
            const y0 = Math.min(...members.map((m) => m.y - m.h / 2)) - pad - 14;
            const x1 = Math.max(...members.map((m) => m.x + m.w / 2)) + pad;
            const y1 = Math.max(...members.map((m) => m.y + m.h / 2)) + pad;
            return (
              <g key={g.id} className={cx("lm-diagram__group", active.has(g.id) && "lm-diagram__group--active")}>
                <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx="12" />
                <text x={x0 + 10} y={y0 + 16} className="lm-diagram__group-label">
                  {g.label}
                </text>
              </g>
            );
          })}

        {edges
          .filter((e) => visible.has(e.id) && byId[e.from] && byId[e.to])
          .map((e) => {
            // Curve loops back, and arrows that have a twin going the other way, so they don't overlap.
            const bend = e.bend ?? (layout.back.has(e.id) ? 60 : pairs.has(`${e.to}>${e.from}`) ? 22 : 0);
            const p = edgePath(byId[e.from], byId[e.to], bend);
            const on = active.has(e.id);
            const label = typeof values[e.id] === "string" ? (values[e.id] as string) : e.label;
            const pathId = `${arrow}-${e.id}`;
            return (
              <g key={e.id} className={cx("lm-diagram__edge", on && "lm-diagram__edge--active", e.dashed && "lm-diagram__edge--dashed")}>
                <path id={pathId} d={p.d} fill="none" markerEnd={`url(#${arrow}${on ? "-active" : ""})`} />
                {label && (
                  <text x={p.lx} y={p.ly} textAnchor="middle" className={cx("lm-diagram__edge-label", changed.has(e.id) && "lm-diagram__changed")}>
                    {label}
                  </text>
                )}
                {on && (
                  <circle r="5" className="lm-diagram__pulse">
                    <animateMotion dur="1.2s" repeatCount="indefinite">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

        {layout.boxes
          .filter((b) => visible.has(b.id))
          .map((b) => {
            const t = text(b);
            return (
              <g key={b.id} className={cx("lm-diagram__node", active.has(b.id) && "lm-diagram__node--active", changed.has(b.id) && "lm-diagram__changed")}>
                <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx="10" />
                <text x={b.x} y={t.sub ? b.y - 5 : b.y + 5} textAnchor="middle" className="lm-diagram__label">
                  {t.label}
                </text>
                {t.sub && (
                  <text x={b.x} y={b.y + 14} textAnchor="middle" className="lm-diagram__sub">
                    {t.sub}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
      <StepControls stepper={stepper} count={steps.length} caption={step.caption} />
      <DiagramCodePanel code={code} lines={step.lines} />
    </figure>
  );
}

/** A straight or curved path between two box borders, and where its label goes. */
function edgePath(a: Box, b: Box, bend: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // Distance from a box centre to its border along the line (so arrows start and end at the edge).
  const pad = (n: Box) => {
    const ux = Math.abs(dx / len) || 1e-6;
    const uy = Math.abs(dy / len) || 1e-6;
    return Math.min(n.w / 2 / ux, n.h / 2 / uy) + 4;
  };
  const sx = a.x + (dx / len) * pad(a);
  const sy = a.y + (dy / len) * pad(a);
  const ex = b.x - (dx / len) * pad(b);
  const ey = b.y - (dy / len) * pad(b);
  const mx = (sx + ex) / 2 - (dy / len) * bend;
  const my = (sy + ey) / 2 + (dx / len) * bend;
  // The label sits on the curve's midpoint (a quadratic's midpoint is halfway to its control point).
  const lx = (sx + ex) / 4 + mx / 2;
  const ly = (sy + ey) / 4 + my / 2;
  return { d: `M${sx},${sy} Q${mx},${my} ${ex},${ey}`, lx, ly: ly - 6 };
}
