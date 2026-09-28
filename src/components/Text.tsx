import { type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Tone = "default" | "muted" | "subtle" | "accent" | "success" | "warning" | "danger";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: Size;
  tone?: Tone;
  weight?: "regular" | "medium" | "semibold" | "bold";
  mono?: boolean;
  /** Truncate to one line with an ellipsis. */
  truncate?: boolean;
  children?: ReactNode;
}

/** Body text on the type scale, with semantic tones. */
export function Text({ as: As = "p", size = "md", tone = "default", weight, mono, truncate, className, ...rest }: TextProps) {
  return (
    <As
      className={cx(
        "lm-text",
        `lm-text--${size}`,
        tone !== "default" && `lm-text--${tone}`,
        weight && `lm-text--${weight}`,
        mono && "lm-text--mono",
        truncate && "lm-text--truncate",
        className,
      )}
      {...rest}
    />
  );
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (h1–h4). */
  level?: 1 | 2 | 3 | 4;
  /** Visual size; defaults from the level. */
  size?: "sm" | "md" | "lg" | "xl";
}

const defaultSize = { 1: "xl", 2: "lg", 3: "md", 4: "sm" } as const;

/** Headings: semantic level and visual size are independent. */
export function Heading({ level = 2, size, className, ...rest }: HeadingProps) {
  const H = `h${level}` as "h1";
  return <H className={cx("lm-heading", `lm-heading--${size ?? defaultSize[level]}`, className)} {...rest} />;
}

/** Inline code. */
export function Code({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <code className={cx("lm-code", className)} {...rest} />;
}

/** A keyboard key, e.g. <Kbd>⌘K</Kbd>. */
export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cx("lm-kbd", className)} {...rest} />;
}

/** A horizontal or vertical rule. */
export function Divider({ vertical, className, ...rest }: HTMLAttributes<HTMLHRElement> & { vertical?: boolean }) {
  return <hr className={cx("lm-divider", vertical && "lm-divider--vertical", className)} {...rest} />;
}
