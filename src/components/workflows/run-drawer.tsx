"use client";

import { useEffect, useState } from "react";
import { ConsoleStream, IconButton, StatusDot, type Status } from "@/components/ds";

type RunStatus = {
  id: number;
  status: "running" | "done" | "error" | "killed";
  started_at: string;
  finished_at: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
};

const STATUS_DOT: Record<RunStatus["status"], Status> = {
  running: "live",
  done: "ok",
  error: "bad",
  killed: "bad",
};

export function RunDrawer({
  runId,
  workflowName,
  onClose,
}: {
  runId: number;
  workflowName: string;
  onClose: () => void;
}) {
  const [log, setLog] = useState("");
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [streamLost, setStreamLost] = useState(false);

  useEffect(() => {
    // ponytail: parent remounts this component with key={runId} on a new run,
    // so a fresh instance always starts with fresh state — no reset needed here.
    let terminal = false;

    const es = new EventSource(`/api/runs/${runId}/stream`);
    es.addEventListener("log", (e) => setLog((prev) => prev + (e as MessageEvent).data));
    es.addEventListener("status", (e) => {
      const row = JSON.parse((e as MessageEvent).data) as RunStatus;
      setStatus(row);
      if (row.status !== "running") terminal = true;
    });
    es.onerror = () => {
      if (!terminal) setStreamLost(true);
      es.close();
    };
    return () => es.close();
  }, [runId]);

  const running = !status || status.status === "running";
  const duration =
    status?.finished_at && status?.started_at
      ? Math.round(
          (new Date(status.finished_at).getTime() - new Date(status.started_at).getTime()) / 1000,
        )
      : null;

  return (
    <aside
      style={{
        position: "fixed",
        insetBlock: 0,
        right: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        width: 480,
        background: "var(--card-bg)",
        borderLeft: "1px solid var(--card-border-strong-c)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        boxShadow: "var(--shadow-pop)",
        animation: "ao-rise var(--dur-base) var(--ease-out)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink-000)" }}>
            {workflowName}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>run #{runId}</div>
        </div>
        <IconButton icon="x" onClick={onClose} />
      </header>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
        <StatusDot
          status={streamLost ? "warn" : STATUS_DOT[status?.status ?? "running"]}
          label={streamLost ? "stream lost — run continues server-side" : status?.status ?? "running"}
        />
      </div>

      <ConsoleStream
        lines={log ? log.split("\n").filter(Boolean).map((text) => ({ text })) : [{ text: "waiting for output…", kind: "dim" }]}
        live={running}
        style={{ flex: "1 1 auto", minHeight: 0, height: "auto", border: "none", borderRadius: 0 }}
      />

      {status && status.status !== "running" && (
        <footer
          style={{
            borderTop: "1px solid var(--line)",
            padding: "12px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: "var(--color-ink-400)",
          }}
        >
          {status.input_tokens ?? 0} in / {status.output_tokens ?? 0} out
          {duration !== null && ` · ${duration}s`}
          {status.cost_usd != null && ` · $${status.cost_usd.toFixed(3)}`}
        </footer>
      )}
    </aside>
  );
}
