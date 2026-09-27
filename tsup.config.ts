import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", tokens: "src/tokens/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  target: "es2020",
});
