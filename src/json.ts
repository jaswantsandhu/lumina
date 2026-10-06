// Helpers for editing JSON by hand: where is a syntax error, and which line holds a given path
// (to point at validation errors like "steps.3.quiz.1.answer" inside a CodeEditor).

/**
 * The first JSON syntax error as { line, column, message }, or null if `text` is valid JSON. Lines are 1-based.
 * Uses its own small parser, so the location doesn't depend on the JS engine's error wording.
 */
export function jsonSyntaxError(text: string): { line: number; column: number; message: string } | null {
  let i = 0;
  const fail = (message: string): never => { throw Object.assign(new Error(message), { at: i }); };
  const ws = () => { while (i < text.length && " \t\n\r".includes(text[i])) i++; };
  const literal = (word: string) => { if (text.startsWith(word, i)) i += word.length; else fail(`Unexpected ${text[i] ? `"${text[i]}"` : "end of input"}`); };
  const str = () => {
    i++;
    while (i < text.length && text[i] !== '"') {
      if (text[i] === "\n") fail("Line break inside a string");
      i += text[i] === "\\" ? 2 : 1;
    }
    if (text[i] !== '"') fail("Unterminated string");
    i++;
  };
  const num = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
    if (!m) fail(`Unexpected "${text[i]}"`);
    i += m![0].length;
  };
  const value = (): void => {
    ws();
    const c = text[i];
    if (c === "{") {
      i++; ws();
      if (text[i] === "}") { i++; return; }
      for (;;) {
        ws();
        if (text[i] !== '"') fail(text[i] === "}" ? "Trailing comma before }" : "Expected a quoted key");
        str(); ws();
        if (text[i] !== ":") fail('Expected ":" after the key');
        i++; value(); ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "}") { i++; return; }
        fail('Expected "," or "}"');
      }
    } else if (c === "[") {
      i++; ws();
      if (text[i] === "]") { i++; return; }
      for (;;) {
        ws();
        if (text[i] === "]") fail("Trailing comma before ]");
        value(); ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "]") { i++; return; }
        fail('Expected "," or "]"');
      }
    } else if (c === '"') str();
    else if (c === "t") literal("true");
    else if (c === "f") literal("false");
    else if (c === "n") literal("null");
    else if (c === "-" || (c >= "0" && c <= "9")) num();
    else fail(c === undefined ? "Unexpected end of input" : `Unexpected "${c}"`);
  };
  try {
    value(); ws();
    if (i < text.length) fail(`Unexpected "${text[i]}" after the end`);
    return null;
  } catch (e) {
    const at = (e as { at?: number }).at ?? 0;
    const before = text.slice(0, at);
    return { line: before.split("\n").length, column: at - before.lastIndexOf("\n"), message: (e as Error).message };
  }
}

/**
 * Line numbers (1-based) of every value in a JSON document, keyed by dotted path ("steps.3.title").
 * The root is "". Works on text produced by JSON.stringify(value, null, 2) and on hand-edited JSON.
 */
export function jsonPathLines(text: string): Map<string, number> {
  const lines = new Map<string, number>();
  let i = 0;
  let line = 1;
  const ws = () => {
    while (i < text.length && /\s/.test(text[i])) {
      if (text[i] === "\n") line++;
      i++;
    }
  };
  const str = () => {
    let out = "";
    i++; // opening quote
    while (i < text.length && text[i] !== '"') {
      if (text[i] === "\\") { out += text[i + 1]; i += 2; continue; }
      if (text[i] === "\n") line++;
      out += text[i++];
    }
    i++;
    return out;
  };
  const value = (path: string): void => {
    ws();
    lines.set(path, line);
    const c = text[i];
    if (c === "{") {
      i++;
      ws();
      while (i < text.length && text[i] !== "}") {
        ws();
        const key = str();
        ws();
        i++; // colon
        const child = path ? `${path}.${key}` : key;
        const keyLine = line;
        value(child);
        lines.set(child, Math.min(lines.get(child) ?? keyLine, keyLine));
        ws();
        if (text[i] === ",") i++;
        ws();
      }
      i++;
    } else if (c === "[") {
      i++;
      ws();
      let n = 0;
      while (i < text.length && text[i] !== "]") {
        value(path ? `${path}.${n}` : String(n));
        n++;
        ws();
        if (text[i] === ",") i++;
        ws();
      }
      i++;
    } else if (c === '"') {
      str();
    } else {
      while (i < text.length && !/[,\]}\s]/.test(text[i])) i++;
    }
  };
  try {
    value("");
  } catch {
    /* malformed JSON: return what was found */
  }
  return lines;
}

/** The line of `path` in `text`, or of its nearest parent that exists (e.g. a missing field's object). */
export function findJsonPathLine(text: string, path: string): number | undefined {
  const lines = jsonPathLines(text);
  const parts = path.split(".").filter(Boolean);
  while (parts.length) {
    const hit = lines.get(parts.join("."));
    if (hit) return hit;
    parts.pop();
  }
  return lines.get("");
}
