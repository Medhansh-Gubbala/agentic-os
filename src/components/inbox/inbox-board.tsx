"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyPanel } from "@/components/page-frame";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ds";

const POLL_MS = 30000;
const READ_DELAY_MS = 2000;

type Briefing = {
  id: number;
  workflow_id: number | null;
  workflow_name: string | null;
  run_id: number | null;
  title: string;
  content: string;
  unread: number;
  created_at: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Short initials for the reading-pane monogram tile — "CEO Daily Briefing" -> "CD", manual -> "M". */
function monogram(workflowName: string | null): string {
  if (!workflowName) return "M";
  return workflowName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Plain-text preview for the list row — strip the common markdown marks, don't pull in a parser for this. */
function preview(content: string): string {
  const stripped = content.replace(/^#+\s*/gm, "").replace(/[*_`>]/g, "").replace(/\s+/g, " ").trim();
  return stripped.length > 140 ? `${stripped.slice(0, 140)}…` : stripped;
}

export function InboxBoard() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/briefings?limit=100");
    if (!res.ok) return;
    const data: { briefings: Briefing[] } = await res.json();
    setBriefings(data.briefings);
    setSelectedId((prev) => prev ?? data.briefings[0]?.id ?? null);
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (selectedId == null) return;
    const selected = briefings.find((b) => b.id === selectedId);
    if (!selected || !selected.unread) return;

    const timer = setTimeout(() => {
      fetch(`/api/briefings/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      }).then(() => {
        setBriefings((prev) => prev.map((b) => (b.id === selectedId ? { ...b, unread: 0 } : b)));
      });
    }, READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, [selectedId, briefings]);

  if (briefings.length === 0) {
    return <EmptyPanel what="Routines deliver here. CEO briefing lands 07:00 daily." />;
  }

  const selected = briefings.find((b) => b.id === selectedId);
  const unreadCount = briefings.filter((b) => b.unread === 1).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, height: "calc(100vh - 108px)", maxWidth: 1200 }}>
      <div
        style={{
          background: "var(--card-bg)",
          backdropFilter: "var(--card-blur)",
          WebkitBackdropFilter: "var(--card-blur)",
          border: "1px solid var(--card-border-c)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: 600, color: "var(--color-ink-000)" }}>
            Briefings
          </span>
          {unreadCount > 0 && <Badge tone="live">{unreadCount}</Badge>}
        </div>
        <div style={{ overflowY: "auto" }}>
          {briefings.map((b) => {
            const unread = b.unread === 1;
            const active = b.id === selectedId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "13px 16px",
                  cursor: "pointer",
                  background: active ? "var(--color-room-150)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--line-soft)",
                  borderLeft: `2px solid ${active ? "var(--color-cyan)" : "transparent"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  {unread && (
                    <span
                      style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-cyan)", boxShadow: "0 0 8px var(--color-cyan-glow)" }}
                    />
                  )}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", letterSpacing: "var(--tracking-hud)", color: "var(--color-ink-400)" }}>
                    {b.workflow_name ?? "manual"}
                  </span>
                  <span style={{ flex: "1 1 auto" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--color-ink-400)" }}>{formatTime(b.created_at)}</span>
                </div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: unread ? 600 : 500, color: unread ? "var(--color-ink-000)" : "var(--color-ink-200)", marginBottom: 4 }}>
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-ink-300)",
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {preview(b.content)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: "var(--card-bg)",
          backdropFilter: "var(--card-blur)",
          WebkitBackdropFilter: "var(--card-blur)",
          border: "1px solid var(--card-border-c)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selected && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 22px", borderBottom: "1px solid var(--line)" }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-room-000)",
                  border: "1px solid var(--color-gold)",
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-gold)",
                  flex: "0 0 auto",
                }}
              >
                {monogram(selected.workflow_name)}
              </span>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div className="eyebrow">{selected.workflow_name ?? "manual"} briefing</div>
                <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginTop: 2, color: "var(--color-ink-000)" }}>{selected.title}</h2>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)", flex: "0 0 auto" }}>
                {formatTime(selected.created_at)}
              </span>
            </div>
            <div style={{ overflowY: "auto", padding: "24px 28px" }}>
              <Markdown>{selected.content}</Markdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
