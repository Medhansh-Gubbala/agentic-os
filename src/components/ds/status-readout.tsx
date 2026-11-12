import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./icon";

/**
 * StatusReadout — a single HUD metric in the dashboard status strip.
 * Big mono numeral + uppercase label + optional icon and trend/delta.
 */
export function StatusReadout({
  label,
  value,
  unit,
  icon,
  tone = "default",
  live = false,
  delta,
  className = "",
  style = {},
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  icon?: string;
  tone?: "default" | "live" | "command" | "ok" | "bad";
  live?: boolean;
  delta?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const tones: Record<string, string> = {
    default: "var(--color-ink-000)",
    live: "var(--color-cyan)",
    command: "var(--color-gold)",
    ok: "var(--color-success)",
    bad: "var(--color-danger)",
  };
  const color = tones[tone] || tones.default;
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {icon && <Icon name={icon} size={13} color="var(--color-ink-400)" />}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            letterSpacing: "var(--tracking-hud)",
            textTransform: "uppercase",
            color: "var(--color-ink-400)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            lineHeight: 1,
            color,
            letterSpacing: "-0.01em",
            textShadow: live ? `0 0 18px ${tone === "command" ? "var(--color-gold-glow)" : "var(--color-cyan-glow)"}` : "none",
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-300)" }}>{unit}</span>}
        {delta && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-tiny)",
              color: delta.startsWith("-") ? "var(--color-danger)" : "var(--color-success)",
              marginLeft: 2,
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
