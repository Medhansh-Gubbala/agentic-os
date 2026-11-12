import type { SessionRun } from "./types";

const COLS = "150px 1fr 90px 80px 80px 70px";

export function SessionHistory({
  runs,
  onSelect,
}: {
  runs: SessionRun[];
  onSelect: (runId: number) => void;
}) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLS,
          gap: 12,
          padding: "9px 16px",
          background: "var(--color-room-000)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-ink-400)",
        }}
      >
        <span>Venture</span>
        <span>Prompt</span>
        <span>Duration</span>
        <span>Tokens</span>
        <span>Exit</span>
        <span style={{ textAlign: "right" }}>Time</span>
      </div>
      {runs.map((r) => (
        <div
          key={r.id}
          onClick={() => onSelect(r.id)}
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 12,
            padding: "11px 16px",
            background: "var(--color-room-100)",
            borderTop: "1px solid var(--line-soft)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            alignItems: "center",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-room-150)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-room-100)")}
        >
          <span style={{ color: "var(--color-ink-100)" }}>{r.venture ?? "—"}</span>
          <span style={{ color: "var(--color-ink-200)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.prompt}>
            {r.prompt}
          </span>
          <span style={{ color: "var(--color-ink-300)" }}>{r.duration_ms ? `${Math.round(r.duration_ms / 1000)}s` : "—"}</span>
          <span style={{ color: "var(--color-ink-300)" }}>
            {r.input_tokens != null ? `${r.input_tokens}/${r.output_tokens ?? 0}` : "—"}
          </span>
          <span style={{ color: r.exit_code === 0 ? "var(--color-success)" : r.exit_code != null ? "var(--color-danger)" : "var(--color-ink-400)" }}>
            {r.exit_code != null ? `exit ${r.exit_code}` : r.status}
          </span>
          <span style={{ color: "var(--color-ink-400)", textAlign: "right" }}>{new Date(r.started_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
