# ✦ Lumina

Design tokens and accessible React components. Lumina works in any React 18+ app.

- **Tokens first:** colour, type, spacing, radius, shadow, motion and z-index as `--lm-*` CSS variables, generated from one [`tokens.json`](src/tokens/tokens.json), with a typed TypeScript export.
- **Light and dark:** follows the OS, or is set explicitly with `data-theme` on `<html>` or on any element (a light panel inside a dark page works). Storybook's **Foundations → Dark mode** shows both side by side.
- **Accessible by default:** native elements, labelled fields, visible focus, keyboard support, live regions. Every Storybook story passes axe (no serious or critical violations) in both themes.
- **Plain CSS:** no runtime styling library. Classes are prefixed `lm-`, and `className` and `style` pass through.

## Install

Lumina is published privately to GitHub Packages.

```ini
# .npmrc in your project
@jaswantsandhu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
GITHUB_TOKEN=<token with read:packages> npm install @jaswantsandhu/lumina
```

## Use

```tsx
import "@jaswantsandhu/lumina/styles.css"; // once, at the app root
import { Button, Field, Input, ToastProvider, useToast } from "@jaswantsandhu/lumina";

// Add class="lm-root" to <body> for base font, colours and focus ring.
export function App() {
  return (
    <ToastProvider>
      <Field label="Team name" hint="Lowercase letters, digits and dashes." required>
        <Input placeholder="research" />
      </Field>
      <Button variant="primary">Create team</Button>
    </ToastProvider>
  );
}
```

Theme: leave `<html>` alone to follow the OS, set `data-theme="light"` or `"dark"`, or use `useTheme()` and `<ThemeToggle />`.

Tokens in your own CSS or inline styles:

```css
.panel { background: var(--lm-color-surface); padding: var(--lm-space-4); border-radius: var(--lm-radius-lg); }
```

```ts
import { vars, tokens } from "@jaswantsandhu/lumina/tokens";
vars["color-accent"]; // "var(--lm-color-accent)"
tokens.color.palette.pink["700"]; // "#be185d" (the accent)
```

## Components

| Group | Components |
|-------|------------|
| Layout and type | `Stack`, `Grid` (responsive columns), `SplitView` (list + detail, one pane on phones), `Text`, `Heading`, `Code`, `Kbd`, `Divider`, `PageHeader`, `Disclosure` (show/hide section) |
| Actions | `Button` (primary, secondary, ghost, danger; sm, md, lg; loading), `IconButton`, `Spinner` |
| Forms | `Field` (label, hint, error, required), `Input`, `PasswordInput` (show/hide), `NumberInput` (unit, clamping), `Combobox` (pick or type, filtered, keyboard), `Textarea`, `Select`, `Checkbox`, `Switch` |
| Files | `FileUpload` (drag and drop, type/size limits, progress, errors), `FileDownload` (text, Blob, generated data or URL) |
| Data display | `StatCard` (value, hint, trend), `Progress` (meter with warning/danger thresholds), `Timeline` (steps with status and expandable detail, live), `DataTable` (sorting, pagination, selection, loading and empty states; rows become cards on phones), `Table` primitives (`THead`, `TBody`, `TR`, `TH`, `TD`), `Badge`, `Card` (+ `CardHeader`, `CardBody`, `CardFooter`), `Avatar`, `List`, `ListItem`, `CodeView` (syntax highlighting, line numbers, highlighted lines), `CodeBlock`, `EmptyState`, `Skeleton` |
| Charts | `Chart` from `@jaswantsandhu/lumina/charts`: line, spline, area (stacked), column, bar, pie, donut on Highcharts, themed with tokens. `GraphChart`: force-directed node-link graph with node kinds, pending nodes, selection and click |
| Feedback and overlays | `Alert`, `ToastProvider` + `useToast`, `Tooltip`, `Dialog`, `DropdownMenu` |
| Navigation | `Tabs` + `TabPanel`, `AppShell`, `SidebarBrand`, `SidebarFooter`, `NavSection`, `NavItem` |
| Chat | `ChatThread` (header, messages that stay scrolled to the bottom, composer), `ChatMessage` (yours as bubbles, others as cards), `ChatComposer` (Enter sends, Shift+Enter new line, grows) |
| Theme | `useTheme`, `ThemeToggle` |

Browse them all, with props and live controls, in Storybook.

## Charts

