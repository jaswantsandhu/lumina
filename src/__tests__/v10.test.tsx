import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuthLayout, CodeEditor, ConsentDialog, CookieSettings, CopyField, Journey, StatusCell, ZonedDateTimeInput,
  findJsonPathLine, formatInTimeZone, isoToZoned, jsonSyntaxError, useConsent, zonedToISO,
} from "../index";

afterEach(() => { try { localStorage.clear(); } catch { /* no localStorage in this runtime */ } });

describe("CopyField", () => {
  it("copies the value and announces it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = vi.fn();
    render(<CopyField label="Invite link" value="https://x.test/invite/abc" note="Shown once" once onCopy={onCopy} />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy Invite link" })); });
    expect(writeText).toHaveBeenCalledWith("https://x.test/invite/abc");
    expect(onCopy).toHaveBeenCalled();
    expect(screen.getByText("Copied to clipboard")).toBeInTheDocument();
    expect(screen.getByText("Shown once").closest(".lm-copyfield--once")).not.toBeNull();
  });
});

describe("StatusCell, AuthLayout, Journey", () => {
  it("StatusCell reads its title to screen readers", () => {
    render(<StatusCell tone="success" title="9 of 9 steps">9/9</StatusCell>);
    expect(screen.getByText("9/9").closest(".lm-status-cell--success")).not.toBeNull();
    expect(screen.getByText(": 9 of 9 steps")).toHaveClass("lm-visually-hidden");
  });
  it("AuthLayout is a labelled region with a heading", () => {
    render(<AuthLayout title="Sign in" brand="✦ Learn" footer="Help">form</AuthLayout>);
    expect(screen.getByRole("region", { name: "Sign in" })).toHaveTextContent("form");
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
  });
  it("Journey names each stop with its state and reports choices", () => {
    const onSelect = vi.fn();
    render(<Journey label="Course progress" onSelect={onSelect} stops={[
      { id: "1", label: "Fee calc", state: "done", title: "Day 1" },
      { id: "2", label: "Fee rules", state: "active", title: "Day 2" },
      { id: "3", label: "Masking", state: "locked", title: "Day 3" },
    ]} />);
    expect(screen.getByRole("list", { name: "Course progress" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Day 3 (locked)" }));
    expect(onSelect).toHaveBeenCalledWith("3");
    expect(screen.getByRole("button", { name: "Day 2 (in progress)" }).closest("li")).toHaveAttribute("aria-current", "step");
  });
});

describe("time zones", () => {
  it("converts wall-clock time in a zone to UTC and back, across daylight saving", () => {
    expect(zonedToISO("2026-10-12", "09:00", "Asia/Kolkata")).toBe("2026-10-12T03:30:00.000Z");
    expect(zonedToISO("2026-07-01", "09:00", "Europe/London")).toBe("2026-07-01T08:00:00.000Z"); // BST
    expect(zonedToISO("2026-12-01", "09:00", "Europe/London")).toBe("2026-12-01T09:00:00.000Z"); // GMT
    expect(isoToZoned("2026-10-12T03:30:00.000Z", "Asia/Kolkata")).toEqual({ date: "2026-10-12", time: "09:00" });
    expect(isoToZoned(null, "UTC")).toEqual({ date: "", time: "" });
    expect(formatInTimeZone("2026-10-12T03:30:00.000Z", "Asia/Kolkata", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, "en-GB")).toBe("09:00");
  });
  it("ZonedDateTimeInput edits in the zone and returns UTC", () => {
    const onChange = vi.fn();
    render(<ZonedDateTimeInput value={null} onChange={onChange} timeZone="Asia/Kolkata" />);
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-10-12" } });
    expect(onChange).toHaveBeenCalledWith("2026-10-12T03:30:00.000Z");
    expect(screen.getByText("Asia/Kolkata")).toBeInTheDocument();
  });
});

describe("consent", () => {
  it("asks once, runs onGrant after accepting, and onRevoke when withdrawn", () => {
    const onGrant = vi.fn();
    const onRevoke = vi.fn();
    const { result, rerender } = renderHook(() => useConsent({ key: "t-consent", onGrant, onRevoke }));
    expect(result.current.needsDecision).toBe(true);
    expect(onGrant).not.toHaveBeenCalled();
    act(() => result.current.decide(true));
    rerender();
    expect(onGrant).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem("t-consent")!).granted).toBe(true);
    act(() => result.current.decide(false));
    expect(onRevoke).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe(false);
  });
  it("never asks when disabled", () => {
    const { result } = renderHook(() => useConsent({ key: "t2", enabled: false }));
    expect(result.current.needsDecision).toBe(false);
  });
  it("ConsentDialog has no close button; CookieSettings shows the state", () => {
    const onDecide = vi.fn();
    render(<ConsentDialog open description="We use analytics." onDecide={onDecide} />);
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(onDecide).toHaveBeenCalledWith(false);
    render(<CookieSettings service="Google Analytics" consent={{ enabled: true, status: true, needsDecision: false, decide: vi.fn() }} />);
    expect(screen.getByText(/Google Analytics:/)).toHaveTextContent("Google Analytics: On");
    expect(screen.getByRole("button", { name: "Withdraw consent" })).toBeEnabled();
  });
});

describe("JSON helpers and CodeEditor", () => {
  const text = JSON.stringify({ title: "Day", steps: [{ id: "a", quiz: [{ q: "?", answer: 3 }] }] }, null, 2);
  it("finds the line of a path, or its nearest parent", () => {
    expect(findJsonPathLine(text, "steps.0.quiz.0.answer")).toBe(text.split("\n").findIndex((l) => l.includes('"answer"')) + 1);
    expect(findJsonPathLine(text, "steps.0.missing")).toBe(text.split("\n").findIndex((l) => l.includes('"id"')) );
    expect(findJsonPathLine(text, "title")).toBe(2);
  });
  it("locates syntax errors", () => {
    expect(jsonSyntaxError(text)).toBeNull();
    expect(jsonSyntaxError('{\n  "a": 1,\n  "b": \n}')?.line).toBe(4);
    expect(jsonSyntaxError('{\n  "a": 1,\n}')).toMatchObject({ line: 3, message: "Trailing comma before }" });
    expect(jsonSyntaxError('[1, 2')).toMatchObject({ line: 1, message: 'Expected "," or "]"' });
  });
  it("edits, indents with Tab, saves with Ctrl+S and lists errors that jump to the line", () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    render(<CodeEditor label="Day JSON" language="json" value={'{\n"a": 1\n}'} onChange={onChange} onSave={onSave} errors={[{ line: 2, message: "bad value" }]} />);
    const box = screen.getByRole("textbox", { name: "Day JSON" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(box, { target: { value: "{}" } });
    expect(onChange).toHaveBeenCalledWith("{}");
    fireEvent.keyDown(box, { key: "s", ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
    (box as HTMLTextAreaElement).setSelectionRange(0, 0);
    fireEvent.keyDown(box, { key: "Tab" });
    expect(onChange).toHaveBeenLastCalledWith('  {\n"a": 1\n}');
    fireEvent.click(screen.getByRole("button", { name: "Line 2" }));
    expect((box as HTMLTextAreaElement).selectionStart).toBe(2);
    expect(document.querySelector(".lm-code-editor__number--error")?.textContent).toBe("2");
  });
  it("Escape then Tab leaves the editor (no keyboard trap)", () => {
    const onChange = vi.fn();
    render(<CodeEditor label="Code" value="x" onChange={onChange} />);
    const box = screen.getByRole("textbox", { name: "Code" });
    fireEvent.keyDown(box, { key: "Escape" });
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    box.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
