import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { cx } from "../utils";
import { readChartTheme } from "./theme";

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
  /** Highlighted node; its neighbours stay bright and the rest dim. */
  selectedId?: string | null;
  height?: number;
  /** Accessible name of the graph. */
  label: string;
  /** Show every label regardless of zoom (default: labels appear as you zoom in). */
  showAllLabels?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}
interface View {
  x: number;
  y: number;
  k: number;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const GRID = 20;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Small deterministic PRNG so the same graph lays out the same way every time.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Force-directed layout (Fruchterman-Reingold), run to rest up front. Nodes that
 * already have a position keep it, so adding a node doesn't reshuffle the graph.
 */
export function layoutGraph(nodes: GraphNode[], links: GraphLink[], previous: Map<string, Point> = new Map()): Map<string, Point> {
  const n = nodes.length;
  const pos = new Map<string, Point>();
  if (!n) return pos;
  const rand = seeded(nodes.map((d) => d.id).join("|"));
  const area = n * 9000;
  const k = Math.sqrt(area / n);
  const radius = Math.sqrt(area) / 2;
  for (const d of nodes) pos.set(d.id, previous.get(d.id) ?? { x: (rand() - 0.5) * radius, y: (rand() - 0.5) * radius });
  const fixed = new Set(nodes.filter((d) => previous.has(d.id)).map((d) => d.id));
  const ids = nodes.map((d) => d.id);
  const edges = links.filter((l) => pos.has(l.from) && pos.has(l.to) && l.from !== l.to);
  const iterations = fixed.size === n ? 0 : Math.min(400, 120 + n * 2);
  let t = radius / 4;
  for (let it = 0; it < iterations; it++) {
    const disp = new Map<string, Point>(ids.map((id) => [id, { x: 0, y: 0 }]));
    for (let i = 0; i < n; i++) {
      const a = pos.get(ids[i])!;
      for (let j = i + 1; j < n; j++) {
        const b = pos.get(ids[j])!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) {
          dx = rand() - 0.5;
          dy = rand() - 0.5;
          dist = 0.5;
        }
        const f = (k * k) / dist;
        const da = disp.get(ids[i])!;
        const db = disp.get(ids[j])!;
        da.x += (dx / dist) * f;
        da.y += (dy / dist) * f;
        db.x -= (dx / dist) * f;
        db.y -= (dy / dist) * f;
      }
    }
    for (const e of edges) {
      const a = pos.get(e.from)!;
      const b = pos.get(e.to)!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.max(0.01, Math.hypot(dx, dy));
      const f = (dist * dist) / k;
      const da = disp.get(e.from)!;
      const db = disp.get(e.to)!;
      da.x -= (dx / dist) * f;
      da.y -= (dy / dist) * f;
      db.x += (dx / dist) * f;
      db.y += (dy / dist) * f;
    }
    for (const id of ids) {
      if (fixed.has(id)) continue;
      const p = pos.get(id)!;
      const d = disp.get(id)!;
      // Gentle pull to the centre keeps disconnected pieces close.
      d.x -= p.x * 0.02 * k;
      d.y -= p.y * 0.02 * k;
      const len = Math.max(0.01, Math.hypot(d.x, d.y));
      p.x += (d.x / len) * Math.min(len, t);
      p.y += (d.y / len) * Math.min(len, t);
    }
    t = Math.max(1, t * 0.97);
  }
  return pos;
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

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={d} />
  </svg>
);

/**
 * A node-link graph on a canvas: a dotted grid you can drag to pan, zoom with
 * the controls, ctrl/⌘ + wheel, a pinch or the keyboard (+, −, 0 fits, arrows
 * pan). Nodes can be dragged to rearrange them. Labels appear as you zoom in;
 * the hovered or selected node and its neighbours always show theirs, and the
 * rest dims. Keyboard and screen-reader users also get a list of nodes and a
 * table of links.
 */
