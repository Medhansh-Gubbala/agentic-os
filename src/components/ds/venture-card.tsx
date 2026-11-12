"use client";

import type { CSSProperties } from "react";
import { Icon } from "./icon";
import { StatusDot, type Status } from "./status-dot";

/**
 * VentureCard — one of the ventures on the Dashboard / Ventures grid.
 * Name, one-line current focus, Linear task count, memory-updated-ago, health dot.
 */
export function VentureCard({
  name,
  focus,
  tasks,
  memoryAgo,
  health = "ok",
  running = false,
  onClick,
  className = "",
  style = {},
}: {
  name: string;
  focus?: string;
  tasks?: string | number;
  memoryAgo?: string;
  health?: Status;
  running?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        textAlign: "left",
        padding: 16,
        width: "100%",
        cursor: "pointer",
        background: "var(--card-inner)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-lg)",
        boxShadow: running ? "var(--glow-live)" : "0 2px 6px -1px rgba(0,0,0,0.35)",
        transition:
          "transform var(--dur-fast) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--card-border-strong-c)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.borderColor = "var(--card-border-c)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <StatusDot status={running ? "running" : health} size={8} />
        <span
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--color-ink-000)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
        <Icon name="arrow-up-right" size={14} color="var(--color-ink-400)" />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "var(--text-xs)",
          color: "var(--color-ink-200)",
          lineHeight: 1.35,
          minHeight: 32,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {focus}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--line-soft)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-300)" }}>
          <Icon name="circle-check" size={12} color="var(--color-ink-400)" />
          {tasks}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-300)" }}>
          <Icon name="brain" size={12} color="var(--color-ink-400)" />
          {memoryAgo}
        </span>
      </div>
    </button>
  );
}
