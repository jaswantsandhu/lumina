import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  List,
  ListItem,
  NavItem,
  NavSection,
  PageHeader,
  SidebarBrand,
  SidebarFooter,
  Stack,
  Text,
  Textarea,
  ThemeToggle,
} from "../src/index";

export default { title: "Patterns/Agent workspace", parameters: { layout: "fullscreen" } } satisfies Meta;

// A full screen assembled from Lumina components, like agentteam's chat.
export const ChatScreen: StoryObj = {
  render: function Render() {
    const [page, setPage] = useState("Chat");
    return (
      <div style={{ margin: "-1.5rem" }}>
        <AppShell title="✦ agentteam"
          sidebar={
            <>
              <SidebarBrand>
                <span style={{ color: "var(--lm-color-accent)" }}>✦</span> agentteam
              </SidebarBrand>
              <NavSection label="demo team">
                {["Chat", "Tasks", "Schedules", "Memory"].map((p) => (
                  <NavItem key={p} active={page === p} onClick={() => setPage(p)}>{p}</NavItem>
                ))}
                <NavItem active={page === "Approvals"} onClick={() => setPage("Approvals")} count={2}>Approvals</NavItem>
              </NavSection>
              <NavSection label="Agents">
                {["lead", "coder", "researcher"].map((a) => (
                  <Stack key={a} direction="row" gap="2" align="center" style={{ padding: "0 var(--lm-space-2)" }}>
                    <Avatar name={a} size="sm" />
                    <Text size="sm">{a}</Text>
                    <Badge tone="success" dot style={{ marginLeft: "auto" }}>idle</Badge>
                  </Stack>
                ))}
              </NavSection>
              <SidebarFooter>
                <ThemeToggle />
              </SidebarFooter>
            </>
          }
        >
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: 260, borderRight: "1px solid var(--lm-color-border)", padding: "var(--lm-space-3)" }}>
              <Stack gap="3">
                <Button variant="primary" fullWidth>New conversation</Button>
                <List>
                  <ListItem title="Add OAuth login" meta="2m ago" selected />
                  <ListItem title="Compare databases" meta="1h ago" />
                  <ListItem title="Weekly summary" meta="yesterday" />
                </List>
              </Stack>
            </div>
            <div style={{ flex: 1, padding: "var(--lm-space-6)", display: "flex", flexDirection: "column", gap: "var(--lm-space-4)" }}>
              <PageHeader title="Add OAuth login" description="Conversation with the demo team lead." />
              <Card padding="md" style={{ alignSelf: "flex-end", maxWidth: 520, background: "var(--lm-color-accent)", color: "var(--lm-color-on-accent)", border: "none" }}>
                <Text style={{ color: "inherit" }}>Add Google sign-in to the web app.</Text>
              </Card>
              <Card style={{ maxWidth: 620 }}>
                <Stack direction="row" gap="2" align="center">
                  <Avatar name="lead" size="sm" />
                  <Text weight="semibold">Lead</Text>
                  <Badge tone="accent">delegated</Badge>
                </Stack>
                <Text>I asked the researcher to compare OAuth libraries, then the coder to implement the best option.</Text>
                <Stack gap="1">
                  <Stack direction="row" gap="2" align="center"><Badge tone="success">succeeded</Badge><Text size="sm">researcher: Compare OAuth libraries</Text></Stack>
                  <Stack direction="row" gap="2" align="center"><Badge tone="info" dot>running</Badge><Text size="sm">coder: Implement Google sign-in</Text></Stack>
                </Stack>
              </Card>
              <Stack direction="row" gap="2" style={{ marginTop: "auto" }}>
                <Textarea placeholder="Message the team lead…" rows={2} aria-label="Message" />
                <Button variant="primary">Send</Button>
              </Stack>
            </div>
          </div>
        </AppShell>
      </div>
    );
  },
};
