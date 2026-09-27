import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

export type DownloadSource = string | Blob | (() => Promise<string | Blob> | string | Blob);

export interface FileDownloadProps extends Omit<ButtonProps, "onClick" | "loading"> {
  /** File name for the saved file. */
  filename: string;
  /** Text, a Blob, or a function returning either (e.g. fetch on demand). Ignored when href is set. */
  data?: DownloadSource;
  /** Download from a URL instead (same origin, or served with Content-Disposition). */
  href?: string;
  /** MIME type for text data (default text/plain). */
  mimeType?: string;
  /** Called if producing or saving the file fails. */
  onDownloadError?: (error: Error) => void;
  children?: ReactNode;
}

/** Saves text, a Blob, generated data or a URL as a file. */
export function FileDownload({ filename, data, href, mimeType = "text/plain;charset=utf-8", onDownloadError, children = "Download", leadingIcon, ...rest }: FileDownloadProps) {
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      let url = href;
      let revoke = false;
      if (!url) {
        const value = typeof data === "function" ? await data() : data;
        if (value === undefined) throw new Error("Nothing to download");
        const blob = value instanceof Blob ? value : new Blob([value], { type: mimeType });
        url = URL.createObjectURL(blob);
        revoke = true;
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(url!), 1000);
    } catch (err) {
      onDownloadError?.(err as Error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button onClick={save} loading={busy} leadingIcon={leadingIcon ?? <span aria-hidden="true">⤓</span>} {...rest}>
      {children}
    </Button>
  );
}
