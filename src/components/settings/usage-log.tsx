"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyPanel } from "@/components/page-frame";
import { Panel, Tag } from "@/components/ds";

type UsageRun = {
  id: number;
  kind: "workflow" | "chat" | "session";
  venture: string | null;
  workflow_slug: string | null;
  status: "running" | "done" | "error" | "killed";
  started_at: string;
  duration_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
};

const STATUS_COLOR: Record<UsageRun["status"], string> = {
  running: "var(--color-cyan)",
  done: "var(--color-success)",
  error: "var(--color-danger)",
  killed: "var(--color-ink-400)",
};

const COLS = "70px 90px 1fr 90px 130px 90px 1fr";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function ventureTokens(runs: UsageRun[]): [string, number][] {
  const byVenture = new Map<string, number>();
  for (const r of runs) {
    const key = r.venture ?? "portfolio";
    const tokens = (r.input_tokens ?? 0) + (r.output_tokens ?? 0);
    byVenture.set(key, (byVenture.get(key) ?? 0) + tokens);
  }
  return [...byVenture.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
}

export function UsageLog() {
  const [runs, setRuns] = useState<UsageRun[] | null>(null);

  useEffect(() => {
    fetch("/api/settings/usage")
      .then((r) => r.json())
      .then((data: { runs: UsageRun[] }) => setRuns(data.runs))
      .catch(() => setRuns([]));
  }, []);

  const byVenture = useMemo(() => (runs ? ventureTokens(runs) : []), [runs]);
  const max = Math.max(1, ...byVenture.map(([, v]) => v));
  const total = byVenture.reduce((sum, [, v]) => sum + v, 0);

  if (!runs) return null;

  return (
    <Panel
      eyebrow="Usage"
      title="Tokens · by venture"
      actions={total > 0 ? <Tag tone="live">{formatTokens(total)} total</Tag> : undefined}
    >
      {byVenture.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
          {byVenture.map(([name, val]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 130,
                  fontSize: "var(--text-xs)",
                  color: "var(--color-ink-200)",
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
              <div style={{ flex: "1 1 auto", height: 8, background: "var(--color-room-000)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(val / max) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-cyan-600), var(--color-cyan))",
                    borderRadius: "var(--radius-full)",
                    boxShadow: "0 0 8px var(--color-cyan-glow)",
                  }}
                />
              </div>
              <span style={{ width: 60, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-300)", flex: "0 0 auto" }}>
                {formatTokens(val)}
              </span>
            </div>
          ))}
        </div>
      )}

      {runs.length === 0 ? (
        <EmptyPanel what="No runs yet." />
      ) : (
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              gap: 12,
              padding: "9px 12px",
              background: "var(--color-room-000)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-ink-400)",
            }}
          >
            <span>Id</span>
            <span>Kind</span>
            <span>Workflow/venture</span>
            <span>Status</span>
            <span>In/out</span>
            <span>Duration</span>
            <span>Started</span>
          </div>
          {runs.map((r) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: 12,
                padding: "9px 12px",
                background: "var(--color-room-100)",
                borderTop: "1px solid var(--line-soft)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--color-ink-300)" }}>{r.id}</span>
              <span style={{ color: "var(--color-ink-400)" }}>{r.kind}</span>
              <span style={{ color: "var(--color-ink-100)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.workflow_slug ?? r.venture ?? "—"}
              </span>
              <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>
              <span style={{ color: "var(--color-ink-300)" }}>{r.input_tokens != null ? `${r.input_tokens}/${r.output_tokens ?? 0}` : "—"}</span>
              <span style={{ color: "var(--color-ink-300)" }}>{r.duration_ms ? `${Math.round(r.duration_ms / 1000)}s` : "—"}</span>
              <span style={{ color: "var(--color-ink-400)" }}>{new Date(r.started_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