export function GraphChart({ nodes, links, kinds = {}, onNodeClick, selectedId, height = 420, label, showAllLabels, className }: GraphChartProps) {
  const version = useThemeVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const theme = useMemo(() => readChartTheme(), [version]);
  const gridId = `lm-graph-grid-${useId().replace(/:/g, "")}`;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const positions = useRef(new Map<string, Point>());
  const [pos, setPos] = useState(() => new Map<string, Point>());
  const [view, setView] = useState<View>({ x: 300, y: height / 2, k: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const needsFit = useRef(true);

  // Width follows the container.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(200, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lay out when the set of nodes or links changes; nodes already placed stay put.
  const structure = nodes.map((n) => n.id).join("\u0001") + "|" + links.map((l) => `${l.from}>${l.to}`).join("\u0001");
  useEffect(() => {
    const keep = new Map([...positions.current].filter(([id]) => nodes.some((n) => n.id === id)));
    if (keep.size === 0) needsFit.current = true;
    positions.current = layoutGraph(nodes, links, keep);
    setPos(new Map(positions.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure]);

  const fit = useCallback(() => {
    const pts = [...positions.current.values()];
    if (!pts.length) return setView({ x: width / 2, y: height / 2, k: 1 });
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const pad = 64;
    const k = clamp(Math.min((width - pad * 2) / Math.max(1, x1 - x0), (height - pad * 2) / Math.max(1, y1 - y0)), MIN_ZOOM, 1.5);
    setView({ k, x: width / 2 - ((x0 + x1) / 2) * k, y: height / 2 - ((y0 + y1) / 2) * k });
  }, [width, height]);

  useEffect(() => {
    if (needsFit.current && pos.size) {
      fit();
      needsFit.current = false;
    }
  }, [pos, fit]);

  const zoomAt = useCallback(
    (factor: number, cx = width / 2, cy = height / 2) =>
      setView((v) => {
        const k = clamp(v.k * factor, MIN_ZOOM, MAX_ZOOM);
        const f = k / v.k;
        return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
      }),
    [width, height],
  );

  // ---- Pointer: drag the canvas to pan, drag a node to move it, pinch to zoom ----
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ kind: "pan" | "node" | "pinch"; id?: string; start: Point; view: View; moved: boolean; dist?: number } | null>(null);
  const local = (e: { clientX: number; clientY: number }): Point => {
    const r = surfaceRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if ((e.target as Element).closest(".lm-graph__controls")) return;
    surfaceRef.current?.setPointerCapture?.(e.pointerId);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { kind: "pinch", start: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, view, moved: true, dist: Math.hypot(a.x - b.x, a.y - b.y) };
      return;
    }
    const nodeId = (e.target as Element).closest("[data-node]")?.getAttribute("data-node") ?? undefined;
    gesture.current = { kind: nodeId ? "node" : "pan", id: nodeId, start: p, view, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (g.kind === "pinch") {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const k = clamp(g.view.k * (Math.hypot(a.x - b.x, a.y - b.y) / (g.dist || 1)), MIN_ZOOM, MAX_ZOOM);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const f = k / g.view.k;
      setView({ k, x: mid.x - (g.start.x - g.view.x) * f, y: mid.y - (g.start.y - g.view.y) * f });
      return;
    }
    const dx = p.x - g.start.x;
    const dy = p.y - g.start.y;
    if (!g.moved && Math.hypot(dx, dy) < 4) return;
    g.moved = true;
    if (g.kind === "pan") {
      setPanning(true);
      setView({ ...g.view, x: g.view.x + dx, y: g.view.y + dy });
    } else if (g.id) {
      positions.current.set(g.id, { x: (p.x - view.x) / view.k, y: (p.y - view.y) / view.k });
      setPos(new Map(positions.current));
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g?.kind === "node" && !g.moved && g.id) onNodeClick?.(g.id);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setPanning(false);
    } else if (g?.kind === "pinch") {
      // One finger left: carry on as a pan from here.
      const [rest] = [...pointers.current.values()];
      gesture.current = { kind: "pan", start: rest, view, moved: true };
    }
  };

  // Plain wheel scrolls the page; ctrl/⌘ + wheel (and trackpad pinch) zooms.
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const p = local(e);
    zoomAt(Math.exp(-e.deltaY * 0.01), p.x, p.y);
  };
  // React's wheel listener is passive: register a real one so the page doesn't zoom too.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const stop = (e: globalThis.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const step = 60;
    const act: Record<string, () => void> = {
      "+": () => zoomAt(1.25),
      "=": () => zoomAt(1.25),
      "-": () => zoomAt(0.8),
      "0": fit,
      ArrowLeft: () => setView((v) => ({ ...v, x: v.x + step })),
      ArrowRight: () => setView((v) => ({ ...v, x: v.x - step })),
      ArrowUp: () => setView((v) => ({ ...v, y: v.y + step })),
      ArrowDown: () => setView((v) => ({ ...v, y: v.y - step })),
    };
    if (act[e.key]) {
      e.preventDefault();
      act[e.key]();
    }
  };

  // ---- Drawing ----
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const focus = hover ?? selectedId ?? null;
  const neighbours = useMemo(() => {
    const s = new Set<string>();
    if (!focus) return s;
    s.add(focus);
    for (const l of links) {
      if (l.from === focus) s.add(l.to);
      if (l.to === focus) s.add(l.from);
    }
    return s;
  }, [focus, links]);
  const colorOf = (n: GraphNode) => theme.colors[(kinds[n.kind ?? ""]?.color ?? 0) % theme.colors.length];
  const radiusOf = (n: GraphNode) => kinds[n.kind ?? ""]?.size ?? 9;
  const allLabels = showAllLabels || nodes.length <= 25 || view.k >= 1.1;
  const allLinkLabels = showAllLabels || links.length <= 20 || view.k >= 1.4;
  // Text and strokes shrink a little as you zoom in, so they stay readable at any zoom.
  const s = 1 / Math.sqrt(view.k);
  // Nodes shrink less than the canvas when zoomed out, so they stay easy to see and hit.
  const ns = view.k < 1 ? Math.min(3, Math.pow(view.k, -0.75)) : 1;
  const legend = Object.entries(kinds).filter(([k]) => nodes.some((n) => n.kind === k));

  return (
    <div className={cx("lm-graph", className)}>
      <div
        ref={surfaceRef}
        className={cx("lm-graph__canvas", panning && "lm-graph__canvas--panning")}
        style={{ height }}
        role="application"
        aria-roledescription="graph canvas"
        aria-label={`${label}: ${nodes.length} nodes, ${links.length} links. Drag to pan; plus and minus zoom, 0 fits, arrow keys move. The node list below has the same content.`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        <svg width={width} height={height} aria-hidden="true" style={{ fontFamily: theme.fontFamily }}>
          <defs>
            <pattern id={gridId} width={GRID * view.k} height={GRID * view.k} patternUnits="userSpaceOnUse" x={view.x % (GRID * view.k)} y={view.y % (GRID * view.k)}>
              <circle cx={1} cy={1} r={view.k < 0.5 ? 0.6 : 1} className="lm-graph__dot" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill={`url(#${gridId})`} />
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {links.map((l, i) => {
              const a = pos.get(l.from);
              const b = pos.get(l.to);
              if (!a || !b) return null;
              const active = focus !== null && (l.from === focus || l.to === focus);
              const dim = focus !== null && !active;
              return (
                <g key={i} className={cx("lm-graph__link", dim && "lm-graph__link--dim", active && "lm-graph__link--active")}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={(active ? 2 : 1.5) * s} strokeDasharray={l.dashed ? `${5 * s} ${4 * s}` : undefined} />
                  {l.label && (allLinkLabels || active) && (
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4 * s} textAnchor="middle" fontSize={10 * s} className="lm-graph__link-label">
                      {l.label}
                    </text>
                  )}
                </g>
              );
            })}
            {nodes.map((n) => {
              const p = pos.get(n.id);
              if (!p) return null;
              const r = radiusOf(n) * ns;
              const selected = n.id === selectedId;
              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  className={cx("lm-graph__node", focus !== null && !neighbours.has(n.id) && "lm-graph__node--dim", n.pending && "lm-graph__node--pending", selected && "lm-graph__node--selected")}
                  transform={`translate(${p.x},${p.y})`}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover((h) => (h === n.id ? null : h))}
                >
                  <title>{`${n.label}${kinds[n.kind ?? ""] ? ` · ${kinds[n.kind ?? ""].label}` : ""}${n.pending ? " · pending" : ""}${n.description ? `\n${n.description}` : ""}`}</title>
                  <circle r={r + 8 * ns} className="lm-graph__hit" />
                  <circle r={selected ? r + 3 * ns : r} fill={colorOf(n)} className="lm-graph__dot-node" strokeWidth={(selected ? 3 : n.pending ? 2 : 1.5) * ns} />
                  {(allLabels || neighbours.has(n.id)) && (
                    <text y={-(r + 6 * ns)} textAnchor="middle" fontSize={12 * Math.max(s, ns)} className="lm-graph__label">
                      {n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="lm-graph__controls" role="toolbar" aria-label="Canvas controls">
          <button type="button" onClick={() => zoomAt(1.25)} aria-label="Zoom in" title="Zoom in (+)" disabled={view.k >= MAX_ZOOM}>
            <Icon d="M8 3v10M3 8h10" />
          </button>
          <button type="button" onClick={() => zoomAt(0.8)} aria-label="Zoom out" title="Zoom out (−)" disabled={view.k <= MIN_ZOOM}>
            <Icon d="M3 8h10" />
          </button>
          <button type="button" onClick={fit} aria-label="Fit to view" title="Fit to view (0)">
            <Icon d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
          </button>
          <button type="button" onClick={() => setView((v) => ({ k: 1, x: v.x + (width / 2 - v.x) * (1 - 1 / v.k), y: v.y + (height / 2 - v.y) * (1 - 1 / v.k) }))} aria-label="Zoom to 100%" title="Zoom to 100%">
            <span className="lm-graph__zoom">{Math.round(view.k * 100)}%</span>
          </button>
        </div>
        {nodes.length === 0 && <p className="lm-graph__empty">Nothing to show.</p>}
      </div>
      {legend.length > 1 && (
        <ul className="lm-graph__legend" aria-label="Node types">
          {legend.map(([k, v]) => (
            <li key={k}>
              <span className="lm-graph__swatch" style={{ background: theme.colors[(v.color ?? 0) % theme.colors.length] }} aria-hidden="true" />
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
