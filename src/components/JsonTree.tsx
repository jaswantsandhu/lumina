import { useId, useState } from "react";
import { cx } from "../utils";

/** JSON-compatible data; pass parsed JSON, not cyclic JavaScript objects. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export interface JsonTreeProps {
  /** Parsed JSON value to inspect. */
  value: JsonValue;
  /** Accessible region name. */
  label?: string;
  /** Number of initially expanded levels; defaults to one. */
  defaultExpandedDepth?: number;
  /** Additional root class. */
  className?: string;
}

function JsonBranch({ value, name, depth, expandedDepth }: { value: JsonValue; name: string; depth: number; expandedDepth: number }) {
  const [open, setOpen] = useState(depth < expandedDepth);
  const id = useId();
  const container = value !== null && typeof value === "object";
  const array = Array.isArray(value);
  const entries = container ? Object.entries(value) : [];
  const summary = container ? entries.length ? `${array ? "Array" : "Object"} (${entries.length})` : array ? "[]" : "{}" : JSON.stringify(value);
  return <li className="lm-jsontree__node">
    {entries.length ? <><button type="button" className="lm-jsontree__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? "v" : ">"} </span>{name}: {summary}</button><ul id={id} className="lm-jsontree__children" hidden={!open}>{open && entries.map(([key, child]) => <JsonBranch key={key} name={array ? `[${key}]` : JSON.stringify(key)} value={child} depth={depth + 1} expandedDepth={expandedDepth} />)}</ul></> : <span className={cx("lm-jsontree__value", `lm-jsontree__value--${value === null ? "null" : typeof value}`)}>{name}: {summary}</span>}
  </li>;
}

/** Lazy collapsible JSON inspector with native disclosure buttons and explicit empty/null values. */
export function JsonTree({ value, label = "JSON", defaultExpandedDepth = 1, className }: JsonTreeProps) {
  return <div role="region" aria-label={label} className={cx("lm-jsontree", className)}><ul className="lm-jsontree__root"><JsonBranch value={value} name={label} depth={0} expandedDepth={defaultExpandedDepth} /></ul></div>;
}
