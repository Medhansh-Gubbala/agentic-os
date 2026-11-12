"use client";

import { ConnectorStatus } from "./connector-status";
import { ScheduleEditor } from "./schedule-editor";
import { PromptEditor } from "./prompt-editor";
import { UsageLog } from "./usage-log";

export function SettingsPage() {
  return (
    <div style={{ maxWidth: 1200, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
      <ConnectorStatus />
      <ScheduleEditor />
      <PromptEditor />
      <UsageLog />
    </div>
  );
}
