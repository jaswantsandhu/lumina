import { previous } from "./setGlobal";

const g = globalThis as { Prism?: unknown };
if (previous === undefined) delete g.Prism;
else g.Prism = previous;
