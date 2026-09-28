import { useState } from "react";
import { cx } from "../utils";

export interface CodeBlockProps {
  code: string;
  /** Shown in the header, e.g. "json" or "bash". */
  language?: string;
  /** Show a copy button (default true). */
  copyable?: boolean;
  maxHeight?: string;
  className?: string;
}

/** Preformatted code or output, with a copy button. */
export function CodeBlock({ code, language, copyable = true, maxHeight = "24rem", className }: CodeBlockProps) {
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
  return (
    <div className={cx("lm-codeblock", className)}>
      {(language || copyable) && (
        <div className="lm-codeblock__header">
          <span>{language}</span>
          {copyable && (
            <button type="button" className="lm-codeblock__copy" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre className="lm-codeblock__pre" style={{ maxHeight }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
