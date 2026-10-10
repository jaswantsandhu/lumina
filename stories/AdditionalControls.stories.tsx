import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "../src/components/DatePicker";
import { Slider } from "../src/components/Slider";
import { ButtonGroup } from "../src/components/ButtonGroup";
import { SplitButton } from "../src/components/SplitButton";
import { Button } from "../src/components/Button";
import { Field } from "../src/components/Field";
import "../src/components/DatePicker.css";
import "../src/components/Slider.css";
import "../src/components/ButtonGroup.css";
import "../src/components/SplitButton.css";

export default { title: "Forms/Additional Controls", component: DatePicker, subcomponents: { Slider, ButtonGroup, SplitButton }, tags: ["autodocs"] } satisfies Meta<typeof DatePicker>;

export const Calendar: StoryObj<typeof DatePicker> = {
  render: function Render() {
    const [value, setValue] = useState("2024-02-29");
    return <Field label="Date" hint="Arrows move days; PageUp/PageDown browse months; Shift browses years."><DatePicker value={value} onValueChange={setValue} name="date" /></Field>;
  },
};
export const BoundedLeapDay: StoryObj<typeof DatePicker> = {
  render: function Render() {
    const [value, setValue] = useState("2024-02-29");
    return <Field label="Booking date" required hint="February 28 through March 2, inclusive. Days outside this range are disabled."><DatePicker value={value} onValueChange={setValue} min="2024-02-28" max="2024-03-02" /></Field>;
  },
};
export const EmptyAndDisabled: StoryObj<typeof DatePicker> = {
  render: function Render() {
    const [value, setValue] = useState("");
    return <><Field label="Optional date"><DatePicker value={value} onValueChange={setValue} /></Field><Field label="Locked date"><DatePicker disabled value="2024-02-29" onValueChange={() => {}} /></Field></>;
  },
};
export const Range: StoryObj<typeof Slider> = {
  render: function Render() {
    const [value, setValue] = useState(25);
    return <><Field label="Volume" hint={`Current value: ${value}. Use arrow keys or Home/End.`}><Slider value={value} onValueChange={setValue} min={0} max={100} step={5} /></Field><Field label="Locked volume"><Slider disabled defaultValue={50} /></Field></>;
  },
};
export const GroupedActions: StoryObj<typeof ButtonGroup> = {
  render: () => <><ButtonGroup aria-label="History"><Button>Undo</Button><Button disabled>Redo</Button><Button>Reset</Button></ButtonGroup><ButtonGroup orientation="vertical" aria-label="Alignment"><Button>Left</Button><Button>Center</Button><Button>Right</Button></ButtonGroup></>,
};
export const PrimaryAndMenu: StoryObj<typeof SplitButton> = {
  render: function Render() {
    const [action, setAction] = useState("No action yet");
    return <><SplitButton variant="primary" groupLabel="Save options" menuLabel="More save options" onClick={() => setAction("Saved")} items={[
      { label: "Save as draft", onSelect: () => setAction("Draft saved") },
      { label: "Publish", disabled: true, onSelect: () => setAction("Published") },
      { label: "Save and close", onSelect: () => setAction("Saved and closed") },
    ]}>Save</SplitButton><p role="status">{action}</p><SplitButton disabled menuLabel="Unavailable options" items={[]}>Disabled</SplitButton></>;
  },
};
