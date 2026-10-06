import { useEffect, useId, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { CodeView } from "./CodeView";

/** Code shown under a diagram; each step can highlight lines with `lines`. */
export interface DiagramCode {
  code: string;
  language?: string;
  title?: string;
}

export interface Stepper {
  index: number;
  playing: boolean;
  go: (i: number) => void;
  toggle: () => void;
}

/** Step state shared by the diagrams: Back / Next / Play, auto-advancing every `interval` ms while playing. */
export function useStepper(count: number, interval = 2200): Stepper {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = Math.max(0, count - 1);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (index >= last) setPlaying(false);
      else setIndex(index + 1);
    }, interval);
    return () => {
      clearTimeout(t);
    };
  }, [playing, index, last, interval]);

  useEffect(() => {
    if (index > last) setIndex(last);
  }, [index, last]);

  return {
    index: Math.min(index, last),
    playing,
    go: (i: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(last, i)));
    },
    toggle: () => {
      if (!playing && index >= last) setIndex(0);
      setPlaying(!playing);
    },
  };
}

/** Caption + controls under a diagram. The caption is announced to screen readers as the step changes. */
export function StepControls({ stepper, count, caption }: { stepper: Stepper; count: number; caption: ReactNode }) {
  const { index, playing, go, toggle } = stepper;
  const last = count - 1;
  return (
    <>
      <p className="lm-diagram__caption" aria-live="polite">
        {count > 1 && (
          <strong>
            {index + 1}/{count}.{" "}
          </strong>
        )}
        {caption}
      </p>
      {count > 1 && (
        <div className="lm-diagram__controls">
          <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => go(index - 1)}>
            ← Back
          </Button>
          <Button size="sm" disabled={index === last} onClick={() => go(index + 1)}>
            Next →
          </Button>
          <Button size="sm" variant="ghost" onClick={toggle}>
            {playing ? "Pause" : index === last ? "Replay" : "Play"}
          </Button>
        </div>
      )}
    </>
  );
}

export function DiagramCodePanel({ code, lines }: { code?: DiagramCode; lines?: number[] }) {
  if (!code) return null;
  return <CodeView code={code.code} language={code.language} title={code.title} highlightLines={lines ?? []} maxHeight="24rem" />;
}

/** An id that's safe inside url(#…) references (React's useId contains colons). */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Rough text width in SVG units, for sizing boxes to their labels. */
export function textWidth(text: string | undefined, mono = false) {
  return (text ?? "").length * (mono ? 6.8 : 7.6);
}

/** Merge per-step values (step 0..index), so a value set at one step stays until a later step changes it. */
export function valuesAt<T>(steps: { values?: Record<string, T> }[], index: number) {
  const now: Record<string, T> = {};
  for (const s of steps.slice(0, index + 1)) Object.assign(now, s.values ?? {});
  return { now, changed: new Set(Object.keys(steps[index]?.values ?? {})) };
}
