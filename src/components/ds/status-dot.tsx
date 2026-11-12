import type { CSSProperties, ReactNode } from "react";

export type Status = "ok" | "live" | "running" | "bad" | "warn" | "idle";

/**
 * StatusDot — the atomic health/state indicator.
 * live/running dots emit a pulsing ping ring; static states are steady.
 */
export function StatusDot({
  status = "ok",
  size = 8,
  pulse,
  label,
  className = "",
  style = {},
}: {
  status?: Status;
  size?: number;
  pulse?: boolean;
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const map: Record<Status, { c: string; glow: string }> = {
    ok: { c: "var(--color-success)", glow: "var(--color-success-glow)" },
    live: { c: "var(--color-cyan)", glow: "var(--color-cyan-glow)" },
    running: { c: "var(--color-cyan)", glow: "var(--color-cyan-glow)" },
    bad: { c: "var(--color-danger)", glow: "var(--color-danger-glow)" },
    warn: { c: "var(--color-gold)", glow: "var(--color-gold-glow)" },
    idle: { c: "var(--color-ink-400)", glow: "transparent" },
  };
  const s = map[status] || map.ok;
  const doPulse = pulse != null ? pulse : status === "live" || status === "running";
  const dot = (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flex: "0 0 auto" }}>
      {doPulse && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: s.c,
            animation: "ao-ping 1.8s var(--ease-out) infinite",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: s.c,
          boxShadow: s.glow === "transparent" ? "none" : `0 0 8px ${s.glow}`,
        }}
      />
    </span>
  );
  if (!label) return <span className={className} style={style}>{dot}</span>;
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 7, ...style }}>
      {dot}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-tiny)",
          letterSpacing: "var(--tracking-mono)",
          color: "var(--color-ink-300)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </span>
  );
}
