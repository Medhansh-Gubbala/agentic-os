import type { CSSProperties, ReactNode } from "react";

/** Badge — small count / notification pill. tone drives color. */
export function Badge({
  children,
  tone = "neutral",
  glow = false,
  className = "",
  style = {},
}: {
  children?: ReactNode;
  tone?: "neutral" | "live" | "command" | "ok" | "bad";
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const tones = {
    neutral: { bg: "var(--color-room-250)", fg: "var(--color-ink-200)", bd: "var(--line-strong)" },
    live: { bg: "var(--color-cyan-wash)", fg: "var(--color-cyan-300)", bd: "rgba(79,209,240,0.35)" },
    command: { bg: "var(--color-gold-wash)", fg: "var(--color-gold-300)", bd: "rgba(237,185,79,0.35)" },
    ok: { bg: "var(--color-success-wash)", fg: "var(--color-success)", bd: "rgba(70,214,160,0.35)" },
    bad: { bg: "var(--color-danger-wash)", fg: "var(--color-danger)", bd: "rgba(242,109,109,0.4)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 6px",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-tiny)",
        fontWeight: 600,
        lineHeight: 1,
        boxShadow: glow && tone === "bad" ? "var(--glow-bad)" : glow && tone === "command" ? "var(--glow-command)" : "none",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
