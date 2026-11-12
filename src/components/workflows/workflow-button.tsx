"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowButton as DSWorkflowButton, Button, type WorkflowState, type WorkflowType } from "@/components/ds";
import { missingRequirement, type StatusResponse, type VentureLite, type Workflow } from "./types";

const TYPE_MAP: Record<Workflow["type"], WorkflowType> = {
  manual: "MANUAL",
  skill: "SKILL",
  routine: "ROUTINE",
  agent: "AGENT",
};

const CADENCE_MAP: Record<Workflow["cadence"], "on-demand" | "scheduled" | "long-running"> = {
  on_demand: "on-demand",
  scheduled: "scheduled",
  long_running: "long-running",
};

export function WorkflowButton({
  workflow,
  ventures,
  integrations,
  onRun,
}: {
  workflow: Workflow;
  ventures: VentureLite[];
  integrations: StatusResponse["integrations"] | null;
  onRun: (runId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [venture, setVenture] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsVenture = workflow.takes_venture === 1;
  const needsInput = workflow.prompt.includes("{{input}}");
  const needsDialog = needsVenture || needsInput;
  const missing = missingRequirement(workflow, integrations);
  const disabled = missing !== null;
  const running = workflow.activeRunId !== null;
  const errored = !running && workflow.lastRun?.status === "error";

  const state: WorkflowState = running ? "running" : errored ? "error" : workflow.lastRun?.status === "done" ? "done" : "idle";

  function flashError(message: string) {
    setError(message);
    // ponytail: self-clearing flash instead of a toast system for one message
    setTimeout(() => setError((current) => (current === message ? null : current)), 2500);
  }

  async function fire(body: { venture?: string; input?: string }) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflow.slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        flashError("already running");
        return;
      }
      if (res.status === 412) {
        const data = await res.json();
        flashError(data.error ?? "not configured");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        flashError(data.error ?? "failed to start");
        return;
      }
      const { runId } = await res.json();
      setOpen(false);
      onRun(runId);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClick() {
    if (disabled) return;
    if (needsDialog) {
      setError(null);
      setOpen(true);
      return;
    }
    fire({});
  }

  return (
    <div style={{ position: "relative" }}>
      <DSWorkflowButton
        name={workflow.name}
        type={TYPE_MAP[workflow.type]}
        cadence={CADENCE_MAP[workflow.cadence]}
        scope={workflow.scope}
        state={state}
        meta={missing ? `needs ${missing}` : undefined}
        onClick={disabled ? undefined : handleClick}
        style={disabled ? { opacity: 0.45, pointerEvents: "none" } : {}}
      />
      {!open && error && (
        <span
          style={{
            position: "absolute",
            insetInline: 8,
            bottom: 6,
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-room-000)",
            border: "1px solid rgba(237,185,79,0.35)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: "var(--color-gold)",
          }}
        >
          {error}
        </span>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{workflow.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {needsVenture && (
              <div className="flex flex-col gap-1">
                <label className="eyebrow">venture</label>
                <Select value={venture} onValueChange={setVenture}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="select a venture" />
                  </SelectTrigger>
                  <SelectContent>
                    {ventures
                      .filter((v) => v.seeded)
                      .map((v) => (
                        <SelectItem key={v.slug} value={v.slug}>
                          {v.slug}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {needsInput && (
              <div className="flex flex-col gap-1">
                <label className="eyebrow">input (optional)</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--line-strong)",
                    background: "var(--color-room-000)",
                    color: "var(--color-ink-100)",
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    outline: "none",
                  }}
                />
              </div>
            )}
            {error && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-gold)" }}>
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="command"
              onClick={() => fire({ venture: venture || undefined, input: input || undefined })}
              disabled={needsVenture && !venture}
              loading={submitting}
            >
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
