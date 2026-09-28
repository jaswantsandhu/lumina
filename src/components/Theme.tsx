import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
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

// Arrow keys move between the options of a radio group (and select them).
function radioKeys(values: string[], current: string, pick: (v: string) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const i = values.indexOf(current);
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? values[(i + 1) % values.length] : e.key === "ArrowLeft" || e.key === "ArrowUp" ? values[(i - 1 + values.length) % values.length] : null;
    if (!next) return;
    e.preventDefault();
    pick(next);
    (e.currentTarget.querySelector(`[data-value="${next}"]`) as HTMLElement | null)?.focus();
  };
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
    <div className={cx("lm-segmented", className)} role="radiogroup" aria-label="Theme" onKeyDown={radioKeys(options.map((o) => o.value), pref, (v) => setPref(v as ThemePreference))}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" data-value={o.value} tabIndex={pref === o.value ? 0 : -1} aria-checked={pref === o.value} className="lm-segmented__option" onClick={() => setPref(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Appearance: accent, density, corner radius ----------

export type Accent = "rose" | "indigo" | "emerald" | "amber" | "sky" | "violet" | "teal" | "slate";
export type Density = "compact" | "default" | "comfortable";
export type Radius = "sharp" | "default" | "round";
export interface Appearance {
  accent: Accent;
  density: Density;
  radius: Radius;
}

/** The accent themes, with the palette colour used for their swatch. */
export const ACCENTS: { value: Accent; label: string; swatch: string }[] = [
  { value: "rose", label: "Rose", swatch: "var(--lm-pink-700)" },
  { value: "indigo", label: "Indigo", swatch: "var(--lm-indigo-600)" },
  { value: "violet", label: "Violet", swatch: "var(--lm-violet-600)" },
  { value: "sky", label: "Sky", swatch: "var(--lm-sky-700)" },
  { value: "teal", label: "Teal", swatch: "var(--lm-teal-700)" },
  { value: "emerald", label: "Emerald", swatch: "var(--lm-green-700)" },
  { value: "amber", label: "Amber", swatch: "var(--lm-amber-700)" },
  { value: "slate", label: "Slate", swatch: "var(--lm-slate-700)" },
];
const APPEARANCE_KEY = "lumina.appearance";
const DEFAULT_APPEARANCE: Appearance = { accent: "rose", density: "default", radius: "default" };

/** Sets data-accent / data-density / data-radius on <html> (defaults remove the attribute). */
export function applyAppearance(a: Appearance, root: HTMLElement = document.documentElement) {
  const set = (name: string, value: string, def: string) => (value === def ? root.removeAttribute(name) : root.setAttribute(name, value));
  set("data-accent", a.accent, "rose");
  set("data-density", a.density, "default");
  set("data-radius", a.radius, "default");
}

function readAppearance(): Appearance {
  try {
    return { ...DEFAULT_APPEARANCE, ...JSON.parse(localStorage.getItem(APPEARANCE_KEY) ?? "{}") };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

/**
 * Reads and sets the accent, density and corner radius (stored in localStorage,
 * applied as attributes on <html>, so every Lumina component follows).
 */
export function useAppearance(): [Appearance, (patch: Partial<Appearance>) => void] {
  const [a, setA] = useState<Appearance>(readAppearance);
  useEffect(() => {
    applyAppearance(a);
  }, [a]);
  const update = useCallback((patch: Partial<Appearance>) => {
    setA((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);
  return [a, update];
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="lm-segmented" role="radiogroup" aria-label={label} onKeyDown={radioKeys(options.map((o) => o.value), value, (v) => onChange(v as T))}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" data-value={o.value} tabIndex={value === o.value ? 0 : -1} aria-checked={value === o.value} className="lm-segmented__option" onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Theme settings in one place: light/dark, accent, density and corner radius. */
export function ThemeCustomizer({ className }: { className?: string }) {
  const [a, set] = useAppearance();
  return (
    <div className={cx("lm-customizer", className)}>
      <div className="lm-customizer__row">
        <span className="lm-customizer__label">Mode</span>
        <ThemeToggle />
      </div>
      <div className="lm-customizer__row">
        <span className="lm-customizer__label" id="lm-accent-label">
          Accent
        </span>
        <div className="lm-swatches" role="radiogroup" aria-labelledby="lm-accent-label" onKeyDown={radioKeys(ACCENTS.map((x) => x.value), a.accent, (v) => set({ accent: v as Accent }))}>
          {ACCENTS.map((x) => (
            <button
              key={x.value}
              type="button"
              role="radio"
              data-value={x.value}
              tabIndex={a.accent === x.value ? 0 : -1}
              aria-checked={a.accent === x.value}
              aria-label={x.label}
              title={x.label}
              className="lm-swatch"
              style={{ background: x.swatch }}
              onClick={() => set({ accent: x.value })}
            />
          ))}
        </div>
      </div>
      <div className="lm-customizer__row">
        <span className="lm-customizer__label">Density</span>
        <Segmented label="Density" value={a.density} onChange={(density) => set({ density })} options={[{ value: "compact", label: "Compact" }, { value: "default", label: "Default" }, { value: "comfortable", label: "Comfortable" }]} />
      </div>
      <div className="lm-customizer__row">
        <span className="lm-customizer__label">Corners</span>
        <Segmented label="Corners" value={a.radius} onChange={(radius) => set({ radius })} options={[{ value: "sharp", label: "Sharp" }, { value: "default", label: "Default" }, { value: "round", label: "Round" }]} />
      </div>
    </div>
  );
}
