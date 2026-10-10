import { createRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Breadcrumb } from "../components/Breadcrumb";
import { RadioGroup } from "../components/RadioGroup";
import { SegmentedControl } from "../components/SegmentedControl";
import { Accordion } from "../components/Accordion";
import { Pagination } from "../components/Pagination";
import { Field } from "../components/Field";

describe("Breadcrumb", () => {
  it("renders native ancestor links and a non-link current page", async () => {
    render(<Breadcrumb className="custom" items={[{ label: "Home", href: "#home" }, { label: "Project", href: "#project" }]} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveClass("custom");
    expect(screen.getByText("Project")).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
  });
});

describe("RadioGroup", () => {
  it("keeps option names distinct from the Field label and descriptions", () => {
    render(<Field label="Plan"><RadioGroup aria-label="Plans" value="a" onValueChange={vi.fn()} options={[{ value: "a", label: "Basic", description: "For individuals" }, { value: "b", label: "Pro" }]} /></Field>);
    expect(screen.getByRole("radio", { name: "Basic" })).toHaveAccessibleDescription("For individuals");
    expect(screen.getByRole("radio", { name: "Pro" })).toBeInTheDocument();
  });
  it("inherits Field metadata, forwards input refs and submits the selected native value", async () => {
    const first = createRef<HTMLInputElement>();
    const second = createRef<HTMLInputElement>();
    function Demo() {
      const [value, setValue] = useState("a");
      return <form data-testid="form"><Field label="Plan" error="Choose carefully" required>
        <RadioGroup ref={first} className="custom" aria-label="Plan options" name="plan" value={value} onValueChange={setValue} options={[
          { value: "a", label: "Basic" }, { value: "b", label: "Pro", inputRef: second }, { value: "c", label: "Unavailable", disabled: true },
        ]} />
      </Field></form>;
    }
    render(<Demo />);
    expect(screen.getByRole("radiogroup")).toHaveClass("custom");
    expect(first.current).toBe(screen.getByRole("radio", { name: "Basic" }));
    expect(screen.getByText("Plan").closest("label")).toHaveAttribute("for", first.current!.id);
    expect(second.current).toBe(screen.getByRole("radio", { name: "Pro" }));
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeRequired();
      expect(radio).toHaveAttribute("aria-invalid", "true");
      expect(radio).toHaveAccessibleDescription("Choose carefully");
    }
    await userEvent.click(second.current!);
    expect(second.current).toBeChecked();
    expect(first.current).not.toBeChecked();
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("plan")).toBe("b");
    await userEvent.click(screen.getByRole("radio", { name: "Unavailable" }));
    expect(second.current).toBeChecked();
  });

  it("supports native arrow selection and skips disabled radios", async () => {
    function Demo() {
      const [value, setValue] = useState("a");
      return <RadioGroup aria-label="Choices" value={value} onValueChange={setValue} options={[
        { value: "a", label: "A" }, { value: "b", label: "B", disabled: true }, { value: "c", label: "C" },
      ]} />;
    }
    render(<Demo />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "C" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "C" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });
});

describe("SegmentedControl", () => {
  const items = [{ value: "a", label: "A" }, { value: "b", label: "B", disabled: true }, { value: "c", label: "C" }];
  it("roves with arrows, wraps, skips disabled items and supports Home/End and Space", async () => {
    function Demo() {
      const [value, setValue] = useState("a");
      return <SegmentedControl className="custom" label="View" items={items} value={value} onValueChange={setValue} />;
    }
    render(<Demo />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toHaveClass("custom");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "C" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "C" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("tabindex", "-1");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "A" })).toHaveFocus();
    await userEvent.keyboard("{End}{Home}{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "C" })).toHaveFocus();
    screen.getByRole("radio", { name: "A" }).focus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("aria-checked", "true");
  });

  it("provides a tab stop for an absent or disabled value and remains controlled", async () => {
    const change = vi.fn();
    render(<SegmentedControl label="View" items={items} value="b" onValueChange={change} />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "A" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(change).toHaveBeenCalledWith("c");
    expect(screen.getByRole("radio", { name: "C" })).toHaveAttribute("aria-checked", "false");
  });
});

describe("Accordion", () => {
  const items = [{ value: "a", label: "First", content: "First content" }, { value: "b", label: "Disabled", content: "Disabled content", disabled: true }, { value: "c", label: "Last", content: "Last content" }];
  it("expands a single panel, collapses it, and connects unique panel IDs", async () => {
    render(<Accordion className="custom" items={items} defaultValue={["a"]} headingLevel={2} />);
    const first = screen.getByRole("button", { name: "First" });
    expect(first.closest(".lm-accordion")).toHaveClass("custom");
    expect(screen.getByRole("heading", { name: "First", level: 2 })).toBeInTheDocument();
    expect(document.getElementById(first.getAttribute("aria-controls")!)).toHaveAttribute("aria-labelledby", first.id);
    await userEvent.click(screen.getByRole("button", { name: "Last" }));
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("First content")).not.toBeVisible();
    expect(screen.getByText("Last content")).toBeVisible();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Last content")).not.toBeVisible();
  });

  it("supports multiple expansion and heading keyboard navigation without opening panels", async () => {
    render(<Accordion items={items} multiple />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Last" })).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Home} {End} ");
    expect(screen.getByText("First content")).toBeVisible();
    expect(screen.getByText("Last content")).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("reports controlled changes without mutating supplied expansion", async () => {
    const change = vi.fn();
    render(<Accordion items={items} value={["a"]} onValueChange={change} />);
    await userEvent.click(screen.getByRole("button", { name: "Last" }));
    expect(change).toHaveBeenCalledWith(["c"]);
    expect(screen.getByText("First content")).toBeVisible();
    expect(screen.getByText("Last content")).not.toBeVisible();
  });
});

describe("Pagination", () => {
  it("navigates controlled pages by keyboard and bounds both ends", async () => {
    function Demo() {
      const [page, setPage] = useState(1);
      return <Pagination className="custom" page={page} pageCount={3} onPageChange={setPage} />;
    }
    render(<Demo />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass("custom");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    screen.getByRole("button", { name: "Next" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await userEvent.keyboard(" ");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("clamps invalid pages, limits large page windows, and handles zero pages", async () => {
    const change = vi.fn();
    const { rerender } = render(<Pagination page={500} pageCount={100} onPageChange={change} />);
    expect(screen.getByRole("button", { name: "Page 100" })).toHaveAttribute("aria-current", "page");
    expect(within(screen.getByRole("navigation")).getAllByRole("button")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(change).toHaveBeenCalledWith(99);
    rerender(<Pagination page={-5} pageCount={0} onPageChange={change} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Page / })).not.toBeInTheDocument();
    rerender(<Pagination page={2} pageCount={3} disabled onPageChange={change} />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});
