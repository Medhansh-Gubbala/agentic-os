"use client";

import type { CSSProperties } from "react";
import { StatusDot, type Status } from "./status-dot";

export type AgentRole = "CEO" | "CMO" | "CFO" | "CTO";

/**
 * AgentRosterItem — a C-suite agent in the Agents rail (CEO/CMO/CFO/CTO).
 * Shows a monogram tile, role title, and live status.
 */
export const ROLE_TITLE: Record<AgentRole, string> = {
  CEO: "Chief Executive",
  CMO: "Chief Marketing",
  CFO: "Chief Financial",
  CTO: "Chief Technology",
};

export function AgentRosterItem({
  role,
  status = "idle",
  active = false,
  statusText,
  onClick,
  className = "",
  style = {},
}: {
  role: AgentRole;
  status?: Status;
  active?: boolean;
  statusText?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const ROLE_COLOR: Record<AgentRole, string> = {
    CEO: "var(--color-gold)",
    CMO: "var(--color-tax-routine)",
    CFO: "var(--color-success)",
    CTO: "var(--color-cyan)",
  };
  const accent = ROLE_COLOR[role] || "var(--color-cyan)";
  const title = ROLE_TITLE[role] || role;
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        background: active ? "var(--color-room-200)" : "transparent",
        border: "1px solid " + (active ? "var(--line-strong)" : "transparent"),
        transition: "background var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--color-room-150)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          position: "relative",
          width: 36,
          height: 36,
          flex: "0 0 auto",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-room-000)",
          border: `1px solid ${accent}`,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: accent,
          letterSpacing: "0.04em",
          boxShadow: status === "live" || status === "running" ? `0 0 14px -4px ${accent}` : "none",
        }}
      >
        {role}
      </span>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-ink-100)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <StatusDot status={status} size={6} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-tiny)",
              color: "var(--color-ink-300)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {statusText || status}
          </span>
        </div>
      </div>
    </button>
  );
}
