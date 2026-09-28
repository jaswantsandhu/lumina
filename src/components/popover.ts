import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

// Positions a popup (menu, listbox) next to its anchor in a portal, so scroll
// containers and overflow never clip it. The popup is fixed-positioned, flips
// above the anchor when there isn't room below, stays inside the viewport, and
// follows the anchor on scroll and resize.
//
// Portal target: document.body, or the nearest open <dialog> (modal dialogs are
// in the top layer; anything outside them would render underneath).

export function portalTarget(anchor: Element | null): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return (anchor?.closest("dialog") as HTMLElement | null) ?? document.body;
}

// A transformed/filtered ancestor becomes the containing block for fixed children.
function containingOffset(target: HTMLElement): { x: number; y: number } {
  if (target === document.body) return { x: 0, y: 0 };
  const cs = getComputedStyle(target);
  if (cs.transform === "none" && cs.filter === "none" && !/paint|layout|strict|content/.test(cs.contain)) return { x: 0, y: 0 };
  const r = target.getBoundingClientRect();
  return { x: r.left, y: r.top };
}

export function usePopover(
  open: boolean,
  anchor: RefObject<HTMLElement | null>,
  popup: RefObject<HTMLElement | null>,
  o: { align?: "start" | "end"; matchWidth?: boolean; gap?: number } = {},
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden", top: 0, left: 0 });
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const place = () => {
      const a = anchor.current;
      const p = popup.current;
      if (!a || !p) return;
      const r = a.getBoundingClientRect();
      const gap = o.gap ?? 4;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const width = o.matchWidth ? r.width : p.offsetWidth;
      const height = p.offsetHeight;
      const below = vh - r.bottom - gap;
      const above = r.top - gap;
      const up = height > below && above > below;
      let left = o.align === "end" ? r.right - width : r.left;
      left = Math.max(8, Math.min(left, vw - width - 8));
      const top = up ? Math.max(8, r.top - gap - height) : Math.min(r.bottom + gap, Math.max(8, vh - height - 8));
      const off = containingOffset(portalTarget(a) ?? document.body);
      setStyle({
        position: "fixed",
        top: top - off.y,
        left: left - off.x,
        ...(o.matchWidth ? { width } : {}),
        maxHeight: Math.max(120, (up ? above : below) - 8),
        visibility: "visible",
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    addEventListener("scroll", schedule, true);
    addEventListener("resize", schedule);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (popup.current) ro?.observe(popup.current);
    if (anchor.current) ro?.observe(anchor.current);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule, true);
      removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [open, o.align, o.matchWidth, o.gap]);
  return style;
}
