// Prism's language files register themselves on a global `Prism`. Point it at the instance
// prism-react-renderer uses, just while they load (restoreGlobal.ts puts the old value back).
import { Prism } from "prism-react-renderer";

const g = globalThis as { Prism?: unknown };
export const previous = g.Prism;
g.Prism = Prism;
