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

export async function roster(teamId: string) {
  // Sub-agents the lead can delegate to.
  return db.select().from(agents).where(eq(agents.teamId, teamId));
}

export const Save = () => <Button variant="primary">Save</Button>;`,
  },
};

export const Json: Story = { args: { title: "opencode.json", language: "json", code: JSON.stringify({ permission: { bash: { "*": "allow", "rm *": "ask" }, webfetch: "deny" } }, null, 2) } };

export const Shell: Story = { args: { title: "setup", language: "bash", lineNumbers: false, code: "bin/setup --domain agents.example.com --email you@example.com\nbin/compose logs -f control-plane" } };

export const Python: Story = { args: { language: "python", code: 'def delegate(task: str) -> str:\n    """Send work to a sub-agent."""\n    return f"delegated: {task}"\n' } };

export const Wrapped: Story = { args: { language: "markdown", wrap: true, lineNumbers: false, code: "You are the coder on the demo team. You receive one well-scoped subtask at a time from the team lead. When you are done, end with a short summary of what you did and how you checked it." } };
