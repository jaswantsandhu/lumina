import { fireEvent, render, screen } from "@testing-library/react";
import { AppShell, NavItem, NavSection } from "../index";

describe("AppShell drawer", () => {
  it("opens from the menu button and closes on nav and Escape", () => {
    const { container } = render(
      <AppShell title="App" sidebar={<NavSection label="Main"><NavItem>Home</NavItem></NavSection>}>
        content
      </AppShell>,
    );
    const app = container.firstElementChild!;
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(app).toHaveClass("lm-app--open");
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(app).not.toHaveClass("lm-app--open");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(app).not.toHaveClass("lm-app--open");
  });
});
