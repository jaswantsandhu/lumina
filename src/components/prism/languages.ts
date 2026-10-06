// Extra languages for CodeView. prism-react-renderer ships ~40 languages, but not shell, Java, C#,
// PowerShell or Dockerfile, which docs and course sites use all the time. Import order matters.
import "./setGlobal";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-properties";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-scss";
import "./restoreGlobal";
import { Prism } from "prism-react-renderer";

/** Common names (file extensions, Markdown fence names) mapped to Prism language ids. */
const ALIASES: Record<string, string> = {
  yml: "yaml", html: "markup", xml: "markup", svg: "markup", js: "javascript", ts: "typescript", md: "markdown",
  sh: "bash", shell: "bash", zsh: "bash", console: "bash", terminal: "bash",
  ps: "powershell", ps1: "powershell", pwsh: "powershell",
  dockerfile: "docker",
  cs: "csharp", "c#": "csharp",
  htm: "markup", vue: "markup",
  env: "properties", conf: "ini", cfg: "ini",
  patch: "diff",
  mjs: "javascript", cjs: "javascript",
  mts: "typescript", cts: "typescript",
  kt: "kotlin", py: "python", rs: "rust", golang: "go",
  "c++": "cpp", h: "c", hpp: "cpp",
};

const PLAIN = new Set(["", "text", "plain", "plaintext", "txt", "none"]);
const warned = new Set<string>();

/** Every language id CodeView can highlight. */
export function codeLanguages(): string[] {
  return Object.keys(Prism.languages).filter((k) => typeof Prism.languages[k] === "object").sort();
}

/**
 * The Prism id for a language name or alias ("sh" → "bash", "yml" → "yaml"), or "text" if it can't be highlighted.
 * Unknown names are reported once in the console, instead of silently showing plain text.
 */
export function resolveLanguage(language: string | undefined): string {
  const name = (language ?? "").trim().toLowerCase();
  if (PLAIN.has(name)) return "text";
  const id = ALIASES[name] ?? name;
  if (Prism.languages[id]) return id;
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`[lumina] CodeView: no syntax highlighting for "${language}", showing plain text. Highlightable: ${codeLanguages().join(", ")}`);
  }
  return "text";
}
