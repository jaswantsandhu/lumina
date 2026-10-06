// A small layered ("Sugiyama-lite") layout for StepDiagram nodes that have no x/y:
// rank nodes along the edges, order each rank to reduce crossings, then space ranks to fit labels.

export interface LayoutNode {
  id: string;
  w: number;
  h: number;
}
export interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const MARGIN = 24;

/** Positions (centres) for every node, the canvas size, and which edges point backwards (cycles). */
export function layeredLayout(nodes: LayoutNode[], edges: LayoutEdge[], direction: "LR" | "TB" = "LR") {
  const ids = nodes.map((n) => n.id);
  const known = new Set(ids);
  const valid = edges.filter((e) => known.has(e.from) && known.has(e.to) && e.from !== e.to);

  // 1. Find back edges with a DFS so cycles (agent loops, retries) don't break the ranking.
  const out = new Map(ids.map((id) => [id, [] as LayoutEdge[]]));
  for (const e of valid) out.get(e.from)!.push(e);
  const state = new Map<string, 0 | 1 | 2>();
  const back = new Set<string>();
  const visit = (id: string) => {
    state.set(id, 1);
    for (const e of out.get(id)!) {
      const s = state.get(e.to) ?? 0;
      if (s === 1) back.add(e.id);
      else if (s === 0) visit(e.to);
    }
    state.set(id, 2);
  };
  for (const id of ids) if (!state.get(id)) visit(id);
  const forward = valid.filter((e) => !back.has(e.id));

  // 2. Rank = longest path from a source.
  const rank = new Map(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let moved = false;
    for (const e of forward) {
      const r = rank.get(e.from)! + 1;
      if (r > rank.get(e.to)!) {
        rank.set(e.to, r);
        moved = true;
      }
    }
    if (!moved) break;
  }
  const ranks: string[][] = [];
  for (const id of ids) (ranks[rank.get(id)!] ??= []).push(id);

  // 3. Order within ranks by the average position of neighbours (two sweeps).
  const pos = new Map<string, number>();
  ranks.forEach((r) => r.forEach((id, i) => pos.set(id, i)));
  const neighbours = (id: string, dir: "in" | "out") =>
    forward.filter((e) => (dir === "in" ? e.to === id : e.from === id)).map((e) => (dir === "in" ? e.from : e.to));
  const sweep = (dir: "in" | "out", order: string[][]) => {
    for (const r of order) {
      const score = (id: string) => {
        const ns = neighbours(id, dir);
        return ns.length ? ns.reduce((a, n) => a + pos.get(n)!, 0) / ns.length : pos.get(id)!;
      };
      r.sort((a, b) => score(a) - score(b));
      r.forEach((id, i) => pos.set(id, i));
    }
  };
  sweep("in", ranks.slice(1));
  sweep("out", ranks.slice(0, -1).reverse());

  // 4. Coordinates. Across the flow, each node lines up with the average of the nodes feeding it (so chains are
  // straight lines), then overlaps are pushed apart. Along the flow, gaps leave room for the longest edge label.
  const size = new Map(nodes.map((n) => [n.id, n]));
  const along = (id: string) => (direction === "LR" ? size.get(id)!.w : size.get(id)!.h);
  const across = (id: string) => (direction === "LR" ? size.get(id)!.h : size.get(id)!.w);
  const gapAcross = direction === "LR" ? 32 : 44;
  const labelRoom = (from: number) =>
    Math.max(0, ...valid.filter((e) => e.label && rank.get(e.from) === from).map((e) => (direction === "LR" ? e.label!.length * 6.8 : 22)));
  const gapAlong = (ri: number) => Math.max(direction === "LR" ? 80 : 64, labelRoom(ri) + 44);

  const acrossPos = new Map<string, number>();
  ranks.forEach((r, ri) => {
    const desired = r.map((id, i) => {
      const preds = forward.filter((e) => e.to === id && acrossPos.has(e.from)).map((e) => acrossPos.get(e.from)!);
      return { id, want: preds.length ? preds.reduce((a, b) => a + b, 0) / preds.length : ri === 0 ? -1 : Infinity, i };
    });
    // Keep the crossing-reducing order from step 3 as a tie-breaker.
    desired.sort((a, b) => a.want - b.want || a.i - b.i);
    let end = -Infinity;
    for (const d of desired) {
      const half = across(d.id) / 2;
      const want = Number.isFinite(d.want) && d.want >= 0 ? d.want : end === -Infinity ? half : end + gapAcross + half;
      const c = Math.max(want, end === -Infinity ? half : end + gapAcross + half);
      acrossPos.set(d.id, c);
      end = c + half;
    }
  });
  const minAcross = Math.min(...ids.map((id) => acrossPos.get(id)! - across(id) / 2));
  const breadth = Math.max(...ids.map((id) => acrossPos.get(id)! + across(id) / 2)) - minAcross;

  const centre = new Map<string, { x: number; y: number }>();
  let cursor = MARGIN;
  const rankSize = ranks.map((r) => Math.max(...r.map(along)));
  ranks.forEach((r, ri) => {
    const mid = cursor + rankSize[ri] / 2;
    for (const id of r) {
      const p = acrossPos.get(id)! - minAcross + MARGIN;
      centre.set(id, direction === "LR" ? { x: mid, y: p } : { x: p, y: mid });
    }
    cursor += rankSize[ri] + (ri < ranks.length - 1 ? gapAlong(ri) : 0);
  });
  const length = cursor + MARGIN;
  const width = direction === "LR" ? length : breadth + MARGIN * 2;
  const height = direction === "LR" ? breadth + MARGIN * 2 : length;
  return { centre, width, height, back };
}
