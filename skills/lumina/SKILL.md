---
name: lumina
description: "Use when building or changing a React UI that uses the Lumina design system (@jaswantsandhu/lumina), or when asked to make a UI consistent, accessible or on-brand in a project that depends on Lumina. Covers setup, tokens, which component to use for what, and the rules for layouts, forms, feedback and theming."
---

# Building UIs with Lumina

Lumina (`@jaswantsandhu/lumina`) provides design tokens (`--lm-*` CSS variables) and accessible React components. Build screens from its components and tokens instead of writing new CSS.

## Setup (once per app)
```tsx
import "@jaswantsandhu/lumina/styles.css";
import { ToastProvider } from "@jaswantsandhu/lumina";
// <body class="lm-root"> for base font, colours and focus ring.
// Wrap the app in <ToastProvider> if you use toasts.
```

## Pick the right component
| Need | Use |
|------|-----|
| Page frame with sidebar | `AppShell` with `title` (shown in the phone top bar) and `sidebar={<>SidebarBrand, NavSection>NavItem…, SidebarFooter</>}`. Below 720px the sidebar becomes a drawer that closes when a NavItem is chosen |
| Page title and actions | `PageHeader title description actions` |
| Vertical or horizontal spacing | `Stack direction gap` (never margins between siblings) |
| Cards in a responsive grid | `Grid min="16rem"` (or `columns={3}`; one column on phones) |
| List + detail screen | `SplitView list showDetail onBack backLabel` (both panes on desktop; on phones one pane with a back link). `flushDetail` for chats |
| Collapsible section | `Disclosure summary defaultOpen` (`variant="card"` for a boxed one) |
| Text | `Heading level`, `Text size tone weight truncate`, `Code`, `Kbd` |
| Actions | `Button variant="primary"` (one per view), `"secondary"` (default), `"ghost"` (low emphasis), `"danger"` (destructive). Icon-only: `IconButton aria-label` |
| Form control | Always inside `Field label hint error required`: `Input`, `PasswordInput`, `NumberInput value onValueChange min max decimal suffix`, `Combobox value onValueChange options allowCustom` (pick or type), `Textarea` (`mono` for code/prompts), `Select`, `Checkbox label`, `Switch checked onCheckedChange` |
| Status | `Badge tone` (`success`, `warning`, `danger`, `info`, `accent`, `neutral`). `dot` for live states |
| Group of content | `Card` + `CardHeader title description actions`, `CardFooter` for actions |
| Key numbers | `StatCard label value hint trend` in a `Grid` |
| Usage against a limit | `Progress value max label valueText` (turns warning at 80%, danger at 100%; `thresholds={null}` for plain progress) |
| Steps / activity / log | `Timeline aria-label items=[{id, icon, title, preview, status, live, detail, meta}] maxHeight live` |
| Conversation | `ChatThread header composer scrollKey` with `ChatMessage from="self"\|"other" author avatarName time meta footer` and `ChatComposer value onValueChange onSend` |
| Rows of records | `DataTable columns rows getRowId` (sortable columns, `pageSize`, `selectedIds`/`onSelectionChange`, `loading`, `empty`; on phones rows become cards: give every column a text `header`, or `mobile="scroll"`). Simple static tables: `Table`/`THead`/`TBody`/`TR`/`TH`/`TD` |
| Charts | `Chart type series categories title` from `@jaswantsandhu/lumina/charts` (line, spline, area + `stacked`, column, bar, pie, donut). Never hard-code chart colours: the tokens theme them |
| Upload files | `FileUpload files onFilesChange accept maxSize maxFiles multiple` (controlled; set `status`/`progress` on each file while uploading) |
| Download a file | `FileDownload filename data` (text, Blob, or a function) or `href` |
| Source code | `CodeView code language title lineNumbers highlightLines`. Plain output/logs: `CodeBlock` |
| Menu of actions | `DropdownMenu trigger={(p) => <Button {...p}>…</Button>} items=[{label, onSelect, danger}, {type:"separator"}]` |
| Selectable list (threads, items) | `List` + `ListItem title meta selected leading trailing` |
| Nothing to show | `EmptyState title description action` (one primary Button) |
| Loading | `Skeleton` for content, `Spinner` for small inline waits, `Button loading` for actions |
| Message in the page | `Alert tone title action onDismiss` |
| Transient confirmation | `useToast().toast({ title, description, tone })` |
| Confirm or destructive step | `Dialog open onClose title description footer` |
| Hint on hover or focus | `Tooltip content` around a focusable element (never essential info) |
| Switch views | `Tabs items value onValueChange` + `TabPanel` |
| Person or agent | `Avatar name` (initials, colour derived from the name) |
| Theme switch | `ThemeToggle` or `useTheme()` |

## Rules
1. **Tokens, not literals.** Custom styles use `var(--lm-color-*)`, `var(--lm-space-*)`, `var(--lm-radius-*)`, `var(--lm-shadow-*)`, `var(--lm-font-size-*)`. Never hard-code hex colours or px spacing.
2. **Semantic colours only:** `--lm-color-text`, `text-muted`, `surface`, `border`, `accent`, `success`/`warning`/`danger`/`info` and their `-soft`, `-text`, `-solid` variants. They adapt to dark mode. White text goes only on `*-solid` backgrounds.
3. **Hierarchy:** one primary button per view; destructive actions use `danger`, and confirm with a `Dialog` when they can't be undone.
4. **Forms:** every control is inside a `Field` with a visible label (`hideLabel` only when context makes it obvious, e.g. a search box). Show validation with `error`, not colour alone.
5. **States:** design empty (`EmptyState`), loading (`Skeleton`/`Spinner`) and error (`Alert tone="danger"`) states for every data view.
6. **Accessibility:** give icon-only buttons an `aria-label`; don't put interactive elements inside other interactive elements; keep text contrast on tokens (don't invent colours).
7. **Effects** must use block bodies, `useEffect(() => { … })`, never returning a value.
8. **Don't restyle components** with overrides. If something is missing, compose components, or add a small styled wrapper that uses tokens.

## Example
```tsx
<AppShell title="✦ agentteam" sidebar={<><SidebarBrand>✦ agentteam</SidebarBrand><NavSection label="Team"><NavItem active>Chat</NavItem><NavItem count={2}>Approvals</NavItem></NavSection></>}>
  <div style={{ padding: "var(--lm-space-8)" }}>
    <PageHeader title="Tasks" description="Work assigned to the demo team." actions={<Button variant="primary">Assign task</Button>} />
    {tasks.length === 0 ? (
      <EmptyState title="No tasks yet" description="Assign work to the lead." action={<Button variant="primary">Assign task</Button>} />
    ) : (
      <Table><THead><TR><TH>Task</TH><TH>Status</TH></TR></THead>
        <TBody>{tasks.map((t) => <TR key={t.id}><TD>{t.title}</TD><TD><Badge tone={t.ok ? "success" : "danger"}>{t.status}</Badge></TD></TR>)}</TBody>
      </Table>
    )}
  </div>
</AppShell>
```

Full component docs with live examples are in Lumina's Storybook (`npm run storybook` in the Lumina repo).
