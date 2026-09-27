import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Card, CardHeader, Field, FileDownload, FileUpload, Stack, type UploadFile } from "../src/index";

export default { title: "Files/Upload and download", tags: ["autodocs"] } satisfies Meta;

export const Upload: StoryObj = {
  render: function Render() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    return (
      <div style={{ maxWidth: 560 }}>
        <FileUpload files={files} onFilesChange={setFiles} accept=".md,.txt,.json,image/*" maxSize={2 * 1024 * 1024} hint="Markdown, text, JSON or images, up to 2 MB." />
      </div>
    );
  },
};

// Simulates uploading: progress ticks up, then files are marked done.
export const WithProgress: StoryObj = {
  name: "With upload progress",
  render: function Render() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    useEffect(() => {
      const timer = setInterval(() => {
        setFiles((all) =>
          all.map((f) => {
            if (f.status === "ready") return { ...f, status: "uploading", progress: 0 };
            if (f.status === "uploading") {
              const progress = Math.min(100, (f.progress ?? 0) + 12);
              return progress >= 100 ? { ...f, status: f.file.name.includes("fail") ? "error" : "done", progress, error: f.file.name.includes("fail") ? "Upload failed" : undefined } : { ...f, progress };
            }
            return f;
          }),
        );
      }, 300);
      return () => clearInterval(timer);
    }, []);
    return (
      <div style={{ maxWidth: 560 }}>
        <FileUpload files={files} onFilesChange={setFiles} hint="Files upload as soon as they're added (a name containing “fail” shows the error state)." />
      </div>
    );
  },
};

export const InAField: StoryObj = {
  name: "Single file in a form",
  render: function Render() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    return (
      <Card style={{ maxWidth: 560 }}>
        <CardHeader title="Import a team" description="Upload a definitions export." />
        <Field label="Definitions file" hideLabel>
          <FileUpload files={files} onFilesChange={setFiles} multiple={false} accept=".json" label="Drop team.json here or browse" />
        </Field>
      </Card>
    );
  },
};

export const Download: StoryObj = {
  render: () => (
    <Stack direction="row" gap="2" wrap>
      <FileDownload filename="notes.txt" data="Plain text content" />
      <FileDownload variant="primary" filename="team.json" mimeType="application/json" data={() => JSON.stringify({ name: "demo", agents: ["lead", "coder"] }, null, 2)}>
        Export team
      </FileDownload>
      <FileDownload variant="ghost" size="sm" filename="report.csv" mimeType="text/csv" data={() => "agent,tokens\ncoder,1284\nresearcher,842\n"}>
        CSV
      </FileDownload>
    </Stack>
  ),
};
