# ✦ Lumina

Design tokens and accessible React components. Lumina is the design system for [agentteam](https://github.com/jaswantsandhu/agentteam), and works in any React 18+ app.

- **Tokens first:** colour, type, spacing, radius, shadow, motion and z-index as `--lm-*` CSS variables, generated from one [`tokens.json`](src/tokens/tokens.json), with a typed TypeScript export.
- **Light and dark:** follows the OS, or is set explicitly with `data-theme`.
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
tokens.color.palette.indigo["600"]; // "#5448e3"
```

## Components

| Group | Components |
|-------|------------|
| Layout and type | `Stack`, `Text`, `Heading`, `Code`, `Kbd`, `Divider`, `PageHeader` |
| Actions | `Button` (primary, secondary, ghost, danger; sm, md, lg; loading), `IconButton`, `Spinner` |
| Forms | `Field` (label, hint, error, required), `Input`, `Textarea`, `Select`, `Checkbox`, `Switch` |
| Data display | `Badge`, `Card` (+ `CardHeader`, `CardBody`, `CardFooter`), `Table` (+ `THead`, `TBody`, `TR`, `TH`, `TD`), `Avatar`, `List`, `ListItem`, `CodeBlock`, `EmptyState`, `Skeleton` |
| Feedback and overlays | `Alert`, `ToastProvider` + `useToast`, `Tooltip`, `Dialog` |
| Navigation | `Tabs` + `TabPanel`, `AppShell`, `SidebarBrand`, `SidebarFooter`, `NavSection`, `NavItem` |
| Theme | `useTheme`, `ThemeToggle` |

Browse them all, with props and live controls, in Storybook.

## Tokens

| Group | Variables | Notes |
|-------|-----------|-------|
| Semantic colour | `--lm-color-{bg, surface, surface-raised, surface-sunken, overlay, border, border-strong, text, text-muted, text-subtle, accent, accent-hover, accent-soft, on-accent, focus, success, warning, danger, info, *-soft, *-text, *-solid, on-solid}` | Use these in UI: they switch with the theme. `*-solid` colours carry white (`on-solid`) text at WCAG AA. |
| Palette | `--lm-{indigo, slate, green, amber, red, sky}-{shade}` | Raw colours. Avoid in components. |
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
