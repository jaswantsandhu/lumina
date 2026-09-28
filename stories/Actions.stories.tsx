import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button, IconButton, Spinner, Stack, Tooltip } from "../src/index";

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Button", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary", children: "Assign task" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete team" } };
export const Loading: Story = { args: { variant: "primary", loading: true, children: "Saving" } };
export const WithIcon: Story = { args: { variant: "primary", leadingIcon: <span aria-hidden>＋</span>, children: "New conversation" } };

export const AllVariants: Story = {
  render: () => (
    <Stack gap="3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stack key={size} direction="row" gap="2" align="center">
          <Button size={size} variant="primary">Primary</Button>
          <Button size={size}>Secondary</Button>
          <Button size={size} variant="ghost">Ghost</Button>
          <Button size={size} variant="danger">Danger</Button>
          <Button size={size} disabled>Disabled</Button>
        </Stack>
      ))}
    </Stack>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <Stack direction="row" gap="2" align="center">
      <Tooltip content="Refresh">
        <IconButton aria-label="Refresh" icon={<span aria-hidden>↻</span>} />
      </Tooltip>
      <IconButton aria-label="Settings" variant="secondary" icon={<span aria-hidden>⚙</span>} />
      <IconButton aria-label="Delete" variant="danger" icon={<span aria-hidden>🗑</span>} />
      <Spinner />
    </Stack>
  ),
};
