"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyPanel } from "@/components/page-frame";
import { Icon, StatusReadout, Tag } from "@/components/ds";
import { QueueCard } from "./queue-card";
import { parseLinearResult, type Proposal } from "./types";

const POLL_MS = 4000;

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function QueueBoard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/queue");
    if (res.ok) setProposals((await res.json()).proposals);
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

  function updateProposal(updated: Proposal) {
    setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  const pending = proposals.filter((p) => p.status === "pending");
  const history = proposals.filter((p) => p.status !== "pending");
  const approvedToday = history.filter((p) => p.status === "executed" && p.resolved_at && isToday(p.resolved_at)).length;
  const rejectedToday = history.filter((p) => p.status === "rejected" && p.resolved_at && isToday(p.resolved_at)).length;

  return (
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          gap: 40,
          padding: "14px 20px",
          background: "var(--card-bg)",
          backdropFilter: "var(--card-blur)",
          WebkitBackdropFilter: "var(--card-blur)",
          border: "1px solid var(--card-border-c)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <StatusReadout label="Pending" value={pending.length} icon="hand" tone="command" live={pending.length > 0} />
        <StatusReadout label="Approved today" value={approvedToday} icon="check" tone="ok" />
        <StatusReadout label="Rejected today" value={rejectedToday} icon="x" />
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Awaiting your decision
        </div>
        {pending.length === 0 ? (
          <EmptyPanel what="No actions waiting. Agents propose; you decide." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map((p) => (
              <QueueCard key={p.id} proposal={p} onResolved={updateProposal} />
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="eyebrow"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, margin: "4px 0 10px" }}
          >
            {historyOpen ? "Hide" : "Show"} history — {history.length} resolved
          </button>
          {historyOpen && (
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {history.map((p, i) => {
                const title = p.payload.kind === "linear_issue" ? p.payload.title : p.payload.subject;
                const ok = p.status === "executed";
                const linearResult = p.kind === "linear_issue" ? parseLinearResult(p.result) : null;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 16px",
                      background: "var(--color-room-100)",
                      borderBottom: i < history.length - 1 ? "1px solid var(--line-soft)" : "none",
                    }}
                  >
                    <Icon name={ok ? "check" : "x"} size={14} color={ok ? "var(--color-success)" : "var(--color-danger)"} />
                    <span style={{ flex: "1 1 auto", fontSize: "var(--text-sm)", color: "var(--color-ink-100)" }}>{title}</span>
                    {p.venture && <Tag>{p.venture}</Tag>}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-tiny)",
                        color: "var(--color-ink-400)",
                        width: 70,
                        textAlign: "right",
                        flex: "0 0 auto",
                      }}
                    >
                      {p.resolved_at ? new Date(p.resolved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                    {linearResult && (
                      <a
                        href={linearResult.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ flex: "0 0 auto", fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-cyan)" }}
                      >
                        view
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
