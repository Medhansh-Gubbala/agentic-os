"use client";

import type { CSSProperties } from "react";

/** Switch — toggle for enabling routines / connectors. Cyan when on. */
export function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = "",
  style = {},
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={className}
      style={{
        position: "relative",
        width: 38,
        height: 22,
        flex: "0 0 auto",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "var(--radius-full)",
        border: "1px solid " + (checked ? "rgba(79,209,240,0.5)" : "var(--line-strong)"),
        background: checked ? "var(--color-cyan-wash)" : "var(--color-room-000)",
        boxShadow: checked ? "var(--glow-live)" : "none",
        opacity: disabled ? 0.5 : 1,
        transition:
          "background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: checked ? "var(--color-cyan)" : "var(--color-ink-300)",
          boxShadow: checked ? "0 0 10px var(--color-cyan-glow)" : "0 1px 2px rgba(0,0,0,0.5)",
          transition: "left var(--dur-base) var(--ease-spring), background var(--dur-base) var(--ease-out)",
        }}
      />
    </button>
  );
}
