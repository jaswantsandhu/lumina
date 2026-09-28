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
        <Tabs label="Project views" value={tab} onValueChange={setTab} items={[{ value: "tree", label: "Overview" }, { value: "runs", label: "Activity", badge: <Badge>2</Badge> }, { value: "messages", label: "Comments" }, { value: "logs", label: "Logs", disabled: true }]} />
        <TabPanel value="tree" current={tab}><Text tone="muted">The project at a glance.</Text></TabPanel>
        <TabPanel value="runs" current={tab}><Text tone="muted">Recent changes, newest first.</Text></TabPanel>
        <TabPanel value="messages" current={tab}><Text tone="muted">Discussion with your team.</Text></TabPanel>
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
