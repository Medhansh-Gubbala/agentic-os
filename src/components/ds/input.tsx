"use client";

import { useState } from "react";
import type { CSSProperties, InputHTMLAttributes } from "react";
import { Icon } from "./icon";

/** Input — text field with optional leading icon and mono variant for data entry. */
export function Input({
  icon,
  mono = false,
  invalid = false,
  size = "md",
  style = {},
  className = "",
  ...rest
}: {
  icon?: string;
  mono?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "style" | "className">) {
  const [focused, setFocused] = useState(false);
  const h = size === "sm" ? 30 : size === "lg" ? 40 : 34;
  const border = invalid ? "rgba(242,109,109,0.6)" : focused ? "var(--color-cyan)" : "var(--line-strong)";
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: h,
        padding: "0 12px",
        background: "var(--color-room-000)",
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-md)",
        boxShadow: focused ? "0 0 0 3px rgba(79,209,240,0.15)" : "none",
        transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={15} color="var(--color-ink-400)" />}
      <input
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--color-ink-100)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: mono ? "var(--text-xs)" : "var(--text-sm)",
          letterSpacing: mono ? "var(--tracking-mono)" : 0,
        }}
      />
    </div>
  );
}
