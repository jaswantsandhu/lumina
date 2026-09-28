import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ChatComposer, Combobox, DataTable, Disclosure, Field, NumberInput, PasswordInput, Progress, SplitView, StatCard, Timeline } from "../index";

describe("Progress", () => {
  it("is a meter whose tone follows the thresholds", () => {
    const { rerender } = render(<Progress value={50} max={100} aria-label="Tokens used" />);
    const meter = screen.getByRole("meter", { name: "Tokens used" });
    expect(meter).toHaveAttribute("aria-valuenow", "50");
    expect(meter.firstElementChild).toHaveClass("lm-progress__fill--accent");
    rerender(<Progress value={85} max={100} aria-label="Tokens used" />);
    expect(screen.getByRole("meter").firstElementChild).toHaveClass("lm-progress__fill--warning");
    rerender(<Progress value={120} max={100} aria-label="Tokens used" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("meter").firstElementChild).toHaveClass("lm-progress__fill--danger");
  });
  it("uses a visible label as its name", () => {
    render(<Progress value={1} max={4} label="Plan" valueText="1 of 4" />);
    expect(screen.getByRole("meter", { name: "Plan" })).toHaveAttribute("aria-valuetext", "1 of 4");
  });
});

it("StatCard shows label, value, hint and trend", () => {
  render(<StatCard label="Tasks" value="42" hint="this week" trend={{ value: "+5%", tone: "positive" }} />);
  expect(screen.getByText("42")).toBeInTheDocument();
  expect(screen.getByText("+5%")).toHaveClass("lm-stat__trend--positive");
});

it("Disclosure toggles with aria-expanded", async () => {
  render(<Disclosure summary="Details">Hidden stuff</Disclosure>);
  const button = screen.getByRole("button", { name: /Details/ });
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("Hidden stuff")).not.toBeVisible();
  await userEvent.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Hidden stuff")).toBeVisible();
});

it("Timeline expands a step's detail", async () => {
  render(<Timeline aria-label="Activity" items={[{ id: "1", title: "bash", status: { label: "running", tone: "info" }, live: true, detail: "echo hi" }, { id: "2", title: "Thinking" }]} />);
  expect(screen.getByRole("list", { name: "Activity" }).children).toHaveLength(2);
  const step = screen.getByRole("button", { name: /bash/ });
  expect(screen.queryByText("echo hi")).toBeNull();
  await userEvent.click(step);
  expect(step).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("echo hi")).toBeInTheDocument();
});

it("PasswordInput shows and hides the password", async () => {
  render(
    <Field label="Password">
      <PasswordInput defaultValue="s3cret" />
    </Field>,
  );
  const input = screen.getByLabelText("Password");
  expect(input).toHaveAttribute("type", "password");
  await userEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(input).toHaveAttribute("type", "text");
  expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
});

it("NumberInput reports numbers and clamps on blur", async () => {
  const seen: (number | null)[] = [];
  function Demo() {
    const [v, setV] = useState<number | null>(4);
    return (
      <Field label="CPUs">
        <NumberInput value={v} onValueChange={(n) => (seen.push(n), setV(n))} min={1} max={8} suffix="cores" />
      </Field>
    );
  }
  render(<Demo />);
  const input = screen.getByLabelText("CPUs");
  await userEvent.clear(input);
  await userEvent.type(input, "12");
  fireEvent.blur(input);
  expect(input).toHaveValue("8");
  expect(seen.at(-1)).toBe(8);
  await userEvent.clear(input);
  expect(seen.at(-1)).toBeNull();
  expect(screen.getByText("cores")).toBeInTheDocument();
});

describe("Combobox", () => {
  function Demo({ allowCustom = true }: { allowCustom?: boolean }) {
    const [v, setV] = useState("");
    return (
      <>
        <Field label="Model">
          <Combobox value={v} onValueChange={setV} options={["gpt-4.1", "gpt-4.1-mini", { value: "claude-sonnet", description: "Anthropic" }]} allowCustom={allowCustom} />
        </Field>
        <output>{v}</output>
      </>
    );
  }
  it("filters, moves with arrows and picks with Enter", async () => {
    render(<Demo />);
    const box = screen.getByRole("combobox", { name: "Model" });
    await userEvent.type(box, "gpt");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(document.querySelector("output")).toHaveTextContent("gpt-4.1-mini");
    expect(box).toHaveAttribute("aria-expanded", "false");
  });
  it("accepts typed text when custom values are allowed", async () => {
    render(<Demo />);
    const box = screen.getByRole("combobox");
    await userEvent.type(box, "my-own-model{Enter}");
    expect(document.querySelector("output")).toHaveTextContent("my-own-model");
  });
  it("Escape closes without changing the value", async () => {
    render(<Demo />);
    const box = screen.getByRole("combobox");
    await userEvent.type(box, "claude");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.querySelector("output")).toHaveTextContent("");
  });
});

it("ChatComposer sends on Enter and adds a line on Shift+Enter", async () => {
  const sent: string[] = [];
  function Demo() {
    const [v, setV] = useState("");
    return <ChatComposer value={v} onValueChange={setV} onSend={() => (sent.push(v), setV(""))} />;
  }
  render(<Demo />);
  const box = screen.getByRole("textbox", { name: "Message" });
  await userEvent.type(box, "hello{Shift>}{Enter}{/Shift}world");
  expect(box).toHaveValue("hello\nworld");
  expect(sent).toHaveLength(0);
  await userEvent.type(box, "{Enter}");
  expect(sent).toEqual(["hello\nworld"]);
  expect(box).toHaveValue("");
});

it("SplitView offers a back link to the list", async () => {
  let back = 0;
  render(
    <SplitView list={<p>List</p>} showDetail onBack={() => back++} backLabel="All tasks">
      <p>Detail</p>
    </SplitView>,
  );
  await userEvent.click(screen.getByRole("button", { name: /All tasks/ }));
  expect(back).toBe(1);
});

it("DataTable labels cells for the phone card layout", () => {
  render(<DataTable caption="People" columns={[{ key: "name", header: "Name" }, { key: "age", header: "Age" }]} rows={[{ id: "1", name: "Ada", age: 36 }]} getRowId={(r) => r.id} />);
  expect(screen.getByText("Ada").closest("td")).toHaveAttribute("data-label", "Name");
  expect(screen.getByRole("table", { name: "People" }).closest(".lm-datatable")).toHaveClass("lm-datatable--cards");
});
