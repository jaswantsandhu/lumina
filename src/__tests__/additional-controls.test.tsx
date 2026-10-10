import { createRef, useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";
import { Slider } from "../components/Slider";
import { ButtonGroup } from "../components/ButtonGroup";
import { SplitButton } from "../components/SplitButton";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

describe("DatePicker", () => {
  it("submits its date to an explicitly associated external form", () => {
    render(<><form id="booking" data-testid="booking" /><DatePicker form="booking" name="date" value="2024-02-28" onValueChange={vi.fn()} /></>);
    expect(new FormData(screen.getByTestId("booking") as HTMLFormElement).get("date")).toBe("2024-02-28");
  });
  it("dismisses when focus moves outside without stealing the new focus", async () => {
    render(<><DatePicker value="2024-02-28" onValueChange={vi.fn()} /><Button>Outside</Button></>);
    await userEvent.click(screen.getByRole("button", { name: "2024-02-28" }));
    act(() => { screen.getByRole("button", { name: "Outside" }).focus(); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
  });
  it("selects a leap day as a controlled date-only string and returns focus", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    function Example() {
      const [value, setValue] = useState("2024-02-28");
      return <Field label="Booking" hint="Date only" required><DatePicker ref={ref} className="custom" name="booking" value={value} onValueChange={(date) => { change(date); setValue(date); }} /></Field>;
    }
    const { container } = render(<Example />);
    const trigger = screen.getByRole("button", { name: "Booking" });
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveClass("custom");
    expect(trigger).toHaveAttribute("aria-describedby");
    expect(trigger).toHaveAttribute("aria-required", "true");
    await user.click(trigger);
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "2024-02-28" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(change).toHaveBeenCalledWith("2024-02-29");
    expect(trigger).toHaveTextContent("2024-02-29");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelector('input[name="booking"]')).toHaveValue("2024-02-29");
  });
  it("disables min/max days and clamps keyboard navigation at the inclusive bounds", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<DatePicker value="2024-02-28" min="2024-02-28" max="2024-03-02" onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "2024-02-28" }));
    expect(screen.getByRole("button", { name: "2024-02-27" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "2024-02-27" }));
    expect(change).not.toHaveBeenCalled();
    act(() => { within(screen.getByRole("dialog")).getByRole("button", { name: "2024-02-28" }).focus(); });
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await user.keyboard("{ArrowLeft}");
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "2024-02-28" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "2024-03-02" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "2024-03-03" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(change).toHaveBeenCalledWith("2024-03-02");
  });
  it("browses months, clamps month ends, supports week boundaries and Escape", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2024-01-31" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("button");
    trigger.focus();
    await user.keyboard("{ArrowDown}{PageDown}");
    expect(screen.getByRole("button", { name: "2024-02-29" })).toHaveFocus();
    await user.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(screen.getByRole("button", { name: "2025-02-28" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "2025-02-23" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "2025-03-01" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("button", { name: "2025-02-01" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("handles non-leap centuries and year rollover without timestamps", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="1900-02-28" onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "1900-03-01" })).toHaveFocus();
    await user.keyboard("{PageUp}");
    expect(screen.queryByRole("button", { name: "1900-02-29" })).not.toBeInTheDocument();
    await user.keyboard("{PageUp}{Home}{ArrowLeft}");
    expect(screen.getByText("December 1899")).toBeInTheDocument();
  });
  it("does not mutate the controlled value, closes outside, and cannot open when disabled", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<DatePicker value="2024-02-28" onValueChange={change} />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "2024-02-29" }));
    expect(trigger).toHaveTextContent("2024-02-28");
    await user.click(trigger);
    await user.click(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(<DatePicker disabled value="2024-02-28" onValueChange={change} />);
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("updates an open calendar when bounds change and closes on Tab", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<><DatePicker aria-label="Date" value="2024-02-29" onValueChange={change} /><Button>Next field</Button></>);
    await user.click(screen.getByRole("button", { name: "Date" }));
    rerender(<><DatePicker aria-label="Date" value="2024-02-29" min="2024-03-01" onValueChange={change} /><Button>Next field</Button></>);
    expect(screen.getByRole("button", { name: "2024-03-01" })).toHaveFocus();
    await user.tab();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
  });
  it("supports the final date without navigating beyond four-digit years", async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Date" value="9999-12-31" onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    await user.keyboard("{ArrowRight}{PageDown}");
    expect(screen.getByRole("button", { name: "9999-12-31" })).toHaveFocus();
  });
});

describe("Slider", () => {
  it("forwards a native range ref, Field metadata, bounds, step and numeric changes", () => {
    const ref = createRef<HTMLInputElement>();
    const change = vi.fn();
    const nativeChange = vi.fn();
    render(<Field label="Volume" error="Check volume" required><Slider ref={ref} className="custom" min={10} max={50} step={5} defaultValue={20} onValueChange={change} onChange={nativeChange} /></Field>);
    const input = screen.getByRole("slider", { name: "Volume" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("type", "range");
    expect(input).toHaveAttribute("min", "10");
    expect(input).toHaveAttribute("max", "50");
    expect(input).toHaveAttribute("step", "5");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("Check volume");
    expect(input).toHaveClass("custom");
    fireEvent.change(input, { target: { value: "35" } });
    expect(change).toHaveBeenCalledWith(35);
    expect(nativeChange).toHaveBeenCalledOnce();
  });
  it("preserves native Tab focus and skips disabled ranges", async () => {
    const user = userEvent.setup();
    render(<><Slider aria-label="Enabled" defaultValue={25} /><Slider aria-label="Disabled" disabled /><Button>Next</Button></>);
    await user.tab();
    expect(screen.getByRole("slider", { name: "Enabled" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });
});

describe("ButtonGroup and SplitButton", () => {
  it("groups Buttons without replacing their native keyboard behavior", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(<ButtonGroup ref={ref} className="custom" orientation="vertical" aria-label="History"><Button onClick={click}>Undo</Button><Button disabled>Redo</Button><Button>Reset</Button></ButtonGroup>);
    expect(ref.current).toBe(screen.getByRole("group", { name: "History" }));
    expect(ref.current).toHaveClass("custom", "lm-button-group--vertical");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(click).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
  });
  it("keeps the primary action separate and reuses menu keyboard navigation", async () => {
    const user = userEvent.setup();
    const primary = vi.fn();
    const secondary = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<SplitButton ref={ref} className="custom" groupLabel="Save" menuLabel="More save options" onClick={primary} items={[
      { label: "Draft", onSelect: secondary },
      { label: "Unavailable", disabled: true, onSelect: vi.fn() },
      { label: "Close", onSelect: secondary },
    ]}>Save</SplitButton>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("group", { name: "Save" })).toHaveClass("custom");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(primary).toHaveBeenCalledOnce();
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Draft" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Close" })).toHaveFocus();
    await user.keyboard("{Home}{Enter}");
    expect(secondary).toHaveBeenCalledOnce();
    expect(primary).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "More save options" })).toHaveFocus();
  });
  it("disables both actions while loading", async () => {
    const user = userEvent.setup();
    render(<SplitButton loading menuLabel="Options" items={[{ label: "Draft", onSelect: vi.fn() }]}>Save</SplitButton>);
    expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Options" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Options" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
