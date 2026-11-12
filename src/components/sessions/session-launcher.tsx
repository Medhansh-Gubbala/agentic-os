"use client";

import { useState } from "react";
import { Button, Icon, Input } from "@/components/ds";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SessionLauncher({
  ventures,
  repos,
  onLaunched,
}: {
  ventures: string[];
  repos: Record<string, string>;
  onLaunched: (runId: number) => void;
}) {
  const [venture, setVenture] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  async function launch() {
    setLaunching(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venture, prompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "failed to launch");
        return;
      }
      setPrompt("");
      onLaunched(data.runId);
    } finally {
      setLaunching(false);
    }
  }

  const disabled = launching || !venture || !prompt.trim();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 14,
        background: "var(--card-bg)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Select value={venture} onValueChange={setVenture}>
          <SelectTrigger
            className="gap-2 border-[var(--line-strong)] bg-[var(--color-room-000)]"
            style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-100)" }}
          >
            <Icon name="git-branch" size={14} color="var(--color-cyan)" />
            <SelectValue placeholder="select a venture" />
          </SelectTrigger>
          <SelectContent>
            {ventures.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          mono
          placeholder="Describe the task for Claude Code…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) launch();
          }}
          style={{ flex: "1 1 auto" }}
        />
        <Button variant="command" icon="play" onClick={launch} loading={launching} disabled={disabled && !launching}>
          Launch session
        </Button>
      </div>

      {venture && repos[venture] && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
          {repos[venture]}
        </span>
      )}
      {error && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</p>
      )}
    </div>
  );
}
