"use client";

import { useState } from "react";
import { Button, Icon, Input, ProposalCard } from "@/components/ds";
import { parseLinearResult, type Proposal } from "./types";

const KIND_ICON: Record<Proposal["kind"], string> = {
  linear_issue: "git-branch",
  gmail_draft: "mail",
};

const KIND_LABEL: Record<Proposal["kind"], string> = {
  linear_issue: "LINEAR",
  gmail_draft: "GMAIL",
};

function actionTitle(p: Proposal): string {
  return p.payload.kind === "linear_issue" ? p.payload.title : p.payload.subject;
}

function detailBody(p: Proposal): string {
  return p.payload.kind === "linear_issue" ? p.payload.description : `To: ${p.payload.to}\n\n${p.payload.body}`;
}

export function QueueCard({
  proposal,
  onResolved,
}: {
  proposal: Proposal;
  onResolved: (updated: Proposal) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [resolved, setResolved] = useState<Proposal | null>(null);

  async function act(body: { action: string; reason?: string }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/queue/${proposal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = (await res.json()) as Proposal;
        setResolved(updated);
        setRejecting(false);
        onResolved(updated);
      }
    } finally {
      setBusy(false);
    }
  }

  const shown = resolved ?? proposal;
  const linearResult = shown.kind === "linear_issue" ? parseLinearResult(shown.result) : null;

  if (rejecting) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 16,
          borderRadius: "var(--radius-md)",
          background: "var(--color-room-100)",
          border: "1px solid rgba(242,109,109,0.4)",
          boxShadow: "var(--glow-bad)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="message-square-x" size={15} color="var(--color-danger)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink-000)" }}>
            Reject — tell the agent why
          </span>
        </div>
        <Input
          autoFocus
          placeholder="e.g. Wrong send window — hold until pricing page ships"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="danger" size="sm" icon="x" disabled={busy} onClick={() => act({ action: "reject", reason: reason || undefined })}>
            Confirm reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRejecting(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <ProposalCard
        action={actionTitle(shown)}
        detail={detailBody(shown)}
        agent={[KIND_LABEL[shown.kind], shown.agent].filter(Boolean).join(" · ")}
        venture={shown.venture ?? undefined}
        icon={KIND_ICON[shown.kind]}
        time={new Date(shown.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        resolved={shown.status === "pending" ? undefined : shown.status === "rejected" ? "rejected" : "approved"}
        onApprove={() => !busy && act({ action: "approve" })}
        onReject={() => !busy && setRejecting(true)}
      />
      {shown.status === "executed" && linearResult && (
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-success)" }}>
          created{" "}
          <a href={linearResult.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
            {linearResult.identifier}
          </a>
        </p>
      )}
      {shown.status === "failed" && (
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-danger)" }}>
          {shown.reason ?? "execution failed"}
        </p>
      )}
    </div>
  );
}
