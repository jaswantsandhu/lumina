import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import {
  AuthLayout, Button, CodeEditor, ConsentDialog, CookieSettings, CopyField, Field, Input, Journey, PasswordInput, Stack, StatusCell,
  Table, TBody, TD, TH, THead, TR, Text, ZonedDateTimeInput, findJsonPathLine, formatInTimeZone, jsonSyntaxError, useConsent,
} from "../src/index";

export default {
  title: "Patterns/App building blocks",
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Pieces most apps with accounts, admin screens and schedules need: copyable secrets, sign-in pages, progress strips, dense status tables, time-zone-aware inputs, opt-in consent, and a code editor with error markers." } } },
} satisfies Meta;

export const Copy: StoryObj = {
  name: "CopyField",
  render: () => (
    <Stack gap="6" style={{ maxWidth: 560 }}>
      <CopyField label="Invite link" value="https://learn.example.com/invite/I7Ew9lAeYwB5oKuGasiN4ZayrRugDc1ZVaBm9TLTz9Q" note="Valid 7 days, works once. It won't be shown again." once />
      <CopyField label="Connect Claude Code" value='claude mcp add --transport http lumina-lms https://learn.example.com/mcp --header "Authorization: Bearer <token>"' />
    </Stack>
  ),
};

export const SignIn: StoryObj = {
  name: "AuthLayout",
  parameters: { layout: "fullscreen" },
  render: () => (
    <AuthLayout brand="✦ Lumina Learn" title="Sign in" footer="No account or forgot your password? Ask your course admin for an invite link.">
      <Field label="Username"><Input autoComplete="username" /></Field>
      <Field label="Password"><PasswordInput autoComplete="current-password" /></Field>
      <Button variant="primary">Sign in</Button>
    </AuthLayout>
  ),
};

export const Progress: StoryObj = {
  name: "Journey",
  render: () => (
    <Journey label="Course progress" onSelect={() => {}} stops={[
      { id: "1", label: "Fee calculator", state: "done", title: "Day 1" },
      { id: "2", label: "Fee rules", state: "done", title: "Day 2" },
      { id: "3", label: "Card masking", state: "active", title: "Day 3" },
      { id: "4", label: "Merchants", state: "todo", title: "Day 4" },
      { id: "5", label: "Payment methods", state: "locked", title: "Day 5" },
      { id: "6", label: "Registry", state: "locked", title: "Day 6" },
    ]} />
  ),
};

export const Status: StoryObj = {
  name: "StatusCell (dense tables)",
  render: () => (
    <Table>
      <THead><TR><TH>Learner</TH><TH>Day 1</TH><TH>Day 2</TH><TH>Day 3</TH></TR></THead>
      <TBody>
        <TR><TD>Asha K</TD><TD><StatusCell tone="success" title="all steps, quiz 5/5">11/11 · 5/5</StatusCell></TD><TD><StatusCell tone="warning" title="4 of 10 steps">4/10</StatusCell></TD><TD><StatusCell>0/10</StatusCell></TD></TR>
        <TR><TD>Ben L</TD><TD><StatusCell tone="success">11/11 · 3/5</StatusCell></TD><TD><StatusCell tone="danger" title="stuck on the lab for 3 days">2/10</StatusCell></TD><TD><StatusCell>0/10</StatusCell></TD></TR>
      </TBody>
    </Table>
  ),
};

export const TimeZones: StoryObj = {
  name: "ZonedDateTimeInput + formatInTimeZone",
  parameters: { docs: { description: { story: "Pick a date and time in the batch's time zone; the value is stored as UTC. formatInTimeZone shows it back with the zone's name." } } },
  render: function Render() {
    const [value, setValue] = useState<string | null>("2026-10-12T03:30:00.000Z");
    return (
      <Stack gap="3">
        <Field label="Day 1 opens"><ZonedDateTimeInput value={value} onChange={setValue} timeZone="Asia/Kolkata" /></Field>
        <Text size="sm" tone="muted">Stored (UTC): <code>{value ?? "not set"}</code></Text>
        <Text size="sm">In Kolkata: {formatInTimeZone(value, "Asia/Kolkata")} · In London: {formatInTimeZone(value, "Europe/London")}</Text>
      </Stack>
    );
  },
};

export const ConsentStory: StoryObj = {
  name: "useConsent + ConsentDialog + CookieSettings",
  parameters: { docs: { description: { story: "Opt-in for one optional purpose (usually analytics): nothing loads until the user accepts, declining is as easy, and withdrawing calls onRevoke (delete cookies with clearCookies, then reload)." } } },
  render: function Render() {
    const [key] = useState(() => `story-consent-${Math.random()}`);
    const [log, setLog] = useState<string[]>([]);
    const consent = useConsent({ key, onGrant: () => setLog((l) => [...l, "onGrant: load analytics"]), onRevoke: () => setLog((l) => [...l, "onRevoke: clear cookies"]) });
    return (
      <Stack gap="3" style={{ maxWidth: 560 }}>
        <CookieSettings consent={consent} service="Google Analytics" />
        <Text size="sm" tone="muted">{log.join(" → ") || "No analytics loaded yet."}</Text>
        <ConsentDialog open={consent.needsDecision} onDecide={consent.decide}
                       description="We'd like to use Google Analytics to see which pages are used. It stays off unless you accept, and the site works the same either way." />
      </Stack>
    );
  },
};

const sample = `{
  "title": "Decisions, loops & methods",
  "short": "Control flow",
  "summary": "Teach the program to choose and repeat.",
  "steps": [
    {
      "id": "quiz",
      "kind": "quiz",
      "title": "Check yourself",
      "quiz": [
        { "q": "7 / 2 in Java?", "options": ["3.5", "3"], "answer": 5, "explain": "Integer division." }
      ]
    }
  ]
}`;

export const Editor: StoryObj = {
  name: "CodeEditor",
  parameters: { docs: { description: { story: "Highlighted, editable code with line numbers. Pass `errors` (line + message) to mark the gutter and list problems; clicking one jumps to its line. Tab indents, Shift+Tab outdents, Escape then Tab moves focus on, Ctrl/⌘+S calls onSave. findJsonPathLine maps a validation path to its line; jsonSyntaxError finds the line of a JSON typo." } } },
  render: function Render() {
    const [text, setText] = useState(sample);
    const errors = useMemo(() => {
      const syntax = jsonSyntaxError(text);
      if (syntax) return [{ line: syntax.line, message: syntax.message }];
      const path = "steps.0.quiz.0.answer";
      return JSON.parse(text).steps?.[0]?.quiz?.[0]?.answer > 1 ? [{ line: findJsonPathLine(text, path) ?? 1, message: `${path}: answer 5 but only 2 options` }] : [];
    }, [text]);
    return (
      <div style={{ maxWidth: 720 }}>
        <Field label="Day JSON" hint="Try changing the answer to 1, or deleting a comma."><CodeEditor language="json" value={text} onChange={setText} errors={errors} maxHeight="22rem" /></Field>
      </div>
    );
  },
};
