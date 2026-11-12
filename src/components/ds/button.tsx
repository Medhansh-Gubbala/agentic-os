"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Icon } from "./icon";

/**
 * Button — the primary action control. Every button in Agentic OS shows state;
 * `loading` swaps the label for a running indicator.
 *
 * Variants:
 *  - primary  : cyan LIVE action (default)
 *  - command  : gold — "a human fires this" (manual runs, approvals)
 *  - secondary: neutral raised surface
 *  - ghost    : transparent, for toolbars
 *  - danger   : destructive / reject
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  disabled = false,
  className = "",
  style = {},
  ...rest
}: {
  children?: React.ReactNode;
  variant?: "primary" | "command" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "style">) {
  const sizes = {
    sm: { h: 28, px: 10, fs: "var(--text-xs)", gap: 6 },
    md: { h: 34, px: 14, fs: "var(--text-sm)", gap: 7 },
    lg: { h: 40, px: 18, fs: "var(--text-base)", gap: 8 },
  };
  const s = sizes[size] || sizes.md;

  const palettes: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(180deg, var(--color-cyan), var(--color-cyan-hover))",
      color: "var(--color-cyan-fg)",
      border: "1px solid transparent",
      boxShadow: "0 0 0 1px rgba(79,209,240,0.5), 0 4px 16px -6px var(--color-cyan-glow)",
    },
    command: {
      background: "linear-gradient(180deg, var(--color-gold), var(--color-gold-hover))",
      color: "var(--color-gold-fg)",
      border: "1px solid transparent",
      boxShadow: "0 0 0 1px rgba(237,185,79,0.5), 0 4px 16px -6px var(--color-gold-glow)",
    },
    secondary: {
      background: "var(--color-room-200)",
      color: "var(--color-ink-100)",
      border: "1px solid var(--line-strong)",
      boxShadow: "var(--inset-top-hi)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-ink-200)",
      border: "1px solid transparent",
      boxShadow: "none",
    },
    danger: {
      background: "var(--color-danger-wash)",
      color: "var(--color-danger)",
      border: "1px solid rgba(242,109,109,0.4)",
      boxShadow: "none",
    },
  };
  const p = palettes[variant] || palettes.primary;

  return (
    <button
      disabled={disabled || loading}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        fontFamily: "var(--font-display)",
        fontSize: s.fs,
        fontWeight: 600,
        letterSpacing: "0.02em",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition:
          "transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        opacity: disabled ? 0.45 : 1,
        ...p,
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = "translateY(1px) scale(0.985)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        if (!disabled) e.currentTarget.style.filter = "";
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = "brightness(1.08)";
      }}
      {...rest}
    >
      {loading ? (
        <>
          <Icon name="loader-circle" size={size === "lg" ? 16 : 14} style={{ animation: "ao-spin 0.8s linear infinite" }} />
          <span>Running</span>
        </>
      ) : (
        <>
          {icon && <Icon name={icon} size={size === "lg" ? 17 : 14} />}
          <span>{children}</span>
          {iconRight && <Icon name={iconRight} size={size === "lg" ? 17 : 14} />}
        </>
      )}
    </button>
  );
}
