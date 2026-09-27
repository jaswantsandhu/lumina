import type { Meta, StoryObj } from "@storybook/react";
import { Button, DropdownMenu, IconButton, Stack, useToast } from "../src/index";

export default { title: "Actions/DropdownMenu", tags: ["autodocs"] } satisfies Meta;

export const Actions: StoryObj = {
  render: function Render() {
    const { toast } = useToast();
    const say = (title: string) => () => toast({ title });
    return (
      <Stack direction="row" gap="4" style={{ minHeight: 260 }}>
        <DropdownMenu
          trigger={(p) => <Button {...p} trailingIcon={<span aria-hidden>▾</span>}>Task actions</Button>}
          items={[
            { type: "label", label: "Task" },
            { label: "Retry", onSelect: say("Retrying"), icon: "↻", shortcut: "R" },
            { label: "Duplicate", onSelect: say("Duplicated"), icon: "⧉" },
            { label: "Move to another team", onSelect: () => {}, disabled: true },
            { type: "separator" },
            { label: "Cancel task", onSelect: say("Cancelled"), danger: true, icon: "✕" },
          ]}
        />
        <DropdownMenu
          align="end"
          trigger={(p) => <IconButton {...p} aria-label="More options" icon={<span aria-hidden>⋯</span>} />}
          items={[
            { label: "Edit agent", onSelect: say("Edit") },
            { label: "Export definitions", onSelect: say("Exported") },
            { type: "separator" },
            { label: "Remove from team", onSelect: say("Removed"), danger: true },
          ]}
        />
      </Stack>
    );
  },
};
