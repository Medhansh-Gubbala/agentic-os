import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./icon";

/**
 * Tag — monospace scope/metadata tag, e.g. "+ projects", "@site-forge".
 * The mono, low-key sibling to TypeChip. Used for scope, repo, integration refs.
 */
export function Tag({
  children,
  icon,
  tone = "neutral",
  className = "",
  style = {},
}: {
  children?: ReactNode;
  icon?: string;
  tone?: "neutral" | "live" | "dim";
  className?: string;
  style?: CSSProperties;
}) {
  const tones = {
    neutral: { fg: "var(--color-ink-300)", bd: "var(--line)" },
    live: { fg: "var(--color-cyan-300)", bd: "rgba(79,209,240,0.3)" },
    dim: { fg: "var(--color-ink-400)", bd: "var(--line-soft)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 20,
        padding: "0 7px",
        background: "var(--color-room-000)",
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-tiny)",
        letterSpacing: "var(--tracking-mono)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}
