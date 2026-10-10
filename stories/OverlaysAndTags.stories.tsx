import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Popover } from "../src/components/PopoverComponent";
import { CommandPalette } from "../src/components/CommandPalette";
import { MultiSelect } from "../src/components/MultiSelect";
import { TagInput } from "../src/components/TagInput";
import { Field } from "../src/components/Field";
import { Checkbox } from "../src/components/Checkbox";
import "../src/components/Popover.css";
import "../src/components/CommandPalette.css";
import "../src/components/MultiSelect.css";
import "../src/components/TagInput.css";

export default {
  title: "Overlays/Overlays and tags",
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Anchored Popover, searchable CommandPalette, MultiSelect and freeform TagInput. Controls support Field labels and input refs. The host opens CommandPalette; it installs no global shortcut." } } },
} satisfies Meta;

export const AnchoredPopover: StoryObj = {
  render: () => <Popover label="Notification preferences" trigger={props => <button {...props} className="lm-button">Preferences</button>}>
    <Checkbox label="Email notifications" />
    <p>Escape closes and returns focus. Clicking or focusing outside dismisses.</p>
  </Popover>,
};

export const ControlledPopover: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return <Popover label="Quick help" open={open} onOpenChange={setOpen} align="end" trigger={props => <button {...props} className="lm-button">Help</button>}>
      <p>Controlled visibility with interactive content.</p><button className="lm-button" onClick={() => setOpen(false)}>Close help</button>
    </Popover>;
  },
};

export const SearchCommands: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState("No command selected");
    return <>
      <button className="lm-button" onClick={() => setOpen(true)}>Open commands</button><p role="status">{result}</p>
      <CommandPalette open={open} onClose={() => setOpen(false)} items={[
        { id: "new", label: "New project", group: "Projects", keywords: ["create"], onSelect: () => setResult("New project selected") },
        { id: "archive", label: "Archive project", group: "Projects", disabled: true, onSelect: () => {} },
        { id: "settings", label: "Settings", description: "Manage your workspace", group: "Workspace", onSelect: () => setResult("Settings selected") },
      ]} />
    </>;
  },
};

export const SearchableSelection: StoryObj = {
  render: function Render() {
    const [value, setValue] = useState(["react"]);
    return <Field label="Technologies" hint="Type to filter; Enter toggles a selection. Empty Backspace removes the last chip." required>
      <MultiSelect value={value} onValueChange={setValue} placeholder="Search technologies" options={[{ value: "react", label: "React" }, { value: "ts", label: "TypeScript" }, { value: "css", label: "CSS" }, { value: "legacy", label: "Legacy (unavailable)", disabled: true }]} />
    </Field>;
  },
};

export const FreeformTags: StoryObj = {
  render: () => <Field label="Project tags" hint="Enter or comma adds a tag. Tags are trimmed, unique and case-sensitive.">
    <TagInput defaultValue={["design", "accessible"]} placeholder="Add a tag" />
  </Field>,
};

export const ControlStates: StoryObj = {
  render: () => <div>
    <Field label="Invalid selection" error="Choose at least one technology"><MultiSelect options={["React", "TypeScript"]} /></Field>
    <Field label="Read-only tags"><TagInput value={["reviewed"]} readOnly /></Field>
    <Field label="Disabled selection"><MultiSelect defaultValue={["React"]} options={["React", "TypeScript"]} disabled /></Field>
    <Field label="Disabled tags"><TagInput defaultValue={["locked"]} disabled /></Field>
  </div>,
};
