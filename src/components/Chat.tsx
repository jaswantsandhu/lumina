import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { cx } from "../utils";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

export interface ChatThreadProps {
  /** Title row above the messages (title, actions). */
  header?: ReactNode;
  /** The messages: <ChatMessage> elements. */
  children: ReactNode;
  /** Usually a <ChatComposer>. */
  composer?: ReactNode;
  /** Changes whenever content grows (e.g. last message id + length): keeps the view at the bottom if it was there. */
  scrollKey?: unknown;
  className?: string;
}

/** A conversation: header, scrolling messages that stick to the bottom, composer. */
export function ChatThread({ header, children, composer, scrollKey, className }: ChatThreadProps) {
  const list = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  useLayoutEffect(() => {
    const el = list.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [scrollKey]);
  return (
    <div className={cx("lm-chat", className)}>
      {header && <div className="lm-chat__header">{header}</div>}
      <div
        ref={list}
        className="lm-chat__messages"
        role="log"
        aria-live="polite"
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
      >
        {children}
      </div>
      {composer && <div className="lm-chat__composer">{composer}</div>}
    </div>
  );
}

export interface ChatMessageProps {
  /** "self" = the viewer (right-aligned bubble); "other" = anyone or anything else. */
  from: "self" | "other";
  author: ReactNode;
  /** Name for the avatar (others only). */
  avatarName?: string;
  time?: ReactNode;
  /** Badges and actions next to the author. */
  meta?: ReactNode;
  children: ReactNode;
  /** Under the content: attachments, linked items, reactions… */
  footer?: ReactNode;
  className?: string;
}

/** One message. Yours are compact bubbles; others' are cards with an avatar. */
export function ChatMessage({ from, author, avatarName, time, meta, children, footer, className, ...rest }: ChatMessageProps & Record<`data-${string}`, string>) {
  return (
    <div className={cx("lm-chat-message", `lm-chat-message--${from}`, className)} {...rest}>
      <div className="lm-chat-message__meta">
        {from === "other" && avatarName && <Avatar name={avatarName} size="sm" />}
        <span className="lm-chat-message__author">{author}</span>
        {time && <span className="lm-chat-message__time">{time}</span>}
        {meta}
      </div>
      <div className="lm-chat-message__content">{children}</div>
      {footer && <div className="lm-chat-message__footer">{footer}</div>}
    </div>
  );
}

export interface ChatComposerProps {
  value: string;
  onValueChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  /** e.g. while a reply is being written. */
  disabled?: boolean;
  sending?: boolean;
  sendLabel?: string;
  /** Accessible name of the text box. */
  label?: string;
}

/** Message box: Enter sends, Shift+Enter adds a line; grows with its content. */
export function ChatComposer({ value, onValueChange, onSend, placeholder = "Write a message…", disabled, sending, sendLabel = "Send", label = "Message" }: ChatComposerProps) {
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);
  const canSend = value.trim().length > 0 && !disabled && !sending;
  return (
    <form
      className="lm-chat-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
    >
      <textarea
        ref={box}
        className="lm-input lm-chat-composer__input"
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        title="Enter to send, Shift+Enter for a new line"
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSend();
          }
        }}
      />
      <Button type="submit" variant="primary" disabled={!canSend} loading={sending}>
        {sendLabel}
      </Button>
    </form>
  );
}
