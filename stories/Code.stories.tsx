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

export const Java: Story = {
  args: {
    title: "FeeCalculator.java",
    language: "java",
    highlightLines: [3],
    code: `public BigDecimal fee(Method method, BigDecimal amount) {
    BigDecimal fee = switch (method) {
        case CARD -> amount.multiply(CARD_RATE).add(CARD_FIXED);
        case WALLET -> amount.multiply(WALLET_RATE);
        case BANK -> amount.multiply(BANK_RATE).min(BANK_CAP);
    };
    return fee.min(amount).setScale(2, RoundingMode.HALF_EVEN);
}`,
  },
};

export const ShellAliases: Story = {
  name: "Shell (aliases)",
  parameters: { docs: { description: { story: "Aliases work: `sh`, `shell`, `zsh` and `console` all highlight as bash; `ps1` as PowerShell; `Dockerfile` as docker." } } },
  args: { title: "Run", language: "sh", lineNumbers: false, code: `cd code/day09/fees\n./mvnw test   # downloads Maven the first time\njava -jar target/fees-1.0.0.jar CARD 100.00` },
};

export const PowerShell: Story = { args: { title: "Windows", language: "ps1", lineNumbers: false, code: `cd $HOME\\code\\java-workshop\\code\\day01\nGet-Command java | Select-Object Source\njava Hello.java` } };

export const Dockerfile: Story = {
  args: {
    title: "Dockerfile",
    language: "dockerfile",
    code: `FROM node:22-alpine\nENV NODE_ENV=production PORT=8080\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --omit=dev\nUSER node\nCMD ["node", "server/index.mjs"]`,
  },
};
