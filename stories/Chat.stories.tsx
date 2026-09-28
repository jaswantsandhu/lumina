import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge, Button, ChatComposer, ChatMessage, ChatThread, Text } from "../src/index";

export default { title: "Chat/Conversation", parameters: { layout: "fullscreen" } } satisfies Meta;

export const Conversation: StoryObj = {
  render: function Render() {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([
      { id: 1, self: true, author: "You", body: "Can we ship the checkout redesign this week?" },
      { id: 2, self: false, author: "Sam", body: "Yes. Design review is done; Ada is finishing the payment step and Grace is testing." },
    ]);
    return (
      <div style={{ height: 520 }}>
        <ChatThread
          scrollKey={messages.length}
          header={
            <>
              <Text weight="semibold">Checkout redesign</Text>
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
              placeholder="Message the team…"
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
              meta={!m.self ? <Badge tone="accent">owner</Badge> : undefined}
              footer={!m.self ? <Text size="sm" tone="muted">Ada: Payment step · in progress</Text> : undefined}
            >
              {m.body}
            </ChatMessage>
          ))}
        </ChatThread>
      </div>
    );
  },
};
