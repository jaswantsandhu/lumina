import type { Meta, StoryObj } from "@storybook/react";
import { CodeView } from "../src/index";

const meta = { title: "Data display/CodeView", component: CodeView, tags: ["autodocs"] } satisfies Meta<typeof CodeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  args: {
    title: "src/team/service.ts",
    language: "tsx",
    highlightLines: [4, 5],
    code: `import { eq } from "drizzle-orm";

export async function members(projectId: string) {
  // Everyone who can edit the project.
  return db.select().from(people).where(eq(people.projectId, projectId));
}

export const Save = () => <Button variant="primary">Save</Button>;`,
  },
};

export const Json: Story = { args: { title: "settings.json", language: "json", code: JSON.stringify({ theme: "system", notifications: { email: true, digest: "weekly" }, beta: false }, null, 2) } };

export const Shell: Story = { args: { title: "setup", language: "bash", lineNumbers: false, code: "npm install @jaswantsandhu/lumina\nnpm run storybook" } };

export const Python: Story = { args: { language: "python", code: 'def greet(name: str) -> str:\n    """Say hello."""\n    return f"Hello, {name}!"\n' } };

export const Wrapped: Story = { args: { language: "markdown", wrap: true, lineNumbers: false, code: "Release notes are written for the people using the product, not the people building it. Lead with what changed for them, then how to try it, and keep internal details for the changelog." } };
