import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, Checkbox, Field, Input, Select, Stack, Switch, Textarea } from "../src/index";

export default { title: "Forms/Fields", component: Field, tags: ["autodocs"] } satisfies Meta<typeof Field>;

export const TextInput: StoryObj = {
  render: () => (
    <Stack gap="4" style={{ maxWidth: 420 }}>
      <Field label="Team name" hint="Lowercase letters, digits and dashes." required>
        <Input placeholder="research" />
      </Field>
      <Field label="Email" error="That email is already in use.">
        <Input type="email" defaultValue="ada@example.com" />
      </Field>
      <Field label="Search" hideLabel>
        <Input placeholder="Search tasks…" leading={<span aria-hidden>⌕</span>} />
      </Field>
      <Field label="Disabled">
        <Input disabled value="Can't edit this" readOnly />
      </Field>
    </Stack>
  ),
};

export const SelectAndTextarea: StoryObj = {
  name: "Select and textarea",
  render: () => (
    <Stack gap="4" style={{ maxWidth: 520 }}>
      <Field label="Role">
        <Select defaultValue="member">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      <Field label="Prompt" hint="Markdown. Shown to the agent as its system prompt.">
        <Textarea mono rows={6} defaultValue={"You are the coder on the demo team.\n\nWork only inside /workspace."} />
      </Field>
    </Stack>
  ),
};

export const ChoiceControls: StoryObj = {
  name: "Checkbox and switch",
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <Stack gap="4">
        <Checkbox label="Send a weekly summary" description="Every Monday at 09:00." defaultChecked />
        <Checkbox label="Disabled option" disabled />
        <Switch checked={on} onCheckedChange={setOn} label="Notify me about approvals" />
        <Switch checked={false} onCheckedChange={() => {}} label="Disabled switch" disabled />
      </Stack>
    );
  },
};

export const CompleteForm: StoryObj = {
  name: "Complete form",
  render: () => (
    <form style={{ maxWidth: 480 }} onSubmit={(e) => e.preventDefault()}>
      <Stack gap="4">
        <Field label="Schedule name" required>
          <Input placeholder="daily-report" />
        </Field>
        <Stack direction="row" gap="3">
          <Field label="Cron" hint="5 fields, or 6 with seconds." className="grow">
            <Input defaultValue="0 9 * * 1-5" />
          </Field>
          <Field label="Timezone">
            <Input defaultValue="Europe/London" />
          </Field>
        </Stack>
        <Field label="Instructions for the lead">
          <Textarea defaultValue="Summarise yesterday's completed tasks." />
        </Field>
        <Stack direction="row" gap="2" justify="flex-end">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary" type="submit">
            Create schedule
          </Button>
        </Stack>
      </Stack>
    </form>
  ),
};
