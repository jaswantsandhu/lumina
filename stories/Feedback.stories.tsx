import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Alert, Button, Dialog, Field, Input, Stack, Text, Tooltip, useToast, IconButton } from "../src/index";

export default { title: "Feedback/Components", tags: ["autodocs"] } satisfies Meta;

export const Alerts: StoryObj = {
  render: () => (
    <Stack gap="3" style={{ maxWidth: 640 }}>
      <Alert tone="info" title="Heads up">Changes are saved automatically.</Alert>
      <Alert tone="success">Saved. Your changes are live.</Alert>
      <Alert tone="warning" title="Storage 80% used" action={<Button size="sm">Upgrade</Button>}>16 GB of 20 GB.</Alert>
      <Alert tone="danger" title="Build failed" onDismiss={() => {}}>Step "test" exited with code 1.</Alert>
      <Alert tone="neutral">A neutral note.</Alert>
    </Stack>
  ),
};

export const Toasts: StoryObj = {
  render: function Render() {
    const { toast } = useToast();
    return (
      <Stack direction="row" gap="2" wrap>
        <Button onClick={() => toast({ title: "Invite sent", description: "Ada will get an email.", tone: "success" })}>Success</Button>
        <Button onClick={() => toast({ title: "Review requested", description: "Grace asked you to review a change", tone: "warning" })}>Warning</Button>
        <Button onClick={() => toast({ title: "Couldn't reach the server", tone: "danger", duration: 0 })}>Error (sticky)</Button>
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
          title="Delete the website project?"
          description="Its history and files are removed. This can't be undone."
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

export const RequiredChoiceDialog: StoryObj = {
  name: "Dialog: required choice",
  parameters: { docs: { description: { story: "`dismissible={false}` removes the close button and ignores Escape and backdrop clicks, so the user must pick a footer button. Use it for decisions like cookie consent, and keep every option equally easy." } } },
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [choice, setChoice] = useState<string | null>(null);
    const decide = (c: string) => {
      setChoice(c);
      setOpen(false);
    };
    return (
      <Stack gap="3" align="flex-start">
        <Button onClick={() => setOpen(true)}>Show consent dialog</Button>
        {choice && <Text tone="muted">You chose: {choice}</Text>}
        <Dialog
          open={open}
          dismissible={false}
          title="Can we use analytics?"
          description="Google Analytics helps us see which pages are used. It stays off unless you accept, and the site works the same either way."
          footer={
            <>
              <Button onClick={() => decide("Decline")}>Decline</Button>
              <Button onClick={() => decide("Accept")}>Accept analytics</Button>
            </>
          }
        />
      </Stack>
    );
  },
};
