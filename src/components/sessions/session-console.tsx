"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ConsoleStream, StatusDot, Tag, type ConsoleLine } from "@/components/ds";

type ConsoleRun = {
  id: number;
  venture: string | null;
  status: "running" | "done" | "error" | "killed";
  started_at: string;
  finished_at: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
};

// ponytail: our SSE feed is raw text chunks, not the demo kit's pre-split line
// objects — split on newline and tag the obvious cases (error text, final
// outcome); no need for anything smarter than that.
function toLines(log: string, run: ConsoleRun | null): ConsoleLine[] {
  const raw = log.split("\n").filter((l) => l.length > 0);
  return raw.map((text, i) => {
    const isLast = i === raw.length - 1;
    if (/error/i.test(text)) return { text, kind: "error" };
    if (isLast && run && run.status !== "running") {
      return { text, kind: run.status === "done" ? "success" : "error" };
    }
    return { text, kind: "output" };
  });
}

export function SessionConsole({
  runId,
  onKilled,
}: {
  runId: number;
  onKilled?: () => void;
}) {
  const [log, setLog] = useState("");
  const [run, setRun] = useState<ConsoleRun | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [killing, setKilling] = useState(false);

  useEffect(() => {
    // ponytail: the stream endpoint already sends full log + status once for
    // finished runs and closes, so it doubles as the "fetch history log" path
    // — one data source for both a freshly launched run and a history click.
    setLog("");
    setRun(null);
    const es = new EventSource(`/api/runs/${runId}/stream`);
    es.addEventListener("log", (e) => setLog((prev) => prev + (e as MessageEvent).data));
    es.addEventListener("status", (e) => {
      setRun(JSON.parse((e as MessageEvent).data) as ConsoleRun);
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, [runId]);

  useEffect(() => {
    if (run && run.status !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [run]);

  async function kill() {
    setKilling(true);
    try {
      await fetch(`/api/sessions/${runId}/kill`, { method: "POST" });
    } finally {
      setKilling(false);
      onKilled?.();
    }
  }

  const running = run?.status === "running";
  const elapsedMs = run
    ? (run.finished_at ? new Date(run.finished_at).getTime() : now) - new Date(run.started_at).getTime()
    : 0;
  const elapsed = `${Math.floor(elapsedMs / 60000)}:${String(Math.floor((elapsedMs / 1000) % 60)).padStart(2, "0")}`;

  return (
    <div
      style={{
        background: "var(--card-bg)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: running ? "var(--glow-live)" : "var(--shadow-glass)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--line)" }}>
        <StatusDot status={running ? "running" : run?.status === "error" || run?.status === "killed" ? "bad" : "ok"} size={7} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-100)" }}>
          claude-code · {run?.venture ?? "—"}
        </span>
        <Tag tone="dim">run #{runId}</Tag>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>{elapsed}</span>
        <div style={{ flex: "1 1 auto" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: running ? "var(--color-cyan-300)" : "var(--color-ink-400)",
          }}
        >
          {running ? "streaming…" : run ? `exited ${run.status}` : "connecting"}
        </span>
        {running && (
          <Button variant="danger" size="sm" icon="square" onClick={kill} loading={killing}>
            Kill
          </Button>
        )}
      </div>

      <div style={{ padding: 12 }}>
        <ConsoleStream lines={toLines(log, run)} live={running} height={300} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 16px",
          borderTop: "1px solid var(--line)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-tiny)",
          color: "var(--color-ink-400)",
        }}
      >
        <span>
          {run && run.status !== "running"
            ? `${run.input_tokens ?? 0} in / ${run.output_tokens ?? 0} out${
                run.duration_ms ? ` · ${Math.round(run.duration_ms / 1000)}s` : ""
              }${run.cost_usd != null ? ` · $${run.cost_usd.toFixed(3)}` : ""}`
            : "streaming…"}
        </span>
      </div>
    </div>
  );
}