Charts use [Highcharts](https://www.highcharts.com/) through a separate entry point, so apps without charts don't need it:

```sh
npm install highcharts highcharts-react-official
```

```tsx
import { Chart } from "@jaswantsandhu/lumina/charts";

<Chart type="line" title="Visits per day" categories={["Mon", "Tue", "Wed"]} series={[{ name: "Web", data: [1200, 1900, 1500] }]} valueSuffix=" tokens" />
```

Colours, fonts, grid and tooltips come from the tokens (`--lm-color-chart-1…6` for series). Charts re-theme when light/dark changes. Pass `options` to merge in any Highcharts option. ### GraphChart

A force-directed node-link graph (Highcharts networkgraph) for knowledge graphs, dependencies or org charts:

```tsx
import { GraphChart } from "@jaswantsandhu/lumina/charts";

<GraphChart
  label="Team knowledge"
  nodes={[{ id: "acme", label: "Acme", kind: "topic" }, { id: "runbook", label: "Billing runbook", kind: "doc" }]}
  links={[{ from: "runbook", to: "acme", label: "mentions" }]}
  kinds={{ topic: { label: "Topic" }, doc: { label: "Document", color: 1, size: 12 } }}
  selectedId={selected}
  onNodeClick={setSelected}
/>
```

- `kinds` sets colour (palette index), size and the legend; `pending: true` fades a node (e.g. awaiting review), `dashed: true` dashes a link.
- Nodes can be dragged; a click calls `onNodeClick`. Show the node's details next to the graph (see the *Knowledge graph with overview* story).
- Accessible: the graph is named with its node and link counts; Tab reveals a list of node buttons (same `onNodeClick`), and a hidden table lists every link for screen readers.
- Any change to nodes, links or kinds redraws the layout (networkgraph can't update in place); selection changes don't.

Highcharts needs a [commercial licence](https://shop.highcharts.com/) for non-personal use.

## Tokens

| Group | Variables | Notes |
|-------|-----------|-------|
| Semantic colour | `--lm-color-{bg, surface, surface-raised, surface-sunken, overlay, border, border-strong, text, text-muted, text-subtle, accent, accent-hover, accent-soft, on-accent, focus, success, warning, danger, info, *-soft, *-text, *-solid, on-solid}` | Use these in UI: they switch with the theme. `*-solid` colours carry white (`on-solid`) text at WCAG AA. |
| Chart and code | `--lm-color-chart-{1…6}`, `--lm-color-code-{keyword, string, number, function, tag, attr}` | Themed per light/dark. |
| Palette | `--lm-{pink, indigo, slate, green, amber, red, sky}-{shade}` (pink is the accent) | Raw colours. Avoid in components. |
| Type | `--lm-font-family-{sans, mono}`, `--lm-font-size-{xs…4xl}`, `--lm-font-weight-*`, `--lm-font-line-height-*` | |
| Space | `--lm-space-{0…16}` (dots become underscores: `--lm-space-1_5`) | 4px base. |
| Radius, shadow | `--lm-radius-{none, sm, md, lg, xl, full}`, `--lm-shadow-{sm, md, lg}` | Shadows differ per theme. |
| Motion, layers, sizes | `--lm-motion-duration-*`, `--lm-motion-easing-*`, `--lm-z-*`, `--lm-size-{control-sm, control-md, control-lg, sidebar}` | Reduced motion is respected. |

Change tokens in `src/tokens/tokens.json` only. `npm run tokens` regenerates the CSS and the TypeScript.

## Development

Everything runs in Docker, so there's nothing to install on the host except Docker:

```sh
docker run --rm -it -v "$PWD":/app -w /app -p 6006:6006 node:22-alpine sh -c "npm ci && npm run storybook"   # http://127.0.0.1:6006
docker run --rm -v "$PWD":/app -w /app node:22-alpine sh -c "npm ci && npm run typecheck && npm test && npm run build"
```

| Script | What it does |
|--------|--------------|
| `npm run storybook` / `build-storybook` | Component docs with controls, the a11y panel and a theme switcher |
| `npm test` | Vitest + Testing Library (accessibility wiring, keyboard and state) |
| `npm run typecheck` | TypeScript, strict |
| `npm run build` | `dist/`: ESM + type declarations, `styles.css`, `tokens.css` |

## Releasing

Bump `version` in `package.json`, commit, and push a tag `v<version>`. The **Release** workflow tests, builds and publishes to GitHub Packages.

## For AI agents

[`skills/lumina/SKILL.md`](skills/lumina/SKILL.md) is a skill that teaches coding agents to build UIs with Lumina. It's shipped inside the package (`node_modules/@jaswantsandhu/lumina/skills/`). [`AGENTS.md`](AGENTS.md) covers working *on* Lumina itself.
