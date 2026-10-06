import { useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Checkbox } from "./Checkbox";
import { Progress } from "./Progress";

export interface ChecklistItem {
  id: string;
  title: ReactNode;
  /** Details shown under the title: instructions, code, links. */
  content?: ReactNode;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  /** Ids of the ticked items (controlled). Leave out to let the checklist keep its own state. */
  checked?: string[];
  onToggle?: (id: string, checked: boolean) => void;
  /** Name for the progress bar and the list, e.g. "Lab progress". */
  label?: string;
  /** Show a progress bar above the list (default true). */
  progress?: boolean;
  /** Prefix titles with "Step 1:", "Step 2:"… (default true). */
  numbered?: boolean;
  className?: string;
}

/** Tickable steps with progress: labs, onboarding, release checklists. */
export function Checklist({ items, checked, onToggle, label = "Progress", progress = true, numbered = true, className }: ChecklistProps) {
  const [own, setOwn] = useState<string[]>([]);
  const ticked = new Set(checked ?? own);
  const done = items.filter((i) => ticked.has(i.id)).length;

  const toggle = (id: string) => {
    const now = !ticked.has(id);
    if (checked === undefined) setOwn((prev) => (now ? [...prev, id] : prev.filter((x) => x !== id)));
    onToggle?.(id, now);
  };

  return (
    <div className={cx("lm-checklist", className)}>
      {progress && <Progress value={done} max={items.length || 1} label={label} valueText={`${done} of ${items.length} done`} thresholds={null} />}
      <ol className="lm-checklist__items" aria-label={label}>
        {items.map((item, i) => {
          const on = ticked.has(item.id);
          return (
            <li key={item.id} className={cx("lm-checklist__item", on && "lm-checklist__item--done")}>
              <Checkbox
                checked={on}
                onChange={() => toggle(item.id)}
                label={
                  <span className="lm-checklist__title">
                    {numbered && `Step ${i + 1}: `}
                    {item.title}
                  </span>
                }
              />
              {item.content && <div className="lm-checklist__content">{item.content}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
