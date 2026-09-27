import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  ListItem,
  NavItem,
  Select,
  Switch,
  TabPanel,
  Tabs,
  Textarea,
  ToastProvider,
  useToast,
} from "../index";
import { tokens, vars } from "../tokens";

describe("tokens", () => {
  it("exposes values and CSS variable references", () => {
    expect(tokens.color.palette.indigo["600"]).toBe("#5448e3");
    expect(vars["color-accent"]).toBe("var(--lm-color-accent)");
    expect(vars["space-4"]).toBe("var(--lm-space-4)");
  });
});

describe("Button", () => {
  it("renders a button and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("is disabled and busy while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("IconButton uses its aria-label as the name", () => {
    render(<IconButton aria-label="Close panel" icon={<span>×</span>} />);
    expect(screen.getByRole("button", { name: "Close panel" })).toBeInTheDocument();
  });
});

describe("Field", () => {
  it("labels the control and links the hint", () => {
    render(
      <Field label="Email" hint="We never share it">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and announces the error", () => {
    render(
      <Field label="Name" error="Required" required>
        <Textarea />
      </Field>,
    );
    const control = screen.getByLabelText(/Name/);
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toBeRequired();
    expect(control).toHaveAccessibleDescription("Required");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("works with Select", () => {
    render(
      <Field label="Role">
        <Select defaultValue="b">
          <option value="a">A</option>
          <option value="b">B</option>
        </Select>
      </Field>,
    );
    expect(screen.getByLabelText("Role")).toHaveValue("b");
  });
});

describe("Checkbox and Switch", () => {
  it("Checkbox toggles through its label", async () => {
    render(<Checkbox label="Remember me" />);
    const box = screen.getByLabelText("Remember me");
    await userEvent.click(screen.getByText("Remember me"));
    expect(box).toBeChecked();
  });

  it("Switch reports aria-checked and calls back", async () => {
    function Demo() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onCheckedChange={setOn} label="Notifications" />;
    }
    render(<Demo />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });
});

describe("Tabs", () => {
  function Demo() {
    const [tab, setTab] = useState("a");
    return (
      <>
        <Tabs label="Sections" value={tab} onValueChange={setTab} items={[{ value: "a", label: "One" }, { value: "b", label: "Two" }, { value: "c", label: "Three", disabled: true }]} />
        <TabPanel value="a" current={tab}>Panel one</TabPanel>
        <TabPanel value="b" current={tab}>Panel two</TabPanel>
      </>
    );
  }

  it("selects on click and shows the panel", async () => {
    render(<Demo />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one");
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
  });

  it("moves with arrow keys and skips disabled tabs", async () => {
    render(<Demo />);
    screen.getByRole("tab", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
  });
});

describe("Dialog", () => {
  it("opens as a labelled modal and closes via the close button", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open={false} onClose={onClose} title="Delete team" description="This can't be undone." />);
    rerender(<Dialog open onClose={onClose} title="Delete team" description="This can't be undone." />);
    const dialog = screen.getByRole("dialog", { name: "Delete team" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("This can't be undone.");
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("Escape calls onClose", () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="T" />);
    fireEvent(screen.getByRole("dialog", { hidden: true }), new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Toast", () => {
  it("shows and auto-dismisses a toast", () => {
    vi.useFakeTimers();
    function Demo() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: "Saved", tone: "success", duration: 1000 })}>go</button>;
    }
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("useToast outside the provider throws a helpful error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe("Display components", () => {
  it("Badge, Avatar, Alert, EmptyState, ListItem and NavItem render accessibly", () => {
    render(
      <>
        <Badge tone="success" dot>Online</Badge>
        <Avatar name="Ada Lovelace" />
        <Alert tone="danger" title="Failed">Retry later</Alert>
        <EmptyState title="No tasks" description="Assign one to get started" />
        <ListItem title="Chat" meta="2m ago" selected />
        <NavItem active count={3}>Approvals</NavItem>
      </>,
    );
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(screen.getByText("No tasks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chat/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /Approvals/ })).toHaveAttribute("aria-current", "page");
  });
});
