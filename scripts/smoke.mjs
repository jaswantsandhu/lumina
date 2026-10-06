// Imports the BUILT package (dist/) the way an app would, to catch bundling problems the source tests can't see
// (e.g. a setup module dropped by tree-shaking).
const lumina = await import("../dist/index.js");
const missing = ["bash", "java", "csharp", "powershell", "docker"].filter((l) => !lumina.codeLanguages().includes(l));
if (missing.length) throw new Error(`CodeView languages missing from the build: ${missing.join(", ")}`);
if (globalThis.Prism !== undefined) throw new Error("The build left a global Prism behind");
for (const name of ["StepDiagram", "SequenceDiagram", "Quiz", "Checklist", "Prose", "markdownComponents", "Dialog"]) {
  if (!lumina[name]) throw new Error(`Missing export: ${name}`);
}
console.log("smoke: dist/index.js imports cleanly; CodeView languages and new exports present");
