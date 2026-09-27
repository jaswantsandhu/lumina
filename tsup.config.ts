import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", tokens: "src/tokens/index.ts", charts: "src/charts/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime", "highcharts", "highcharts-react-official"],
  target: "es2020",
});
