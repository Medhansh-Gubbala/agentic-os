"use client";

import type { ReactNode } from "react";
import { AgentRosterItem, Icon, IconButton, Tag } from "@/components/ds";
import type { AgentInfo, ThreadRow } from "./types";

function groupLabel(source: string): string {
  return source === "global" ? "Global" : source;
}

function monogram(name: string): string {
  const parts = name.split(/[\s-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--color-ink-400)",
        padding: "10px 12px 8px",
      }}
    >
      {children}
    </div>
  );
}

// ponytail: discovered agents (global/venture) aren't one of the fixed CEO/CMO/CFO/CTO
// roles ds AgentRosterItem expects, so they get a neutral monogram tile instead of
// reusing that component's role-color logic.
function DiscoveredAgentItem({
  agent,
  active,
  onClick,
}: {
  agent: AgentInfo;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
          width: 36,
          height: 36,
          flex: "0 0 auto",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-room-000)",
          border: "1px solid var(--line-strong)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--color-ink-200)",
          letterSpacing: "0.04em",
        }}
      >
        {monogram(agent.name)}
      </span>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-ink-100)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {agent.name}
          </span>
          {agent.writesCode && <Tag>writes code</Tag>}
        </div>
        {agent.description && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-tiny)",
              color: "var(--color-ink-400)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {agent.description}
          </div>
        )}
      </div>
    </button>
  );
}

export function AgentRail({
  agents,
  threads,
  selectedAgent,
  selectedThreadId,
  streaming,
  onSelectAgent,
  onSelectThread,
  onNewThread,
}: {
  agents: AgentInfo[];
  threads: ThreadRow[];
  selectedAgent: string | null;
  selectedThreadId: number | null;
  streaming: boolean;
  onSelectAgent: (slug: string) => void;
  onSelectThread: (id: number) => void;
  onNewThread: () => void;
}) {
  const csuite = agents.filter((a) => a.source === "csuite");
  const groups: { label: string; agents: AgentInfo[] }[] = [];
  for (const a of agents) {
    if (a.source === "csuite") continue;
    let group = groups.find((g) => g.label === groupLabel(a.source));
    if (!group) {
      group = { label: groupLabel(a.source), agents: [] };
      groups.push(group);
    }
    group.agents.push(a);
  }

  return (
    <div
      style={{
        width: 250,
        flex: "0 0 auto",
        background: "var(--card-bg)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-xl)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: 8 }}>
        <GroupLabel>C-Suite</GroupLabel>
        {csuite.map((a) => (
          <AgentRosterItem
            key={a.slug}
            role={a.name as "CEO" | "CMO" | "CFO" | "CTO"}
            active={a.slug === selectedAgent}
            status={a.slug === selectedAgent && streaming ? "running" : "ok"}
            statusText={
              a.slug === selectedAgent && streaming
                ? "replying…"
                : `${a.threadCount} thread${a.threadCount === 1 ? "" : "s"}`
            }
            onClick={() => onSelectAgent(a.slug)}
          />
        ))}

        {groups.map((g) => (
          <div key={g.label} style={{ marginTop: 10, borderTop: "1px solid var(--line-soft)", paddingTop: 2 }}>
            <GroupLabel>{g.label}</GroupLabel>
            {g.agents.map((a) => (
              <DiscoveredAgentItem
                key={a.slug}
                agent={a}
                active={a.slug === selectedAgent}
                onClick={() => onSelectAgent(a.slug)}
              />
            ))}
          </div>
        ))}
      </div>

      {selectedAgent && (
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            borderTop: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-ink-400)",
              }}
            >
              Threads
            </span>
            <IconButton icon="plus" size={26} iconSize={13} title="New thread" onClick={onNewThread} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px 12px" }}>
            {threads.length === 0 && (
              <p
                style={{
                  padding: "6px 8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-tiny)",
                  color: "var(--color-ink-400)",
                }}
              >
                no threads yet
              </p>
            )}
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectThread(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "left",
                  cursor: "pointer",
                  background: t.id === selectedThreadId ? "var(--color-room-200)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (t.id !== selectedThreadId) e.currentTarget.style.background = "var(--color-room-150)";
                }}
                onMouseLeave={(e) => {
                  if (t.id !== selectedThreadId) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-ink-100)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title || "untitled"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
                    {new Date(t.updated_at).toLocaleString()}
                  </span>
                  {t.venture && <Tag tone="dim">{t.venture}</Tag>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 12, borderTop: "1px solid var(--line-soft)", display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
        <Icon name="shield" size={13} color="var(--color-ink-400)" />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-400)" }}>Human-in-the-loop</span>
      </div>
    </div>
  );
}
