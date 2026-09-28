import { Highlight, type Language, type PrismTheme } from "prism-react-renderer";
import { useState } from "react";
import { cx } from "../utils";

export interface CodeViewProps {
  code: string;
  /** Prism language: tsx, typescript, javascript, json, bash, python, css, markup, yaml, sql, go, rust, … */
  language?: Language | string;
  /** File name or title in the header. */
  title?: string;
  lineNumbers?: boolean;
  /** 1-based line numbers to highlight, e.g. [3, 4]. */
  highlightLines?: number[];
  /** Soft-wrap long lines (default: scroll horizontally). */
  wrap?: boolean;
  copyable?: boolean;
  maxHeight?: string;
  className?: string;
}

// Colours come from CSS classes on tokens (see CodeView.css), so the theme is empty.
const theme: PrismTheme = { plain: {}, styles: [] };

/** Syntax-highlighted source code with line numbers, highlighted lines and copy. */
export function CodeView({ code, language = "tsx", title, lineNumbers = true, highlightLines = [], wrap, copyable = true, maxHeight = "32rem", className }: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  const marked = new Set(highlightLines);
  return (
    <div className={cx("lm-codeview", className)}>
      <div className="lm-codeview__header">
        <span className="lm-codeview__title">{title ?? language}</span>
        {copyable && (
          <button type="button" className="lm-codeview__copy" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <Highlight code={code.replace(/\n$/, "")} language={language as Language} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={cx("lm-codeview__pre", wrap && "lm-codeview__pre--wrap")} style={{ maxHeight }} tabIndex={0} aria-label={title ? `${title} source` : "Source code"}>
            <code>
              {tokens.map((line, i) => {
                const { className: lineClass, ...lineProps } = getLineProps({ line });
                return (
                  <span key={i} {...lineProps} className={cx(lineClass, "lm-codeview__line", marked.has(i + 1) && "lm-codeview__line--marked")}>
                    {lineNumbers && (
                      <span className="lm-codeview__number" aria-hidden="true">
                        {i + 1}
                      </span>
                    )}
                    <span className="lm-codeview__content">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </span>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
