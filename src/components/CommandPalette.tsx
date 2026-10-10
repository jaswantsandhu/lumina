import { useEffect, useId, useRef, useState } from "react";
import { cx } from "../utils";
import { Dialog } from "./Dialog";

export interface CommandPaletteItem {
  /** Stable unique identifier. */
  id: string;
  label: string;
  description?: string;
  /** Items sharing this name appear under one heading. */
  group?: string;
  /** Additional searchable terms. */
  keywords?: string[];
  disabled?: boolean;
  /** Called before the palette requests dismissal. */
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  /** Escape, backdrop, close button and selection request dismissal. */
  onClose: () => void;
  items: CommandPaletteItem[];
  title?: string;
  placeholder?: string;
  emptyText?: string;
  /** Applied to the native dialog. */
  className?: string;
}

/** Searchable modal command list. Arrow keys/Home/End navigate; Enter runs a command.
 * The host owns opening and any shortcut registration; no global shortcut is installed.
 */
export function CommandPalette({ open, onClose, items, title = "Commands", placeholder = "Search commands", emptyText = "No commands found", className }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const filtered = items.filter(item => [item.label, item.description, item.group, ...(item.keywords ?? [])].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  const groups = Array.from(new Set(filtered.map(item => item.group ?? "")));
  const ordered = groups.flatMap(group => filtered.filter(item => (item.group ?? "") === group));
  const enabled = ordered.filter(item => !item.disabled);
  const active = enabled.find(item => item.id === activeId) ?? enabled[0];
  const optionId = (item: CommandPaletteItem) => `${id}-option-${items.indexOf(item)}`;
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveId(null);
      input.current?.focus();
    }
  }, [open]);
  useEffect(() => {
    if (open && active) document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
  }, [open, active?.id]);
  const select = (item: CommandPaletteItem) => {
    if (item.disabled) return;
    item.onSelect();
    onClose();
  };
  return <Dialog open={open} onClose={onClose} title={title} className={cx("lm-command-palette", className)}>
    <input ref={input} role="combobox" aria-label={placeholder} aria-expanded={open} aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={open && active ? optionId(active) : undefined} className="lm-command-palette__search" placeholder={placeholder} value={query}
      onChange={event => { setQuery(event.target.value); setActiveId(null); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        const index = active ? enabled.indexOf(active) : -1;
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : event.key === "ArrowDown" ? (index + 1) % enabled.length : (index - 1 + enabled.length) % enabled.length;
          setActiveId(enabled[next]?.id ?? null);
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (active) select(active);
        }
      }} />
    <div id={`${id}-list`} role="listbox" aria-label={title} className="lm-command-palette__list">
      {groups.map(group => <div key={group} role="group" aria-label={group || "Commands"}>
        {group && <div className="lm-command-palette__group" aria-hidden="true">{group}</div>}
        {ordered.filter(item => (item.group ?? "") === group).map(item => <div key={item.id} id={optionId(item)} role="option" aria-selected={item === active} aria-disabled={item.disabled || undefined} className={cx("lm-command-palette__item", item === active && "lm-command-palette__item--active")} onMouseDown={event => event.preventDefault()} onMouseEnter={() => { if (!item.disabled) setActiveId(item.id); }} onClick={() => select(item)}>
          <span>{item.label}</span>{item.description && <span className="lm-command-palette__description">{item.description}</span>}
        </div>)}
      </div>)}
    </div>
    {!filtered.length && <p role="status" className="lm-command-palette__empty">{emptyText}</p>}
  </Dialog>;
}
