import { type ReactNode } from "react";
import { cx } from "../utils";
import { DiagramCodePanel, StepControls, textWidth, useStepper, useSvgId, valuesAt, type DiagramCode } from "./diagramShared";

export interface SequenceParticipant {
  id: string;
  label: string;
  sub?: string;
}

export interface SequenceMessage {
  id: string;
  from: string;
  /** The same as `from` draws a self-call (a small loop). */
  to: string;
  label: string;
  /** A reply: dashed line. */
  reply?: boolean;
}

export interface SequenceStep {
  caption: ReactNode;
  /** Message ids revealed at this step (they stay). If no step uses `show`, every message is visible. */
  show?: string[];
  /** Message or participant ids highlighted at this step. */
  active?: string[];
  /** A participant's state from this step on, shown under its name: { memory: "balance = 101" }. Changes flash. */
  values?: Record<string, string>;
  /** Lines to highlight in `code` (1-based). */
  lines?: number[];
}

export interface SequenceDiagramProps {
  title?: string;
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  /** Leave out for one step per message, captioned with the message label. */
  steps?: SequenceStep[];
  code?: DiagramCode;
  interval?: number;
  className?: string;
}

const HEAD_TOP = 16;
const ROW = 50;

/**
 * Who talks to whom, in order: participants across the top, time going down. Step through the messages,
 * and show each participant's changing state (e.g. a shared balance two threads overwrite).
 */
export function SequenceDiagram({ title, participants, messages, steps, code, interval, className }: SequenceDiagramProps) {
  const allSteps: SequenceStep[] =
    steps ?? messages.map((m) => ({ caption: `${label(participants, m.from)} → ${label(participants, m.to)}: ${m.label}`, show: [m.id], active: [m.id] }));
  const stepper = useStepper(allSteps.length, interval);
  const arrow = useSvgId("lm-seq");
  const step = allSteps[stepper.index] ?? { caption: "" };
  const { now: values, changed } = valuesAt(allSteps, stepper.index);
  const hasValues = allSteps.some((s) => s.values);

  const longest = Math.max(...messages.map((m) => textWidth(m.label)), ...participants.map((p) => Math.max(textWidth(p.label), textWidth(p.sub, true))));
  const col = Math.max(170, longest + 40);
  const headH = participants.some((p) => p.sub) ? 50 : 40;
  const stateH = hasValues ? 26 : 0;
  const top = HEAD_TOP + headH + stateH + 30;
  const width = col * participants.length;
  const height = top + messages.length * ROW + 10;
  const x = (id: string) => col / 2 + col * Math.max(0, participants.findIndex((p) => p.id === id));

  const usesShow = allSteps.some((s) => s.show);
  const visible = new Set(usesShow ? allSteps.slice(0, stepper.index + 1).flatMap((s) => s.show ?? []) : messages.map((m) => m.id));
  const active = new Set(step.active ?? []);

  return (
    <figure className={cx("lm-diagram", "lm-sequence", className)}>
      {title && <figcaption className="lm-diagram__title">{title}</figcaption>}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title ?? "Sequence diagram"}: ${typeof step.caption === "string" ? step.caption : ""}`} className="lm-diagram__svg" style={{ maxWidth: width * 1.25 }}>
        <defs>
          {["", "-active"].map((k) => (
            <marker key={k} id={`${arrow}${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={cx("lm-diagram__arrowhead", k && "lm-diagram__arrowhead--active")} />
            </marker>
          ))}
        </defs>

        {participants.map((p) => {
          const cx0 = x(p.id);
          const w = col - 24;
          return (
            <g key={p.id} className={cx("lm-diagram__node", active.has(p.id) && "lm-diagram__node--active")}>
              <line x1={cx0} y1={HEAD_TOP + headH} x2={cx0} y2={height - 6} className="lm-sequence__lifeline" />
              <rect x={cx0 - w / 2} y={HEAD_TOP} width={w} height={headH} rx="10" />
              <text x={cx0} y={HEAD_TOP + (p.sub ? 20 : 25)} textAnchor="middle" className="lm-diagram__label">
                {p.label}
              </text>
              {p.sub && (
                <text x={cx0} y={HEAD_TOP + 38} textAnchor="middle" className="lm-diagram__sub">
                  {p.sub}
                </text>
              )}
              {values[p.id] !== undefined && (
                <text x={cx0} y={HEAD_TOP + headH + 19} textAnchor="middle" className={cx("lm-sequence__state", changed.has(p.id) && "lm-diagram__changed")}>
                  {values[p.id]}
                </text>
              )}
            </g>
          );
        })}

        {messages.map((m, i) => {
          if (!visible.has(m.id)) return null;
          const y = top + i * ROW;
          const x1 = x(m.from);
          const x2 = x(m.to);
          const self = m.from === m.to;
          const dir = x2 >= x1 ? 1 : -1;
          const d = self ? `M${x1},${y - 8} h46 v22 h-42` : `M${x1 + dir * 4},${y} L${x2 - dir * 6},${y}`;
          const on = active.has(m.id);
          const pathId = `${arrow}-${m.id}`;
          return (
            <g key={m.id} className={cx("lm-diagram__edge", on && "lm-diagram__edge--active", m.reply && "lm-diagram__edge--dashed")}>
              <path id={pathId} d={d} fill="none" markerEnd={`url(#${arrow}${on ? "-active" : ""})`} />
              <text x={self ? x1 + 54 : (x1 + x2) / 2} y={self ? y + 7 : y - 8} textAnchor={self ? "start" : "middle"} className="lm-diagram__edge-label">
                {m.label}
              </text>
              {on && (
                <circle r="5" className="lm-diagram__pulse">
                  <animateMotion dur="1.2s" repeatCount="indefinite">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      <StepControls stepper={stepper} count={allSteps.length} caption={step.caption} />
      <DiagramCodePanel code={code} lines={step.lines} />
    </figure>
  );
}

const label = (ps: SequenceParticipant[], id: string) => ps.find((p) => p.id === id)?.label ?? id;
