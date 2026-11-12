import type { CSSProperties } from "react";

export type WorkflowType = "MANUAL" | "SKILL" | "ROUTINE" | "AGENT";

/**
 * TypeChip — the four workflow types, each a distinct color.
 * MANUAL (gold) · SKILL (cyan) · ROUTINE (indigo) · AGENT (teal-green)
 */
const TYPES: Record<WorkflowType, { c: string; bg: string; bd: string }> = {
  MANUAL: { c: "var(--color-tax-manual)", bg: "var(--color-tax-manual-wash)", bd: "rgba(237,185,79,0.35)" },
  SKILL: { c: "var(--color-tax-skill)", bg: "var(--color-tax-skill-wash)", bd: "rgba(79,209,240,0.35)" },
  ROUTINE: { c: "var(--color-tax-routine)", bg: "var(--color-tax-routine-wash)", bd: "rgba(139,147,247,0.35)" },
  AGENT: { c: "var(--color-tax-agent)", bg: "var(--color-tax-agent-wash)", bd: "rgba(94,224,168,0.35)" },
};

export function TypeChip({
  type = "SKILL",
  className = "",
  style = {},
}: {
  type?: WorkflowType;
  className?: string;
  style?: CSSProperties;
}) {
  const t = TYPES[type] || TYPES.SKILL;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 7px",
        background: t.bg,
        color: t.c,
        border: `1px solid ${t.bd}`,
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {type}
    </span>
  );
}
