import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils";
import type { Tone } from "./Badge";

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  /** Milliseconds before it disappears; 0 keeps it until dismissed. Default 4000. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Shows brief, non-blocking notifications. Wrap the app once. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = next.current++;
      setItems((all) => [...all.slice(-4), { id, ...options }]);
      const duration = options.duration ?? 4000;
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="lm-toaster" role="region" aria-label="Notifications" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx("lm-toast", `lm-toast--${t.tone ?? "neutral"}`)} role={t.tone === "danger" ? "alert" : "status"}>
            <div className="lm-toast__content">
              <p className="lm-toast__title">{t.title}</p>
              {t.description && <p className="lm-toast__description">{t.description}</p>}
            </div>
            <button type="button" className="lm-toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** toast({ title, description, tone }) from anywhere under <ToastProvider>. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}
