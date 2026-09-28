import type { Meta, StoryObj } from "@storybook/react";
import { Alert, Badge, Button, Card, CardHeader, Field, Gauge, Input, Progress, Sparkline, Stack, Switch, ThemeCustomizer } from "../src/index";
import { Chart } from "../src/charts";
import { useState } from "react";

export default {
  title: "Foundations/Themes",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Accent themes (rose, indigo, violet, sky, teal, emerald, amber, slate), density (compact / default / comfortable) and corner radius (sharp / default / round) are attributes on <html>: data-accent, data-density, data-radius. useAppearance() reads and sets them; ThemeCustomizer is a ready panel. Every accent meets WCAG AA for text on the accent, in light and dark.",
      },
    },
  },
} satisfies Meta;

export const Customizer: StoryObj = {
  name: "Theme customizer",
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <Stack gap="4" style={{ maxWidth: 760 }}>
        <Card>
          <CardHeader title="Appearance" description="Changes apply to the whole page." />
          <ThemeCustomizer />
        </Card>
        <Card>
          <CardHeader title="Preview" />
          <Stack gap="3">
            <Stack direction="row" gap="2" wrap>
              <Button variant="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="success">Success</Badge>
            </Stack>
            <Field label="Name">
              <Input placeholder="Ada" />
            </Field>
            <Switch label="Notifications" checked={on} onCheckedChange={setOn} />
            <Progress value={64} label="Plan used" />
            <Alert tone="info" title="Heads up">
              Charts and small charts follow the accent too.
            </Alert>
            <Stack direction="row" gap="4" align="center" wrap>
              <Gauge value={64} label="Plan used" size={96} />
              <div style={{ width: 200 }}>
                <Sparkline data={[3, 6, 4, 8, 7, 11, 9, 14]} type="area" label="Trend" />
              </div>
            </Stack>
            <Chart type="column" categories={["Mon", "Tue", "Wed", "Thu", "Fri"]} series={[{ name: "Runs", data: [4, 7, 5, 9, 8] }]} legend={false} height={200} />
          </Stack>
        </Card>
      </Stack>
    );
  },
};
