import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, Stack, Text } from "../src/index";
import { tokens } from "../src/tokens";
import { useState } from "react";
import { Field } from "../src/components/Field";
import { Breadcrumb } from "../src/components/Breadcrumb";
import { RadioGroup } from "../src/components/RadioGroup";
import { SegmentedControl } from "../src/components/SegmentedControl";
import { Accordion } from "../src/components/Accordion";
import { Pagination } from "../src/components/Pagination";
import "../src/components/Breadcrumb.css";
import "../src/components/RadioGroup.css";
import "../src/components/SegmentedControl.css";
import "../src/components/Accordion.css";
import "../src/components/Pagination.css";

const meta: Meta = { title: "Foundations/Tokens", parameters: { layout: "fullscreen" } };
export default meta;

export const BreadcrumbNavigation: StoryObj<typeof Breadcrumb> = {
  render: () => <Card><Breadcrumb items={[{ label: "Home", href: "#home" }, { label: "Projects", href: "#projects" }, { label: "Lumina" }]} /></Card>,
};

export const RadioSelection: StoryObj<typeof RadioGroup> = {
  render: function Render() {
    const [value, setValue] = useState("weekly");
    return <Card><Field label="Delivery schedule" hint="Choose how often to receive reports." required>
      <RadioGroup aria-label="Delivery schedule" name="schedule" value={value} onValueChange={setValue} options={[
        { value: "daily", label: "Daily", description: "A report every morning." },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly", disabled: true },
      ]} />
    </Field></Card>;
  },
};

export const SegmentedSelection: StoryObj<typeof SegmentedControl> = {
  render: function Render() {
    const [value, setValue] = useState("list");
    return <Card><SegmentedControl label="Display mode" value={value} onValueChange={setValue} items={[
      { value: "list", label: "List" }, { value: "grid", label: "Grid" }, { value: "map", label: "Map", disabled: true },
    ]} /><Text>Selected: {value}</Text></Card>;
  },
};

const accordionItems = [
  { value: "setup", label: "Getting started", content: "Install Lumina and load its styles." },
  { value: "themes", label: "Themes", content: "Semantic tokens adapt to light and dark themes." },
  { value: "future", label: "Coming soon", content: "More examples.", disabled: true },
];

export const AccordionSingle: StoryObj<typeof Accordion> = {
  render: () => <Card><Accordion items={accordionItems} defaultValue={["setup"]} /></Card>,
};

export const AccordionMultiple: StoryObj<typeof Accordion> = {
  render: function Render() {
    const [value, setValue] = useState(["setup", "themes"]);
    return <Card><Accordion items={accordionItems} multiple value={value} onValueChange={setValue} /></Card>;
  },
};

export const PageNavigation: StoryObj<typeof Pagination> = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return <Card><Stack gap="3"><Text>Page {page} of 20</Text><Pagination page={page} pageCount={20} onPageChange={setPage} /></Stack></Card>;
  },
};

const Swatch = ({ name, value }: { name: string; value: string }) => (
  <Stack gap="1" style={{ width: 132 }}>
    <div style={{ height: 48, borderRadius: "var(--lm-radius-md)", background: value, border: "1px solid var(--lm-color-border)" }} />
    <Text size="xs" mono>
      {name}
    </Text>
  </Stack>
);

export const SemanticColors: StoryObj = {
  name: "Semantic colours",
  render: () => (
    <Card>
      <CardHeader title="Semantic colours" description="Use these in components: they switch with the theme. Variable: --lm-color-<name>." />
      <Stack direction="row" wrap gap="4">
        {Object.keys(tokens.color.semantic.light).map((n) => (
          <Swatch key={n} name={n} value={`var(--lm-color-${n})`} />
        ))}
      </Stack>
    </Card>
  ),
};

export const Palette: StoryObj = {
  render: () => (
    <Stack gap="4">
      {Object.entries(tokens.color.palette).map(([name, shades]) => (
        <Card key={name}>
          <CardHeader title={name} description={`--lm-${name}-<shade>. Prefer semantic colours in UI code.`} />
          <Stack direction="row" wrap gap="2">
            {Object.keys(shades).map((shade) => (
              <Swatch key={shade} name={shade} value={`var(--lm-${name}-${shade})`} />
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <Card>
      <CardHeader title="Type scale" description="--lm-font-size-<step>, Inter for text and JetBrains Mono for code." />
      <Stack gap="3">
        {Object.entries(tokens.font.size).map(([k, v]) => (
          <Stack key={k} direction="row" gap="4" align="baseline">
            <Text size="xs" tone="muted" mono style={{ width: 72 }}>
              {k} · {v}
            </Text>
            <span style={{ fontSize: v }}>Design that stays out of the way.</span>
          </Stack>
        ))}
      </Stack>
    </Card>
  ),
};

export const SpacingRadiusShadow: StoryObj = {
  name: "Spacing, radius and shadow",
  render: () => (
    <Stack gap="4">
      <Card>
        <CardHeader title="Spacing" description="--lm-space-<step> (a 4px base; dots become underscores, e.g. --lm-space-1_5)." />
        <Stack direction="row" wrap gap="6" align="flex-end">
          {Object.entries(tokens.space)
            .filter(([k]) => k !== "0")
            .map(([k, v]) => (
              <Stack key={k} gap="1" align="center">
                <div style={{ width: v, height: 28, background: "var(--lm-color-accent)", borderRadius: 2 }} />
                <Text size="xs" mono>
                  {k}
                </Text>
              </Stack>
            ))}
        </Stack>
      </Card>
      <Card>
        <CardHeader title="Radius and shadow" />
        <Stack direction="row" wrap gap="4">
          {Object.keys(tokens.radius).map((k) => (
            <div key={k} style={{ width: 84, height: 56, border: "1px solid var(--lm-color-border-strong)", borderRadius: `var(--lm-radius-${k})`, display: "grid", placeItems: "center" }}>
              <Text size="xs" mono>
                radius {k}
              </Text>
            </div>
          ))}
          {Object.keys(tokens.shadow.light).map((k) => (
            <div key={k} style={{ width: 84, height: 56, background: "var(--lm-color-surface)", boxShadow: `var(--lm-shadow-${k})`, borderRadius: "var(--lm-radius-md)", display: "grid", placeItems: "center" }}>
              <Text size="xs" mono>
                shadow {k}
              </Text>
            </div>
          ))}
        </Stack>
      </Card>
    </Stack>
  ),
};
