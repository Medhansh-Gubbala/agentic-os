"use client";

import type { CSSProperties } from "react";

export type TabItem = { id: string; label: string; count?: number };

/** Tabs — underline tab bar for switching views (e.g. venture detail sections). */
export function Tabs({
  tabs = [],
  value,
  onChange,
  accent = "var(--color-cyan)",
  className = "",
  style = {},
}: {
  tabs?: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  accent?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const active = value != null ? value : tabs[0]?.id;
  return (
    <div className={className} style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--line)", ...style }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange?.(t.id)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: isActive ? "var(--color-ink-000)" : "var(--color-ink-300)",
              transition: "color var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "var(--color-ink-100)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "var(--color-ink-300)";
            }}
          >
            {t.label}
            {t.count != null && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: isActive ? accent : "var(--color-ink-400)" }}>
                {t.count}
              </span>
            )}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  bottom: -1,
                  height: 2,
                  background: accent,
                  borderRadius: 2,
                  boxShadow: `0 0 8px ${accent}`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
