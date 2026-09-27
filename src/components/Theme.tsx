import { useCallback, useEffect, useState } from "react";
import { cx } from "../utils";

export type ThemePreference = "light" | "dark" | "system";
const KEY = "lumina.theme";

function apply(pref: ThemePreference) {
  const root = document.documentElement;
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

/** Reads and sets the theme (stored in localStorage; "system" follows the OS). */
export function useTheme(): [ThemePreference, (pref: ThemePreference) => void] {
  const [pref, setPref] = useState<ThemePreference>(() => {
    try {
      return (localStorage.getItem(KEY) as ThemePreference) || "system";
    } catch {
      return "system";
    }
  });
  useEffect(() => {
    apply(pref);
  }, [pref]);
  const set = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
    setPref(next);
  }, []);
  return [pref, set];
}

/** A compact light / dark / system switcher. */
export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useTheme();
  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Auto" },
  ];
  return (
    <div className={cx("lm-segmented", className)} role="radiogroup" aria-label="Theme">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={pref === o.value} className="lm-segmented__option" onClick={() => setPref(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
