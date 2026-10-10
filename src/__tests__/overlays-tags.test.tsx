import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover } from "../components/PopoverComponent";
import { CommandPalette } from "../components/CommandPalette";
import { MultiSelect } from "../components/MultiSelect";
import { TagInput } from "../components/TagInput";
import { Field } from "../components/Field";

describe("Popover", () => {
  it("skips hidden inputs and hidden content when moving focus inside", async () => {
    render(<Popover label="Details" trigger={props => <button {...props}>Inspect</button>}><input type="hidden" /><div hidden><button>Hidden</button></div><button>Visible</button></Popover>);
    await userEvent.click(screen.getByText("Inspect"));
    expect(screen.getByRole("button", { name: "Visible" })).toHaveFocus();
  });
  it("opens from the keyboard, labels content, moves focus and restores it on Escape", async () => {
    render(<Popover label="Details" className="custom" trigger={props => <button {...props}>Inspect</button>}><button>Action</button></Popover>);
    const trigger = screen.getByRole("button", { name: "Inspect" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = screen.getByRole("dialog", { name: "Details" });
    expect(dialog).toHaveClass("custom");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    expect(screen.getByRole("button", { name: "Action" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("ignores inside clicks and dismisses outside without stealing focus", async () => {
    render(<><Popover label="Details" trigger={props => <button {...props}>Inspect</button>}><button>Inside</button></Popover><button>Outside</button></>);
    await userEvent.click(screen.getByText("Inspect"));
    await userEvent.click(screen.getByText("Inside"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Outside"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Outside")).toHaveFocus();
  });

  it("supports controlled visibility and defaultOpen", async () => {
    const change = vi.fn();
    const { rerender } = render(<Popover open onOpenChange={change} label="Details" trigger={props => <button {...props}>Inspect</button>}>Text</Popover>);
    await userEvent.keyboard("{Escape}");
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(<Popover open={false} label="Details" trigger={props => <button {...props}>Inspect</button>}>Text</Popover>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(<Popover key="default" defaultOpen label="Default" trigger={props => <button {...props}>Inspect</button>}>Text</Popover>);
    expect(screen.getByRole("dialog", { name: "Default" })).toBeInTheDocument();
  });

  it("places content in the enclosing dialog and dismisses on focus outside", async () => {
    render(<dialog open><Popover defaultOpen label="Nested" trigger={props => <button {...props}>Inspect</button>}>Text</Popover><button>Next</button></dialog>);
    const popup = screen.getByRole("dialog", { name: "Nested" });
    expect(popup.parentElement?.tagName).toBe("DIALOG");
    await userEvent.tab({ shift: true });
    expect(screen.queryByRole("dialog", { name: "Nested" })).not.toBeInTheDocument();
  });
});

describe("CommandPalette", () => {
  it("groups items, skips disabled commands and selects with keyboard", async () => {
    const select = vi.fn();
    const close = vi.fn();
    render(<CommandPalette open onClose={close} className="custom" items={[
      { id: "one", label: "First", group: "Workspace", onSelect: vi.fn() },
      { id: "disabled", label: "Unavailable", group: "Workspace", disabled: true, onSelect: vi.fn() },
      { id: "last", label: "Last", group: "Projects", onSelect: select },
    ]} />);
    expect(screen.getByRole("dialog")).toHaveClass("custom");
    expect(screen.getByRole("group", { name: "Workspace" })).toBeInTheDocument();
    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Last" }).id);
    await userEvent.keyboard("{Home}{End}{Enter}");
    expect(select).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("searches keywords, reports empty results, blocks disabled clicks and resets on reopen", async () => {
    const select = vi.fn();
    const props = { onClose: vi.fn(), items: [{ id: "new", label: "New project", keywords: ["create"], onSelect: select }, { id: "old", label: "Old project", disabled: true, onSelect: select }] };
    const { rerender } = render(<CommandPalette open {...props} />);
    await userEvent.click(screen.getByRole("option", { name: "Old project" }));
    expect(select).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole("combobox"), "create");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("combobox"), "missing");
    expect(screen.getByRole("status")).toHaveTextContent("No commands found");
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(select).not.toHaveBeenCalled();
    rerender(<CommandPalette open={false} {...props} />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(<CommandPalette open {...props} />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("requests dismissal on native Escape cancel and backdrop", () => {
    const close = vi.fn();
    render(<CommandPalette open onClose={close} items={[]} />);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(close).toHaveBeenCalledOnce();
    fireEvent.click(dialog);
    expect(close).toHaveBeenCalledTimes(2);
  });
});

describe("MultiSelect", () => {
  it("Backspace removes the last enabled chip even when the final chip is disabled", async () => {
    render(<MultiSelect defaultValue={["a", "b"]} options={[{ value: "a" }, { value: "b", disabled: true }]} aria-label="Members" />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove a" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove b" })).toBeDisabled();
  });
  it("submits selected values, not the query, and validates selection rather than draft text", async () => {
    const { container, rerender } = render(<form><MultiSelect name="members" required options={["a", "b"]} aria-label="Members" /></form>);
    const form = container.querySelector("form")!;
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "a");
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("members")).toEqual([]);
    await userEvent.keyboard("{Enter}");
    await userEvent.type(input, "draft");
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("members")).toEqual(["a"]);
    rerender(<form><MultiSelect name="members" required value={["a", "b"]} options={["a", "b"]} disabled aria-label="Members" /></form>);
    expect(new FormData(form).getAll("members")).toEqual([]);
  });
  const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Blocked", disabled: true }, { value: "c", label: "Charlie" }];
  it("filters, selects and removes chips while keeping input focus", async () => {
    render(<MultiSelect options={options} aria-label="Members" />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "char");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove Charlie" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Charlie" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.click(screen.getByRole("button", { name: "Remove Charlie" }));
    expect(input).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Remove Charlie" })).not.toBeInTheDocument();
  });

  it("navigates enabled options, toggles selection, handles empty results and Escape", async () => {
    render(<MultiSelect options={options} aria-label="Members" />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("button", { name: "Remove Charlie" })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(screen.queryByRole("button", { name: "Remove Charlie" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Home}{Enter}{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove Alpha" })).not.toBeInTheDocument();
    await userEvent.type(input, "missing");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getByText("No matches")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowUp}{Enter}{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("forwards refs, className and Field metadata, supports controlled updates", async () => {
    const ref = createRef<HTMLInputElement>();
    function Demo() {
      const [value, setValue] = useState<string[]>([]);
      return <Field label="Members" error="Required" required><MultiSelect ref={ref} className="custom" value={value} onValueChange={setValue} options={options} /></Field>;
    }
    const { container } = render(<Demo />);
    const input = screen.getByRole("combobox", { name: "Members" });
    expect(ref.current).toBe(input);
    expect(container.querySelector(".lm-multi-select")).toHaveClass("custom");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
    expect(input).toBeRequired();
    await userEvent.click(input);
    await userEvent.keyboard("{Enter}");
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(input).toBeRequired();
  });

  it("does not change a controlled value itself and respects disabled/read-only options", async () => {
    const change = vi.fn();
    const { rerender } = render(<MultiSelect value={["a", "b"]} onValueChange={change} options={options} aria-label="Members" />);
    expect(screen.getByRole("button", { name: "Remove Blocked" })).toBeDisabled();
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Blocked" }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(change).toHaveBeenCalledWith(["b"]);
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeInTheDocument();
    rerender(<MultiSelect value={["a"]} options={options} readOnly aria-label="Members" />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeDisabled();
    rerender(<MultiSelect options={options} disabled aria-label="Members" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("dismisses outside and on Tab, and honors caller keyboard cancellation", async () => {
    const change = vi.fn();
    render(<><MultiSelect options={options} aria-label="Members" onValueChange={change} onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} /><button>Outside</button></>);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{End}{Enter}");
    expect(change).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await userEvent.click(input);
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});

describe("TagInput", () => {
  it("submits committed tags only and keeps a required draft invalid", async () => {
    const { container } = render(<form><TagInput name="tags" required aria-label="Tags" /></form>);
    const form = container.querySelector("form")!;
    await userEvent.type(screen.getByRole("textbox"), "draft");
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("tags")).toEqual([]);
    await userEvent.keyboard("{Enter}");
    expect(form.checkValidity()).toBe(true);
    await userEvent.type(screen.getByRole("textbox"), "uncommitted");
    expect(new FormData(form).getAll("tags")).toEqual(["draft"]);
    await userEvent.click(screen.getByRole("button", { name: "Remove draft" }));
    expect(form.checkValidity()).toBe(false);
  });
  it("adds trimmed unique tags with Enter/comma and removes with Backspace/buttons", async () => {
    render(<TagInput aria-label="Tags" defaultValue={["initial", "initial", " "]} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "  design  {Enter}design,accessibility,");
    expect(screen.getAllByRole("button")).toHaveLength(3);
    await userEvent.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove accessibility" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove design" }));
    expect(input).toHaveFocus();
    await userEvent.type(input, "draft{Escape}{Enter}");
    expect(input).toHaveValue("");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("uses Field metadata, ref and className with controlled selection", async () => {
    const ref = createRef<HTMLInputElement>();
    function Demo() {
      const [value, setValue] = useState<string[]>([]);
      return <Field label="Tags" hint="Enter to add" required><TagInput ref={ref} className="custom" value={value} onValueChange={setValue} /></Field>;
    }
    const { container } = render(<Demo />);
    const input = screen.getByRole("textbox", { name: "Tags" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription("Enter to add");
    expect(input).toBeRequired();
    expect(container.querySelector(".lm-tag-input")).toHaveClass("custom");
    await userEvent.type(input, "tag{Enter}");
    expect(screen.getByRole("button", { name: "Remove tag" })).toBeInTheDocument();
    expect(input).not.toHaveAttribute("required");
  });

  it("does not commit IME composition and allows caller keyboard cancellation", () => {
    const change = vi.fn();
    const { rerender } = render(<TagInput aria-label="Tags" onValueChange={change} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "draft" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(change).not.toHaveBeenCalled();
    rerender(<TagInput aria-label="Tags" onValueChange={change} onKeyDown={event => event.preventDefault()} />);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(change).not.toHaveBeenCalled();
  });

  it("respects read-only/disabled state and keeps controlled values authoritative", async () => {
    const change = vi.fn();
    const { rerender } = render(<TagInput aria-label="Tags" value={["locked"]} onValueChange={change} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove locked" }));
    expect(change).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { name: "Remove locked" })).toBeInTheDocument();
    rerender(<TagInput aria-label="Tags" value={["locked"]} readOnly />);
    expect(screen.getByRole("button")).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "new{Enter}{Backspace}");
    expect(screen.getByRole("button")).toHaveAccessibleName("Remove locked");
    rerender(<TagInput aria-label="Tags" value={["locked"]} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
