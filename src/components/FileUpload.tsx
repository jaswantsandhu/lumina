import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cx } from "../utils";

export interface UploadFile {
  id: string;
  file: File;
  /** 0–100 while uploading. */
  progress?: number;
  status?: "ready" | "uploading" | "done" | "error";
  error?: string;
}

export interface FileUploadProps {
  /** Selected files (controlled). */
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  /** e.g. "image/*,.pdf" — same as the input's accept attribute. */
  accept?: string;
  multiple?: boolean;
  /** Bytes. Larger files are rejected with an error message. */
  maxSize?: number;
  maxFiles?: number;
  label?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

function matches(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

let counter = 0;

/** Drag-and-drop or click to choose files; lists them with size, progress and errors. */
export function FileUpload({ files, onFilesChange, accept, multiple = true, maxSize, maxFiles, label = "Drop files here or browse", hint, disabled, className }: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const add = (list: FileList | null) => {
    if (!list || disabled) return;
    const problems: string[] = [];
    const next: UploadFile[] = [];
    for (const file of Array.from(list)) {
      if (!matches(file, accept)) problems.push(`${file.name}: file type not allowed`);
      else if (maxSize && file.size > maxSize) problems.push(`${file.name}: larger than ${formatBytes(maxSize)}`);
      else next.push({ id: `lm-file-${++counter}`, file, status: "ready" });
    }
    let all = multiple ? [...files, ...next] : next.slice(0, 1);
    if (maxFiles && all.length > maxFiles) {
      problems.push(`Only ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`);
      all = all.slice(0, maxFiles);
    }
    setRejected(problems);
    onFilesChange(all);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    add(e.dataTransfer.files);
  };

  return (
    <div className={cx("lm-upload", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={hint ? hintId : undefined}
        className={cx("lm-upload__zone", dragging && "lm-upload__zone--dragging", disabled && "lm-upload__zone--disabled")}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <span className="lm-upload__icon" aria-hidden="true">
          ⇪
        </span>
        <span className="lm-upload__label">{label}</span>
        {hint && (
          <span id={hintId} className="lm-upload__hint">
            {hint}
          </span>
        )}
      </div>
      <input
        ref={input}
        type="file"
        className="lm-visually-hidden"
        tabIndex={-1}
        aria-label={typeof label === "string" ? label : "Choose files"}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        data-testid="lm-file-input"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      {rejected.length > 0 && (
        <ul className="lm-upload__errors" role="alert">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="lm-upload__list" aria-label="Selected files">
          {files.map((f) => (
            <li key={f.id} className={cx("lm-upload__file", f.status === "error" && "lm-upload__file--error")}>
              <span className="lm-upload__file-icon" aria-hidden="true">
                ▤
              </span>
              <span className="lm-upload__file-main">
                <span className="lm-upload__file-name">{f.file.name}</span>
                <span className="lm-upload__file-meta">
                  {formatBytes(f.file.size)}
                  {f.status === "uploading" && ` · ${Math.round(f.progress ?? 0)}%`}
                  {f.status === "done" && " · uploaded"}
                  {f.error && ` · ${f.error}`}
                </span>
                {f.status === "uploading" && (
                  <span className="lm-upload__progress" role="progressbar" aria-valuenow={Math.round(f.progress ?? 0)} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${f.file.name}`}>
                    <span style={{ width: `${f.progress ?? 0}%` }} />
                  </span>
                )}
              </span>
              <button type="button" className="lm-upload__remove" aria-label={`Remove ${f.file.name}`} onClick={() => onFilesChange(files.filter((x) => x.id !== f.id))} disabled={disabled}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
