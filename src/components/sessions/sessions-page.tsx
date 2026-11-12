"use client";

import { useCallback, useEffect, useState } from "react";
import { SessionLauncher } from "./session-launcher";
import { SessionConsole } from "./session-console";
import { SessionHistory } from "./session-history";
import { EmptyPanel } from "@/components/page-frame";
import type { SessionRun } from "./types";

const POLL_MS = 10000;

export function SessionsPage() {
  const [ventures, setVentures] = useState<string[]>([]);
  const [repos, setRepos] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  const refreshRuns = useCallback(async () => {
    const res = await fetch("/api/sessions");
    if (res.ok) setRuns((await res.json()).runs);
  }, []);

  useEffect(() => {
    fetch("/api/sessions/repos")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setRepos(data);
        setVentures(Object.keys(data));
      })
      .catch(() => {});
    void (async () => {
      await refreshRuns();
    })();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refreshRuns();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshRuns]);

  function handleLaunched(runId: number) {
    setActiveRunId(runId);
    void refreshRuns();
  }

  return (
    <div style={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: 16 }}>
      <SessionLauncher ventures={ventures} repos={repos} onLaunched={handleLaunched} />

      {activeRunId !== null ? (
        <SessionConsole key={activeRunId} runId={activeRunId} onKilled={refreshRuns} />
      ) : (
        <EmptyPanel what="No sessions yet. Launch deep work on any venture repo." />
      )}

      {runs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-ink-400)",
              margin: "4px 0 0",
            }}
          >
            Run history
          </div>
          <SessionHistory runs={runs} onSelect={setActiveRunId} />
        </div>
      )}
    </div>
  );
}
