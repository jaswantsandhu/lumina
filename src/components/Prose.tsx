import { isValidElement, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { cx } from "../utils";
import { Alert } from "./Alert";
import { CodeView } from "./CodeView";
import { Table, TBody, TD, TH, THead, TR } from "./Table";
import { Code, Divider, Heading, Text } from "./Text";

export interface ProseProps {
  children?: ReactNode;
  className?: string;
}

/** Long-form content (articles, docs, rendered Markdown): consistent spacing for headings, paragraphs, lists and tables. */
export function Prose({ children, className }: ProseProps) {
  return <div className={cx("lm-prose", className)}>{children}</div>;
}

export interface MarkdownComponentsOptions {
  /**
   * Called for links that start with "/" (in-app links), instead of a full page load. Leave it out to let the
   * browser follow them. Other links open in a new tab.
   */
  onInternalLink?: (href: string) => void;
  /** Line numbers in fenced code blocks (default false). */
  lineNumbers?: boolean;
}

type Props = { children?: ReactNode; className?: string; href?: string; node?: unknown };

const textOf = (n: ReactNode): string =>
  typeof n === "string" || typeof n === "number"
    ? String(n)
    : Array.isArray(n)
      ? n.map(textOf).join("")
      : isValidElement(n)
        ? textOf((n.props as { children?: ReactNode }).children)
        : "";

/**
 * Renderers that turn Markdown into Lumina components: headings, text, tables, callouts (blockquotes),
 * inline code and highlighted code blocks. Works with react-markdown (and anything using the same
 * `components` prop):
 *
 *   <Prose><ReactMarkdown components={markdownComponents()}>{text}</ReactMarkdown></Prose>
 */
export function markdownComponents({ onInternalLink, lineNumbers = false }: MarkdownComponentsOptions = {}) {
  return {
    h1: ({ children }: Props) => <Heading level={1} size="xl">{children}</Heading>,
    h2: ({ children }: Props) => <Heading level={2} size="md">{children}</Heading>,
    h3: ({ children }: Props) => <Heading level={3} size="sm">{children}</Heading>,
    h4: ({ children }: Props) => <Heading level={4} size="sm">{children}</Heading>,
    p: ({ children }: Props) => <Text>{children}</Text>,
    blockquote: ({ children }: Props) => <Alert tone="info">{children}</Alert>,
    hr: () => <Divider />,
    table: ({ children }: Props) => (
      <div className="lm-prose__table">
        <Table>{children}</Table>
      </div>
    ),
    thead: ({ children }: Props) => <THead>{children}</THead>,
    tbody: ({ children }: Props) => <TBody>{children}</TBody>,
    tr: ({ children }: Props) => <TR>{children}</TR>,
    th: ({ children }: Props) => <TH>{children}</TH>,
    td: ({ children }: Props) => <TD>{children}</TD>,
    pre: ({ children }: Props) => {
      const code = isValidElement(children) ? (children as ReactElement<Props>).props : { className: "", children };
      const language = (code.className ?? "").replace(/^language-/, "") || "text";
      return <CodeView code={textOf(code.children).replace(/\n$/, "")} language={language} lineNumbers={lineNumbers} wrap />;
    },
    code: ({ children, className }: Props) => <Code className={className}>{children}</Code>,
    a: ({ href = "", children }: Props) =>
      href.startsWith("/") ? (
        <a
          href={href}
          onClick={
            onInternalLink
              ? (e: MouseEvent) => {
                  e.preventDefault();
                  onInternalLink(href);
                }
              : undefined
          }
        >
          {children}
        </a>
      ) : (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ),
  };
}
