import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Checklist, CodeView, Prose, Quiz, SequenceDiagram, StepDiagram, markdownComponents } from "../src/index";

export default {
  title: "Learning/Components",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Building blocks for courses, docs and onboarding: step-through diagrams (boxes and arrows, or sequences over time), quizzes, checklists, and Markdown rendered with Lumina components.",
      },
    },
  },
} satisfies Meta;

const wrap = (node: React.ReactNode) => <div style={{ maxWidth: 820 }}>{node}</div>;

export const ManualLayout: StoryObj = {
  name: "StepDiagram: placed by hand",
  render: () =>
    wrap(
      <StepDiagram
        title="From source code to a running program"
        nodes={[
          { id: "src", label: "Hello.java", sub: "you write this", x: 90, y: 60 },
          { id: "javac", label: "Compiler", sub: "checks + translates", x: 290, y: 60 },
          { id: "bc", label: "Bytecode", sub: ".class", x: 480, y: 60 },
          { id: "jvm", label: "JVM", sub: "runs it", x: 660, y: 60 },
        ]}
        edges={[
          { id: "a", from: "src", to: "javac" },
          { id: "b", from: "javac", to: "bc" },
          { id: "c", from: "bc", to: "jvm" },
        ]}
        steps={[
          { active: ["src"], caption: "You write source code: plain text in a .java file." },
          { active: ["javac", "a"], caption: "The compiler checks it. Mistakes are caught before the program runs." },
          { active: ["bc", "b"], caption: "It produces bytecode, the same on every operating system." },
          { active: ["jvm", "c"], caption: "The JVM runs the bytecode on your computer." },
        ]}
      />,
    ),
};

export const AutoLayout: StoryObj = {
  name: "StepDiagram: automatic layout, loops and groups",
  parameters: { docs: { description: { story: "Leave out x/y and the diagram lays itself out (`direction` LR or TB). Loops back are curved automatically; `groups` draw a box around related nodes; boxes size to their text." } } },
  render: () =>
    wrap(
      <StepDiagram
        title="An agent loop (automatic layout)"
        direction="LR"
        nodes={[
          { id: "goal", label: "Goal", sub: "user question" },
          { id: "model", label: "Model", sub: "decides next step" },
          { id: "tools", label: "Tools", sub: "lookup_merchant, get_fx_rate" },
          { id: "answer", label: "Answer" },
        ]}
        edges={[
          { id: "e1", from: "goal", to: "model" },
          { id: "e2", from: "model", to: "tools", label: "tool call" },
          { id: "e3", from: "tools", to: "model", label: "result" },
          { id: "e4", from: "model", to: "answer", label: "done" },
        ]}
        groups={[{ id: "loop", label: "The loop", nodes: ["model", "tools"] }]}
        steps={[
          { active: ["goal", "e1"], caption: "A goal arrives." },
          { active: ["model", "tools", "e2", "loop"], caption: "The model asks for a tool." },
          { active: ["tools", "model", "e3", "loop"], caption: "Your code runs it and returns the result." },
          { active: ["answer", "e4"], caption: "No more tool calls: answer." },
        ]}
      />,
    ),
};

const lostUpdate = `void add(long amount) {
    long now = cents;      // 1. read
    now = now + amount;    // 2. add
    cents = now;           // 3. write
}`;

export const ChangingValues: StoryObj = {
  name: "StepDiagram: changing values + linked code",
  parameters: { docs: { description: { story: "`values` changes a node's text from that step on (it flashes once); `code` + `lines` highlight the matching code at each step." } } },
  render: () =>
    wrap(
      <StepDiagram
        title="Pipeline: total card volume"
        direction="LR"
        nodes={[
          { id: "src", label: "payments", sub: "7 items" },
          { id: "filter", label: "filter", sub: "method is CARD" },
          { id: "map", label: "map", sub: "Payment::amount" },
          { id: "reduce", label: "reduce", sub: "total = 0" },
        ]}
        edges={[
          { id: "a", from: "src", to: "filter" },
          { id: "b", from: "filter", to: "map" },
          { id: "c", from: "map", to: "reduce" },
        ]}
        code={{
          title: "Streams.java",
          language: "java",
          code: `BigDecimal cardTotal = payments.stream()\n        .filter(p -> p.method().equals("CARD"))\n        .map(Payment::amount)\n        .reduce(BigDecimal.ZERO, BigDecimal::add);`,
        }}
        steps={[
          { active: ["src"], caption: "Start a stream from the list.", lines: [1] },
          { active: ["filter", "a"], values: { a: "7 payments" }, caption: "filter keeps the card payments.", lines: [2] },
          { active: ["map", "b"], values: { b: "4 payments" }, caption: "map turns each payment into its amount.", lines: [3] },
          { active: ["reduce", "c"], values: { c: "4 amounts", reduce: { sub: "total = 640.75" } }, caption: "reduce adds them up: 640.75.", lines: [4] },
        ]}
      />,
    ),
};

