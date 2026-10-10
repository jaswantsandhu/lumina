import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils";

export interface TreeViewNode {
  /** Unique identifier across the entire tree. */
  id: string;
  /** Visible node content; do not include interactive elements. */
  label: ReactNode;
  /** Accessible name when label is not plain text. */
  ariaLabel?: string;
  /** Child nodes; empty arrays are leaves. */
  children?: readonly TreeViewNode[];
}
export interface TreeViewProps {
  /** Hierarchical nodes with globally unique IDs. */
  nodes: readonly TreeViewNode[];
  /** Accessible tree name. */
  label: string;
  /** Controlled expanded node IDs. */
  expandedIds?: readonly string[];
  /** Initially expanded IDs for uncontrolled usage. */
  defaultExpandedIds?: readonly string[];
  /** Called with the next expanded IDs. */
  onExpandedChange?: (ids: string[]) => void;
  /** Controlled selected ID; null clears selection. */
  selectedId?: string | null;
  /** Initial uncontrolled selection. */
  defaultSelectedId?: string;
  /** Called on click, Enter, or Space; navigation alone does not select. */
  onSelect?: (id: string) => void;
  /** Additional root class. */
  className?: string;
}

/** Single-select tree with roving focus and standard arrow/Home/End navigation. */
export function TreeView({ nodes, label, expandedIds, defaultExpandedIds = [], onExpandedChange, selectedId, defaultSelectedId, onSelect, className }: TreeViewProps) {
  const [innerExpanded, setExpanded] = useState<readonly string[]>(defaultExpandedIds);
  const [innerSelected, setSelected] = useState<string | undefined>(defaultSelectedId);
  const [focused, setFocused] = useState<string>();
  const refs = useRef(new Map<string, HTMLDivElement>());
  const restoreFocus = useRef(false);
  const expanded = new Set(expandedIds ?? innerExpanded);
  const selected = selectedId !== undefined ? selectedId : innerSelected;
  const visible: { node: TreeViewNode; level: number; parent?: string; pos: number; size: number }[] = [];
  const visit = (items: readonly TreeViewNode[], level: number, parent?: string) => {
    items.forEach((node, index) => {
      visible.push({ node, level, parent, pos: index + 1, size: items.length });
      if (expanded.has(node.id) && node.children?.length) visit(node.children, level + 1, node.id);
    });
  };
  visit(nodes, 1);
  const active = visible.some(item => item.node.id === focused) ? focused : visible[0]?.node.id;
  useLayoutEffect(() => {
    if (restoreFocus.current && document.activeElement === document.body && active) refs.current.get(active)?.focus();
    restoreFocus.current = false;
  });
  const focus = (id: string | undefined) => { if (id) { setFocused(id); refs.current.get(id)?.focus(); } };
  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    if (expandedIds === undefined) setExpanded([...next]);
    onExpandedChange?.([...next]);
  };
  const select = (id: string) => { if (selectedId === undefined) setSelected(id); onSelect?.(id); };
  return <div role="tree" aria-label={label} className={cx("lm-treeview", className)}>
    {visible.map(({ node, level, parent, pos, size }, index) => <div key={node.id} ref={element => {
      if (element) refs.current.set(node.id, element);
      else {
        if (document.activeElement === refs.current.get(node.id)) restoreFocus.current = true;
        refs.current.delete(node.id);
      }
    }}
      role="treeitem" aria-label={node.ariaLabel} aria-level={level} aria-posinset={pos} aria-setsize={size} aria-selected={selected === node.id}
      aria-expanded={node.children?.length ? expanded.has(node.id) : undefined} tabIndex={active === node.id ? 0 : -1}
      className="lm-treeview__item" style={{ paddingInlineStart: `calc(var(--lm-space-3) + ${level - 1} * var(--lm-space-5))` }}
      onFocus={() => setFocused(node.id)} onClick={() => { focus(node.id); select(node.id); }} onKeyDown={event => {
        if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "ArrowDown") focus(visible[Math.min(index + 1, visible.length - 1)]?.node.id);
        else if (event.key === "ArrowUp") focus(visible[Math.max(index - 1, 0)]?.node.id);
        else if (event.key === "Home") focus(visible[0]?.node.id);
        else if (event.key === "End") focus(visible[visible.length - 1]?.node.id);
        else if (event.key === "ArrowRight" && node.children?.length) { if (!expanded.has(node.id)) toggle(node.id); else focus(node.children[0].id); }
        else if (event.key === "ArrowLeft") { if (node.children?.length && expanded.has(node.id)) toggle(node.id); else focus(parent); }
        else if (event.key === "Enter" || event.key === " ") select(node.id);
      }}>
      <span className="lm-treeview__toggle" aria-hidden="true" onClick={event => { if (node.children?.length) { event.stopPropagation(); focus(node.id); toggle(node.id); } }}>{node.children?.length ? expanded.has(node.id) ? "v" : ">" : ""}</span>
      <span>{node.label}</span>
    </div>)}
  </div>;
}
