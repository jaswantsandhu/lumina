import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge, Button, ChatComposer, ChatMessage, ChatThread, Text } from "../src/index";

export default { title: "Chat/Conversation", parameters: { layout: "fullscreen" } } satisfies Meta;

export const Conversation: StoryObj = {
  render: function Render() {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([
      { id: 1, self: true, author: "You", body: "Can you summarise last week's failed runs?" },
      { id: 2, self: false, author: "Lead", body: "Three runs failed, all in the coder's test step. The flaky one passed on retry." },
    ]);
    return (
      <div style={{ height: 520 }}>
        <ChatThread
          scrollKey={messages.length}
          header={
            <>
              <Text weight="semibold">Weekly report</Text>
              <Button size="sm" variant="ghost">
                Export
              </Button>
            </>
          }
          composer={
            <ChatComposer
              value={text}
              onValueChange={setText}
              onSend={() => {
                setMessages((m) => [...m, { id: m.length + 1, self: true, author: "You", body: text }]);
                setText("");
              }}
              placeholder="Message the team lead…"
            />
          }
        >
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              from={m.self ? "self" : "other"}
              author={m.author}
              avatarName={m.author}
              time="2m ago"
              meta={!m.self ? <Badge tone="accent">delegated</Badge> : undefined}
              footer={!m.self ? <Text size="sm" tone="muted">coder: Summarise failures · succeeded</Text> : undefined}
            >
              {m.body}
            </ChatMessage>
          ))}
        </ChatThread>
      </div>
    );
  },
};
