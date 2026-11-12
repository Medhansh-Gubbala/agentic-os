"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ds";
import { WorkflowButton } from "./workflow-button";
import { RunDrawer } from "./run-drawer";
import { AddWorkflowDialog } from "./add-workflow-dialog";
import { ConductorHeader } from "./conductor-header";
import { BRANCHES, type StatusResponse, type VentureLite, type Workflow } from "./types";

const POLL_MS = 3000;

const BRANCH_ICON: Record<(typeof BRANCHES)[number], string> = {
  memory: "brain",
  productivity: "zap",
  research: "search",
  content: "pen-line",
  finance: "banknote",
  ops: "settings",
};

export function WorkflowsBoard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [ventures, setVentures] = useState<VentureLite[]>([]);
  const [drawer, setDrawer] = useState<{ runId: number; name: string } | null>(null);

  const refresh = useCallback(async () => {
    const [wfRes, statusRes] = await Promise.all([fetch("/api/workflows"), fetch("/api/status")]);
    if (wfRes.ok) setWorkflows((await wfRes.json()).workflows);
    if (statusRes.ok) setStatus(await statusRes.json());
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
    fetch("/api/vault")
      .then((r) => r.json())
      .then(setVentures)
      .catch(() => {});

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

  function openRun(runId: number, name: string) {
    setDrawer({ runId, name });
    refresh();
  }

  const byBranch = new Map<string, Workflow[]>();
  for (const w of workflows) {
    if (!byBranch.has(w.branch)) byBranch.set(w.branch, []);
    byBranch.get(w.branch)!.push(w);
  }

  return (
    <div style={{ maxWidth: 1392, display: "flex", flexDirection: "column", gap: 4 }}>
      <ConductorHeader status={status} />

      <div style={{ height: 22, display: "flex", justifyContent: "center" }}>
        <span style={{ width: 1, background: "linear-gradient(var(--color-cyan-600), transparent)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${BRANCHES.length}, 1fr)`, gap: 14, alignItems: "start" }}>
        {BRANCHES.map((branch) => {
          const flows = (byBranch.get(branch) ?? []).filter((w) => w.enabled === 1);
          return (
            <div key={branch} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-room-200)",
                    border: "1px solid var(--line)",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon name={BRANCH_ICON[branch]} size={13} color="var(--color-ink-200)" />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-tiny)",
                    letterSpacing: "var(--tracking-hud)",
                    color: "var(--color-ink-300)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {branch}
                </span>
                <span style={{ flex: "1 1 auto", height: 1, background: "var(--line-soft)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
                  {flows.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {flows.map((w) => (
                  <WorkflowButton
                    key={w.slug}
                    workflow={w}
                    ventures={ventures}
                    integrations={status?.integrations ?? null}
                    onRun={(runId) => openRun(runId, w.name)}
                  />
                ))}
              </div>

              {branch === "ops" && <AddWorkflowDialog onCreated={refresh} />}
            </div>
          );
        })}
      </div>

      {drawer && (
        <RunDrawer
          key={drawer.runId}
          runId={drawer.runId}
          workflowName={drawer.name}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}
