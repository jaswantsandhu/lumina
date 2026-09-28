import type { ReactNode } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  /** What will happen, in plain words. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (default) for deleting or removing; "primary" otherwise. */
  tone?: "danger" | "primary";
  /** Shows a spinner on the confirm button while the action runs. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before a destructive or important action. Cancel is the default focus-safe choice. */
export function ConfirmDialog({ open, title, children, confirmLabel = "Delete", cancelLabel = "Cancel", tone = "danger", busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
