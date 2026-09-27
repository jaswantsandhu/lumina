import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../utils";

type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Column (default) or row. */
  direction?: "column" | "row";
  /** Gap on the spacing scale (space tokens). */
  gap?: Space;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
}

/** Lays out children in a column or row with a token-based gap. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = "column", gap = "3", align, justify, wrap, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("lm-stack", className)}
      style={{
        flexDirection: direction,
        gap: `var(--lm-space-${gap})`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    />
  );
});