export const Sequence: StoryObj = {
  name: "SequenceDiagram: a race condition",
  parameters: { docs: { description: { story: "Participants across the top, time going down. `values` shows each participant's state; here the shared balance ends up wrong." } } },
  render: () =>
    wrap(
      <SequenceDiagram
        title="A lost update: two threads, one balance"
        participants={[
          { id: "a", label: "Thread A" },
          { id: "m", label: "Memory", sub: "shared balance" },
          { id: "b", label: "Thread B" },
        ]}
        messages={[
          { id: "ra", from: "m", to: "a", label: "read 100", reply: true },
          { id: "rb", from: "m", to: "b", label: "read 100", reply: true },
          { id: "wa", from: "a", to: "m", label: "write 101" },
          { id: "wb", from: "b", to: "m", label: "write 101" },
        ]}
        code={{ title: "UnsafeBalance.java", language: "java", code: lostUpdate }}
        steps={[
          { show: ["ra"], active: ["ra"], values: { m: "balance = 100" }, caption: "Thread A reads 100.", lines: [2] },
          { show: ["rb"], active: ["rb"], caption: "Before A writes, Thread B also reads 100.", lines: [2] },
          { show: ["wa"], active: ["wa"], values: { m: "balance = 101" }, caption: "A adds 1 and writes 101.", lines: [3, 4] },
          { show: ["wb"], active: ["wb", "m"], values: { m: "balance = 101 ✗" }, caption: "B also writes 101. Two payments, one counted.", lines: [4] },
        ]}
      />,
    ),
};

export const SequenceAuto: StoryObj = {
  name: "SequenceDiagram: one step per message",
  render: () =>
    wrap(
      <SequenceDiagram
        title="Recording a payment"
        participants={[
          { id: "c", label: "Client" },
          { id: "s", label: "Ledger API" },
          { id: "d", label: "Ledger" },
        ]}
        messages={[
          { id: "1", from: "c", to: "s", label: "POST /payments CRUX,12.00" },
          { id: "2", from: "s", to: "s", label: "validate" },
          { id: "3", from: "s", to: "d", label: "compute(CRUX)" },
          { id: "4", from: "d", to: "s", label: "accepted", reply: true },
          { id: "5", from: "s", to: "c", label: "201 Created", reply: true },
        ]}
      />,
    ),
};

export const QuizStory: StoryObj = {
  name: "Quiz",
  render: () =>
    wrap(
      <Quiz
        questions={[
          { question: "What does 7 / 2 print in Java?", options: ["3.5", "3", "4"], answer: 1, explanation: "int / int drops the decimals. Use 7 / 2.0 for 3.5." },
          { question: "Which type should hold money?", options: ["double", "float", "BigDecimal"], answer: 2, explanation: "double can't store most decimals exactly." },
        ]}
      />,
    ),
};

export const ChecklistStory: StoryObj = {
  name: "Checklist",
  render: function Render() {
    const [done, setDone] = useState<string[]>(["install"]);
    return wrap(
      <Checklist
        label="Lab progress"
        checked={done}
        onToggle={(id, on) => setDone((d) => (on ? [...d, id] : d.filter((x) => x !== id)))}
        items={[
          { id: "install", title: "Install JDK 25", content: "Download Temurin 25 from adoptium.net." },
          { id: "check", title: "Check it works", content: <CodeView code="java -version" language="sh" lineNumbers={false} title="Run" /> },
          { id: "run", title: "Run your first program" },
        ]}
      />,
    );
  },
};

const md = `## Fees by payment method

Northstar charges **different fees** for each method:

| Method | Fee |
|---|---|
| CARD | 2.9% + 0.30 |
| BANK | 0.8%, max 5.00 |

> Never use \`double\` for money.

\`\`\`sh
java FeeByMethod.java
\`\`\`

- Compare text with \`equals\`
- Prefer the arrow \`switch\`

[Privacy](/privacy) · [dev.java](https://dev.java)`;

export const Markdown: StoryObj = {
  name: "Prose + markdownComponents",
  parameters: { docs: { description: { story: "`<Prose><ReactMarkdown components={markdownComponents()}>…` renders Markdown as Lumina headings, tables, callouts and highlighted code. Pass `onInternalLink` to route in-app links without a page load." } } },
  render: () =>
    wrap(
      <Prose>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents({ onInternalLink: () => {} })}>
          {md}
        </ReactMarkdown>
      </Prose>,
    ),
};
