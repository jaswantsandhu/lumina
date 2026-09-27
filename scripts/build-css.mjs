// Bundles the stylesheets into dist/: tokens.css alone, and styles.css
// (tokens + base + every component), in a stable order.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const components = readdirSync(new URL("../src/components", import.meta.url))
  .filter((f) => f.endsWith(".css"))
  .sort()
  .map((f) => `/* ${f} */\n${read(`src/components/${f}`)}`);

mkdirSync(new URL("../dist", import.meta.url), { recursive: true });
const tokens = read("src/tokens/tokens.css");
writeFileSync(new URL("../dist/tokens.css", import.meta.url), tokens);
writeFileSync(new URL("../dist/styles.css", import.meta.url), [tokens, read("src/styles/base.css"), ...components].join("\n"));
console.log(`styles.css: ${components.length} component stylesheets`);
