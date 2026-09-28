import { type ReactNode } from "react";
import { cx } from "../utils";

export interface SplitViewProps {
  /** The list (left pane). */
  list: ReactNode;
  /** The selected item (right pane). */
  children: ReactNode;
  /**
   * On phones only one pane fits: true shows the detail (with `onBack` offered as
   * a back link), false shows the list. Desktop always shows both.
   */
  showDetail: boolean;
  onBack?: () => void;
  /** Text of the phone back link, e.g. "All tasks". */
  backLabel?: ReactNode;
  /** Let the detail pane manage its own scrolling and padding (e.g. a chat). */
  flushDetail?: boolean;
  listLabel?: string;
  className?: string;
}

/** List and detail side by side; on phones, one at a time with a back link. */
export function SplitView({ list, children, showDetail, onBack, backLabel = "Back", flushDetail, listLabel, className }: SplitViewProps) {
  return (
    <div className={cx("lm-split", showDetail && "lm-split--detail", className)}>
      <div className="lm-split__list" role="region" aria-label={listLabel}>
        {list}
      </div>
      <div className={cx("lm-split__detail", flushDetail && "lm-split__detail--flush")}>
        {onBack && (
          <button type="button" className="lm-split__back" onClick={onBack}>
            <span aria-hidden="true">←</span> {backLabel}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
