# Working on Lumina

Guidance for AI agents and contributors changing this repo. To *use* Lumina in an app, see `skills/lumina/SKILL.md`.

## Layout
- `src/tokens/tokens.json`: the only source of design tokens. `scripts/build-tokens.mjs` generates `tokens.css` and `index.ts` (both git-ignored).
- `src/components/<Name>.tsx` + `<Name>.css`: one component (or a small family) per pair. Export new components from `src/index.ts`.
- `src/styles/base.css`: base styles under `.lm-root`, at zero specificity (`:where`) so components always win.
- `stories/*.stories.tsx`: Storybook stories, one file per group. Every component needs stories.
- `src/__tests__`: Vitest + Testing Library.

## Rules
1. **Tokens only.** No hex colours, px spacing or durations in component CSS. Use `var(--lm-*)`. Need a new value? Add a token.
2. **Semantic colours.** Components use `--lm-color-*`, never palette shades. White text goes only on `*-solid` backgrounds with `--lm-color-on-solid`.
3. **Class naming.** `lm-<component>`, `lm-<component>__<part>`, `lm-<component>--<modifier>`.
4. **Accessibility.**
   - Native elements first (`button`, `dialog`, form controls).
   - Form controls read `useField()` so `<Field>` can label them.
   - Icon-only buttons require `aria-label`.
   - Keyboard support for composite widgets.
   - No serious or critical axe violations in either theme.
5. **API.** Forward `className` (and `ref` for form controls and buttons). Keep props small and typed, and document them with JSDoc (it becomes Storybook docs).
6. **Effects must not return values.** Use block bodies: `useEffect(() => { … })`. Newer browsers return Promises from DOM methods like `scrollIntoView`.

## Before committing
```sh
docker run --rm -v "$PWD":/app -w /app node:22-alpine sh -c "npm ci && npm run typecheck && npm test && npm run build && npm run build-storybook"
```
