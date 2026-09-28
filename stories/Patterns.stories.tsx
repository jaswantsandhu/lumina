import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  ChatComposer,
  ChatMessage,
  ChatThread,
  List,
  ListItem,
  NavItem,
  NavSection,
  SidebarBrand,
  SidebarFooter,
  SplitView,
  Stack,
  Text,
  ThemeToggle,
} from "../src/index";

export default { title: "Patterns/Project workspace", parameters: { layout: "fullscreen" } } satisfies Meta;

// A full screen assembled from Lumina components: app shell, list and detail,
// and a conversation.
export const WorkspaceScreen: StoryObj = {
  render: function Render() {
    const [page, setPage] = useState("Discussions");
    const [thread, setThread] = useState<string | undefined>();
    const [text, setText] = useState("");
    const threads = ["Checkout redesign", "Pricing page copy", "Launch checklist"];
    const current = thread ?? threads[0];
    return (
      <div style={{ margin: "-1.5rem", height: "100vh" }}>
        <AppShell
          title="✦ Acme"
          sidebar={
            <>
              <SidebarBrand>
                <span style={{ color: "var(--lm-color-accent)" }}>✦</span> Acme
              </SidebarBrand>
              <NavSection label="Website team">
                {["Overview", "Discussions", "Tasks", "Files"].map((p) => (
                  <NavItem key={p} active={page === p} onClick={() => setPage(p)}>
                    {p}
                  </NavItem>
                ))}
                <NavItem active={page === "Reviews"} onClick={() => setPage("Reviews")} count={2}>
                  Reviews
                </NavItem>
              </NavSection>
              <NavSection label="People">
                {["Ada", "Grace", "Linus"].map((a, i) => (
                  <Stack key={a} direction="row" gap="2" align="center" style={{ padding: "0 var(--lm-space-2)" }}>
                    <Avatar name={a} size="sm" />
                    <Text size="sm">{a}</Text>
                    <Badge tone={i === 0 ? "info" : "success"} dot style={{ marginLeft: "auto" }}>
                      {i === 0 ? "busy" : "online"}
                    </Badge>
                  </Stack>
                ))}
              </NavSection>
              <SidebarFooter>
                <ThemeToggle />
              </SidebarFooter>
            </>
          }
        >
          <SplitView
            listLabel="Discussions"
            showDetail={thread !== undefined}
            onBack={() => setThread(undefined)}
            backLabel="All discussions"
            flushDetail
            list={
              <>
                <Button variant="primary" fullWidth>
                  New discussion
                </Button>
                <List aria-label="Discussions">
                  {threads.map((t, i) => (
                    <ListItem key={t} title={t} meta={["2m ago", "1h ago", "yesterday"][i]} selected={t === current} onClick={() => setThread(t)} />
                  ))}
                </List>
              </>
            }
          >
            <ChatThread
              header={<Text weight="semibold">{current}</Text>}
              composer={<ChatComposer value={text} onValueChange={setText} onSend={() => setText("")} placeholder="Message the team…" />}
            >
              <ChatMessage from="self" author="You" time="3m ago">
                Can we ship the checkout redesign this week?
              </ChatMessage>
              <ChatMessage
                from="other"
                author="Sam"
                avatarName="Sam"
                time="2m ago"
                meta={<Badge tone="accent">owner</Badge>}
                footer={
                  <Stack gap="1">
                    <Stack direction="row" gap="2" align="center">
                      <Badge tone="success">done</Badge>
                      <Text size="sm">Grace: Payment provider comparison</Text>
                    </Stack>
                    <Stack direction="row" gap="2" align="center">
                      <Badge tone="info" dot>
                        in progress
                      </Badge>
                      <Text size="sm">Ada: New payment step</Text>
                    </Stack>
                  </Stack>
                }
              >
                Yes. Grace compared the providers; Ada is building the new payment step now.
              </ChatMessage>
            </ChatThread>
          </SplitView>
        </AppShell>
      </div>
    );
  },
};
