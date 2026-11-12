"use client";

import { useEffect, useState } from "react";
import { Button, Icon, Panel, Switch } from "@/components/ds";
import type { Workflow } from "@/components/workflows/types";

export function ScheduleEditor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/workflows");
    if (!res.ok) return;
    const data = (await res.json()).workflows as Workflow[];
    setWorkflows(data);
    setDrafts(Object.fromEntries(data.map((w) => [w.slug, w.schedule_cron ?? ""])));
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function patch(slug: string, body: Record<string, unknown>) {
    setBusy(slug);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${slug}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(`${slug}: ${data.error ?? "update failed"}`);
        return;
      }
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel eyebrow="Automation" title="Routine schedules">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {workflows.map((w) => (
          <div
            key={w.slug}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 12px",
              background: "var(--color-room-100)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Icon name="clock" size={15} color={w.enabled === 1 ? "var(--color-tax-routine)" : "var(--color-ink-400)"} />
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ fontSize: "var(--text-sm)", color: w.enabled === 1 ? "var(--color-ink-000)" : "var(--color-ink-300)", fontWeight: 500 }}>
                {w.name}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>{w.cadence}</div>
            </div>
            {w.cadence === "scheduled" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  value={drafts[w.slug] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [w.slug]: e.target.value }))}
                  placeholder="0 7 * * *"
                  style={{
                    width: 110,
                    padding: "5px 8px",
                    background: "var(--color-room-000)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--color-ink-100)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    outline: "none",
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon="save"
                  disabled={busy === w.slug || drafts[w.slug] === (w.schedule_cron ?? "")}
                  onClick={() => patch(w.slug, { schedule_cron: drafts[w.slug] })}
                >
                  Save
                </Button>
              </div>
            )}
            <Switch checked={w.enabled === 1} disabled={busy === w.slug} onChange={(v) => patch(w.slug, { enabled: v ? 1 : 0 })} />
          </div>
        ))}
      </div>
      {error && (
        <p style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</p>
      )}
    </Panel>
  );
}
