import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Alert, Button, Dialog, Field, Input, Stack, Tooltip, useToast, IconButton } from "../src/index";

export default { title: "Feedback/Components", tags: ["autodocs"] } satisfies Meta;

export const Alerts: StoryObj = {
  render: () => (
    <Stack gap="3" style={{ maxWidth: 640 }}>
      <Alert tone="info" title="Heads up">The lead delegates hands-on work to sub-agents.</Alert>
      <Alert tone="success">Saved. The agent's container is being recreated.</Alert>
      <Alert tone="warning" title="Budget 80% used" action={<Button size="sm">Raise budget</Button>}>16,000 of 20,000 tokens.</Alert>
      <Alert tone="danger" title="Subtask failed" onDismiss={() => {}}>bash: The user rejected permission to use this specific tool call.</Alert>
      <Alert tone="neutral">A neutral note.</Alert>
    </Stack>
  ),
};

export const Toasts: StoryObj = {
  render: function Render() {
    const { toast } = useToast();
    return (
      <Stack direction="row" gap="2" wrap>
        <Button onClick={() => toast({ title: "Task assigned", description: "The lead is on it.", tone: "success" })}>Success</Button>
        <Button onClick={() => toast({ title: "Approval needed", description: "coder wants to run rm -rf build", tone: "warning" })}>Warning</Button>
        <Button onClick={() => toast({ title: "Couldn't reach the model", tone: "danger", duration: 0 })}>Error (sticky)</Button>
      </Stack>
    );
  },
};

export const DialogStory: StoryObj = {
  name: "Dialog",
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete team…</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Delete the research team?"
          description="Its history and agent containers are removed. This can't be undone."
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="danger" disabled={text !== "research"} onClick={() => setOpen(false)}>Delete team</Button>
            </>
          }
        >
          <Field label='Type "research" to confirm'>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
        </Dialog>
      </>
    );
  },
};

export const Tooltips: StoryObj = {
  render: () => (
    <Stack direction="row" gap="3" style={{ paddingTop: 40 }}>
      <Tooltip content="Recreates the container with the new settings">
        <Button variant="primary">Save and apply</Button>
      </Tooltip>
      <Tooltip content="Refresh" side="bottom">
        <IconButton aria-label="Refresh" icon={<span aria-hidden>↻</span>} />
      </Tooltip>
    </Stack>
  ),
};
