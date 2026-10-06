import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

export interface UseConsentOptions {
  /** localStorage key for the choice, e.g. "myapp-analytics-consent-v1". Change the version to ask again. */
  key: string;
  /** false: nothing needs consent (e.g. no analytics ID configured), so never ask. Default true. */
  enabled?: boolean;
  /** Runs when consent is granted (now, or on a later visit): load the optional script here. Runs once per page load. */
  onGrant?: () => void;
  /** Runs when consent that was granted is withdrawn: delete its cookies (see clearCookies) and reload. */
  onRevoke?: () => void;
}

export interface Consent {
  enabled: boolean;
  /** true (granted), false (declined) or null (not decided yet). */
  status: boolean | null;
  /** Show the ConsentDialog now. */
  needsDecision: boolean;
  decide: (granted: boolean) => void;
}

const granted = new Set<string>();
const read = (key: string): boolean | null => {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "null")?.granted;
    return typeof v === "boolean" ? v : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, JSON.stringify({ granted: value, at: new Date().toISOString() }));
  } catch {
    /* private mode: ask again next visit */
  }
};

/**
 * Opt-in consent for one optional purpose (usually analytics). Nothing runs until the user accepts; declining is as
 * easy as accepting; the choice and its time are remembered; withdrawing calls onRevoke.
 */
export function useConsent({ key, enabled = true, onGrant, onRevoke }: UseConsentOptions): Consent {
  const [status, setStatus] = useState<boolean | null>(() => (enabled ? read(key) : null));
  useEffect(() => {
    if (enabled && status === true && !granted.has(key)) {
      granted.add(key);
      onGrant?.();
    }
  }, [enabled, status, key, onGrant]);
  return {
    enabled,
    status,
    needsDecision: enabled && status === null,
    decide: (value) => {
      const withdrawing = status === true && value === false;
      write(key, value);
      setStatus(value);
      if (withdrawing) {
        granted.delete(key);
        onRevoke?.();
      }
    },
  };
}

/** Delete cookies whose names start with any of `prefixes` (e.g. ["_ga"]), on this host and its parent domain. */
export function clearCookies(prefixes: string[]) {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((name) => prefixes.some((p) => name.startsWith(p)))
    .forEach((name) => domains.forEach((d) => { document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`; }));
}

export interface ConsentDialogProps {
  open: boolean;
  onDecide: (granted: boolean) => void;
  title?: ReactNode;
  /** What's used, why, and that the site works either way. */
  description: ReactNode;
  acceptLabel?: string;
  declineLabel?: string;
}

/** The required choice: no close button, Escape does nothing, and both options are equally prominent. */
export function ConsentDialog({ open, onDecide, title = "Can we use analytics?", description, acceptLabel = "Accept analytics", declineLabel = "Decline" }: ConsentDialogProps) {
  return (
    <Dialog
      open={open}
      dismissible={false}
      title={title}
      description={description}
      footer={
        <>
          <Button onClick={() => onDecide(false)}>{declineLabel}</Button>
          <Button onClick={() => onDecide(true)}>{acceptLabel}</Button>
        </>
      }
    />
  );
}

export interface CookieSettingsProps {
  consent: Consent;
  title?: ReactNode;
  /** What the choice covers, e.g. "Google Analytics". */
  service?: string;
  className?: string;
}

/** The current choice with buttons to change it. Put it at the top of the privacy page. */
export function CookieSettings({ consent, title = "Cookie settings", service = "Analytics", className }: CookieSettingsProps) {
  const state = consent.status === true ? "On" : consent.status === false ? "Off" : "Not decided yet";
  return (
    <section className={cx("lm-cookie-settings", className)} aria-label={typeof title === "string" ? title : "Cookie settings"}>
      <div>
        <p className="lm-cookie-settings__title">{title}</p>
        <p className="lm-cookie-settings__state" aria-live="polite">
          {service}: <strong>{state}</strong>
        </p>
      </div>
      <div className="lm-cookie-settings__actions">
        <Button size="sm" variant={consent.status === false ? "primary" : "secondary"} disabled={consent.status === false} onClick={() => consent.decide(false)}>
          {consent.status === true ? "Withdraw consent" : "Decline"}
        </Button>
        <Button size="sm" variant={consent.status === true ? "primary" : "secondary"} disabled={consent.status === true} onClick={() => consent.decide(true)}>
          Accept
        </Button>
      </div>
    </section>
  );
}
