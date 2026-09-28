import { cx } from "../utils";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const initials = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

// Stable hue per name so avatars are distinguishable.
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

/** A person or agent: image, or initials on a colour derived from the name. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cx("lm-avatar", `lm-avatar--${size}`, className)}
      style={src ? undefined : { ["--lm-avatar-hue" as string]: hue(name) }}
      title={name}
      role="img"
      aria-label={name}
    >
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}
