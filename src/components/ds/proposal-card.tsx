import type { CSSProperties } from "react";
import { Icon } from "./icon";
import { Button } from "./button";
import { TypeChip, type WorkflowType } from "./type-chip";

/**
 * ProposalCard — an agent proposes an action; the human APPROVES or REJECTS.
 * Also used in the Queue. Shows the action, a detail body, source agent/venture,
 * and a resolved state (approved/rejected) once acted on.
 */
export function ProposalCard({
  action,
  detail,
  agent,
  venture,
  icon = "sparkles",
  kind,
  time,
  resolved,
  onApprove,
  onReject,
  className = "",
  style = {},
}: {
  action: string;
  detail?: string;
  agent?: string;
  venture?: string;
  icon?: string;
  kind?: WorkflowType;
  time?: string;
  resolved?: "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const isResolved = resolved === "approved" || resolved === "rejected";
  const accent = resolved === "approved" ? "var(--color-success)" : resolved === "rejected" ? "var(--color-danger)" : "var(--color-gold)";
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: "var(--radius-md)",
        background: "var(--color-room-100)",
        border: `1px solid ${isResolved ? "var(--line)" : "rgba(237,185,79,0.35)"}`,
        boxShadow: isResolved ? "0 2px 6px -1px rgba(0,0,0,0.35)" : "var(--glow-command)",
        opacity: isResolved ? 0.82 : 1,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <span
          style={{
            width: 30,
            height: 30,
            flex: "0 0 auto",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-gold-wash)",
            color: "var(--color-gold)",
            border: "1px solid rgba(237,185,79,0.3)",
          }}
        >
          <Icon name={icon} size={15} />
        </span>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink-000)" }}>
            {action}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, flexWrap: "wrap" }}>
            {agent && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-300)" }}>{agent}</span>}
            {venture && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-300)" }}>· {venture}</span>
            )}
            {kind && <TypeChip type={kind} />}
          </div>
        </div>
        {time && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)", flex: "0 0 auto" }}>{time}</span>}
      </div>

      {detail && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--color-room-000)",
            border: "1px solid var(--line-soft)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-ink-200)",
            lineHeight: 1.6,
          }}
        >
          {detail}
        </div>
      )}

      {isResolved ? (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: accent }}>
          <Icon name={resolved === "approved" ? "check" : "x"} size={13} color={accent} />
          {resolved === "approved" ? "Approved & fired" : "Rejected"}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="command" size="sm" icon="check" onClick={onApprove}>
            Approve
          </Button>
          <Button variant="danger" size="sm" icon="x" onClick={onReject}>
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
