"use client";

import { useEffect, useState } from "react";
import { Icon, Panel, StatusDot } from "@/components/ds";

type Connectors = { linear: boolean; google: boolean; claude: boolean };

const LABEL: Record<keyof Connectors, string> = {
  linear: "Linear",
  google: "Google (Gmail/Calendar)",
  claude: "Claude CLI",
};

const ICON: Record<keyof Connectors, string> = {
  linear: "git-branch",
  google: "mail",
  claude: "terminal",
};

export function ConnectorStatus() {
  const [connectors, setConnectors] = useState<Connectors | null>(null);

  useEffect(() => {
    fetch("/api/settings/connectors")
      .then((r) => r.json())
      .then(setConnectors)
      .catch(() => {});
  }, []);

  if (!connectors) return null;

  return (
    <Panel eyebrow="Integrations" title="Connectors">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(Object.keys(LABEL) as (keyof Connectors)[]).map((key) => {
          const ok = connectors[key];
          return (
            <div
              key={key}
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
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-room-000)",
                  border: "1px solid var(--line-strong)",
                  flex: "0 0 auto",
                }}
              >
                <Icon name={ICON[key]} size={15} color="var(--color-ink-200)" />
              </span>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-000)", fontWeight: 500 }}>{LABEL[key]}</div>
                {key === "google" && !ok && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
                    see HUMAN-ACTIONS.md
                  </div>
                )}
              </div>
              <StatusDot status={ok ? "ok" : "warn"} label={ok ? "Connected" : "Not configured"} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
