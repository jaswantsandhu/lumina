import { Highlight, type Language, type PrismTheme } from "prism-react-renderer";
import { useRef, type KeyboardEvent } from "react";
import { cx } from "../utils";
import { useField } from "./Field";
import { resolveLanguage } from "./prism/languages";

export interface CodeEditorError {
  /** 1-based line. */
  line: number;
  message: string;
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Same names as CodeView: json, java, python, ts, sh, yaml, … */
  language?: string;
  /** Problems to show: the line is marked in the gutter and listed under the editor (click to jump there). */
  errors?: CodeEditorError[];
  /** Ctrl/⌘ + S. */
  onSave?: () => void;
  /** Accessible name when not inside a <Field>. */
  label?: string;
  readOnly?: boolean;
  /** Spaces inserted by Tab (default 2). Shift+Tab removes them. Escape then Tab moves focus on. */
  tabSize?: number;
  /** Height of the scroll area (default 32rem). */
  maxHeight?: string;
  /** Minimum visible lines (default 8). */
  minLines?: number;
  className?: string;
}

const theme: PrismTheme = { plain: {}, styles: [] };

/** An editable code field with syntax highlighting, line numbers and error markers: JSON content, config, prompts. */
export function CodeEditor({
  value, onChange, language = "text", errors = [], onSave, label, readOnly, tabSize = 2, maxHeight = "32rem", minLines = 8, className,
}: CodeEditorProps) {
  const field = useField();
  const ref = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const lineCount = Math.max(value.split("\n").length, minLines);
  const errorLines = new Map<number, string[]>();
  for (const e of errors) errorLines.set(e.line, [...(errorLines.get(e.line) ?? []), e.message]);

  const goTo = (line: number) => {
    const el = ref.current;
    if (!el) return;
    const starts = [0];
    for (let i = 0; i < value.length; i++) if (value[i] === "\n") starts.push(i + 1);
    const start = starts[Math.min(line, starts.length) - 1] ?? 0;
    const end = value.indexOf("\n", start);
    el.focus();
    el.setSelectionRange(start, end < 0 ? value.length : end);
    // Scroll the line into view (line height is constant).
    const scroller = el.closest(".lm-code-editor__scroll") as HTMLElement | null;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    if (scroller) scroller.scrollTop = Math.max(0, (line - 3) * lh);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && onSave) {
      e.preventDefault();
      onSave();
      return;
    }
    if (e.key === "Escape") {
      escaped.current = true; // next Tab leaves the editor (keyboard users must not get trapped)
      return;
    }
    if (e.key !== "Tab" || readOnly || escaped.current) {
      escaped.current = false;
      return;
    }
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;
    const indent = " ".repeat(tabSize);
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    if (e.shiftKey) {
      const remove = value.slice(lineStart, lineStart + tabSize).match(/^ */)![0].length;
      const next = value.slice(0, lineStart) + value.slice(lineStart + remove);
      onChange(next);
      requestAnimationFrame(() => el.setSelectionRange(Math.max(lineStart, s - remove), Math.max(lineStart, end - remove)));
    } else {
      onChange(value.slice(0, s) + indent + value.slice(end));
      requestAnimationFrame(() => el.setSelectionRange(s + tabSize, s + tabSize));
    }
  };

  return (
    <div className={cx("lm-code-editor", errors.length > 0 && "lm-code-editor--invalid", className)}>
      <div className="lm-code-editor__scroll" style={{ maxHeight }}>
        <div className="lm-code-editor__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className={cx("lm-code-editor__number", errorLines.has(i + 1) && "lm-code-editor__number--error")} title={errorLines.get(i + 1)?.join("\n")}>
              {i + 1}
            </span>
          ))}
        </div>
        <div className="lm-code-editor__area">
          <Highlight code={value} language={resolveLanguage(language) as Language} theme={theme}>
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="lm-code-editor__highlight" aria-hidden="true">
                {tokens.map((line, i) => {
                  const { className: lineClass, ...lineProps } = getLineProps({ line });
                  return (
                    <span key={i} {...lineProps} className={cx(lineClass, "lm-code-editor__line", errorLines.has(i + 1) && "lm-code-editor__line--error")}>
                      {line.map((token, k) => <span key={k} {...getTokenProps({ token })} />)}
                      {"\n"}
                    </span>
                  );
                })}
              </pre>
            )}
          </Highlight>
          <textarea
            ref={ref}
            id={field?.id}
            className="lm-code-editor__input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            aria-label={field ? undefined : label}
            aria-describedby={[field?.describedBy, errors.length ? `${field?.id ?? "lm-ce"}-errors` : undefined].filter(Boolean).join(" ") || undefined}
            aria-invalid={errors.length > 0 || field?.invalid || undefined}
            aria-multiline="true"
          />
        </div>
      </div>
      {errors.length > 0 && (
        <ul className="lm-code-editor__errors" id={`${field?.id ?? "lm-ce"}-errors`}>
          {errors.map((e, i) => (
            <li key={i}>
              <button type="button" onClick={() => goTo(e.line)}>Line {e.line}</button> {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
