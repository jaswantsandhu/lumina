import { cx } from "../utils";

/** One line in a source comparison; numbers are 1-based. */
export interface DiffLine {
  /** Whether the line is unchanged, removed, or added. */
  type: "equal" | "remove" | "add";
  /** Line text, including its terminating newline when present. */
  text: string;
  /** Original source line number, absent for additions. */
  oldLine?: number;
  /** Updated source line number, absent for removals. */
  newLine?: number;
}

/** Compare exact lines (including final newline). LCS is capped at one million cells;
 * larger changed regions become a replacement while shared prefix/suffix remain equal. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const b = after.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const result: DiffLine[] = [];
  let i = 0, j = 0;
  const emit = (type: DiffLine["type"]) => {
    if (type === "equal") result.push({ type, text: a[i], oldLine: ++i, newLine: ++j });
    else if (type === "remove") result.push({ type, text: a[i], oldLine: ++i });
    else result.push({ type, text: b[j], newLine: ++j });
  };
  while (i < a.length && j < b.length && a[i] === b[j]) emit("equal");
  let endA = a.length, endB = b.length;
  while (endA > i && endB > j && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const n = endA - i, m = endB - j;
  if ((n + 1) * (m + 1) <= 1_000_000) {
    const startA = i, startB = j, width = m + 1;
    const table = new Uint32Array((n + 1) * width);
    for (let x = n - 1; x >= 0; x--) {
      for (let y = m - 1; y >= 0; y--) {
        table[x * width + y] = a[startA + x] === b[startB + y]
          ? 1 + table[(x + 1) * width + y + 1]
          : Math.max(table[(x + 1) * width + y], table[x * width + y + 1]);
      }
    }
    while (i < endA && j < endB) {
      if (a[i] === b[j]) emit("equal");
      else if (table[(i - startA + 1) * width + j - startB] >= table[(i - startA) * width + j - startB + 1]) emit("remove");
      else emit("add");
    }
  }
  while (i < endA) emit("remove");
  while (j < endB) emit("add");
  while (i < a.length) emit("equal");
  return result;
}

export interface DiffViewProps {
  /** Original source text. */
  before: string;
  /** Updated source text. */
  after: string;
  /** Display layout; defaults to unified. */
  mode?: "unified" | "split";
  /** Accessible comparison title. */
  label?: string;
  /** Original column heading. */
  beforeLabel?: string;
  /** Updated column heading. */
  afterLabel?: string;
  /** Additional root class. */
  className?: string;
}

/** Scrollable line comparison with independent source line numbers and non-color change markers. */
export function DiffView({ before, after, mode = "unified", label = "Source comparison", beforeLabel = "Before", afterLabel = "After", className }: DiffViewProps) {
  const lines = diffLines(before, after);
  const rows: { left?: DiffLine; right?: DiffLine }[] = [];
  for (let i = 0; i < lines.length;) {
    if (lines[i].type === "equal") { rows.push({ left: lines[i], right: lines[i] }); i++; }
    else {
      const removed: DiffLine[] = [], added: DiffLine[] = [];
      while (i < lines.length && lines[i].type !== "equal") {
        (lines[i].type === "remove" ? removed : added).push(lines[i++]);
      }
      for (let k = 0; k < Math.max(removed.length, added.length); k++) rows.push({ left: removed[k], right: added[k] });
    }
  }
  const content = (line: DiffLine | undefined, side: "old" | "new") => <>
    <span className="lm-diffview__number">{side === "old" ? line?.oldLine : line?.newLine}</span>
    <code>{line ? `${line.type === "remove" ? "-" : line.type === "add" ? "+" : " "} ${line.text.replace(/\n$/, "")}` : ""}{line && !line.text.endsWith("\n") && <span className="lm-diffview__ending"> (no newline)</span>}</code>
  </>;
  return <div className={cx("lm-diffview", `lm-diffview--${mode}`, className)} role="region" aria-label={label} tabIndex={0}>
    <table className="lm-diffview__table"><caption>{label}</caption>
      <thead><tr>{mode === "split" ? <><th scope="col">{beforeLabel}</th><th scope="col">{afterLabel}</th></> : <th scope="col">{beforeLabel} / {afterLabel}</th>}</tr></thead>
      <tbody>{mode === "split" ? rows.map((row, i) => <tr key={i}>{(["left", "right"] as const).map(side => <td key={side} className={cx("lm-diffview__cell", row[side] && `lm-diffview__cell--${row[side]!.type}`)}>{content(row[side], side === "left" ? "old" : "new")}</td>)}</tr>) : lines.map((line, i) => <tr key={i}><td className={cx("lm-diffview__cell", `lm-diffview__cell--${line.type}`)}><span className="lm-diffview__number">{line.oldLine}</span>{content(line, "new")}</td></tr>)}</tbody>
    </table>
  </div>;
}
