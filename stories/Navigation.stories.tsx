import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge, NavItem, NavSection, Stack, TabPanel, Tabs, Text, ThemeToggle } from "../src/index";

export default { title: "Navigation/Components", tags: ["autodocs"] } satisfies Meta;

export const TabsStory: StoryObj = {
  name: "Tabs",
  render: function Render() {
    const [tab, setTab] = useState("tree");
    return (
      <div style={{ maxWidth: 560 }}>
        <Tabs label="Task views" value={tab} onValueChange={setTab} items={[{ value: "tree", label: "Tree" }, { value: "runs", label: "Runs", badge: <Badge>2</Badge> }, { value: "messages", label: "Messages" }, { value: "logs", label: "Logs", disabled: true }]} />
        <TabPanel value="tree" current={tab}><Text tone="muted">The task tree.</Text></TabPanel>
        <TabPanel value="runs" current={tab}><Text tone="muted">Each attempt with tokens and timing.</Text></TabPanel>
        <TabPanel value="messages" current={tab}><Text tone="muted">Questions between the lead and sub-agents.</Text></TabPanel>
      </div>
    );
  },
};

export const Nav: StoryObj = {
  name: "Nav items",
  render: function Render() {
    const [active, setActive] = useState("Chat");
    return (
      <Stack gap="4" style={{ width: 240 }}>
        <NavSection label="Team">
          {["Chat", "Tasks", "Schedules", "Memory"].map((p) => (
            <NavItem key={p} active={active === p} onClick={() => setActive(p)}>{p}</NavItem>
          ))}
          <NavItem active={active === "Approvals"} onClick={() => setActive("Approvals")} count={3}>Approvals</NavItem>
        </NavSection>
        <ThemeToggle />
      </Stack>
    );
  },
};
