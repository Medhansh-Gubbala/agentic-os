"use client";

import { useEffect, useState } from "react";
import { Button, Panel, Tabs } from "@/components/ds";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workflow } from "@/components/workflows/types";

const AGENTS = ["ceo", "cmo", "cfo", "cto"] as const;

const textareaStyle = {
  width: "100%",
  padding: 12,
  background: "var(--color-room-000)",
  border: "1px solid var(--line-strong)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-ink-100)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  lineHeight: 1.6,
  outline: "none",
  boxSizing: "border-box" as const,
};

export function PromptEditor() {
  const [mode, setMode] = useState<"workflow" | "persona">("persona");

  return (
    <Panel eyebrow="Agents" title="Persona editor">
      <Tabs
        value={mode}
        onChange={(v) => setMode(v as "workflow" | "persona")}
        tabs={[
          { id: "persona", label: "Persona" },
          { id: "workflow", label: "Workflow" },
        ]}
        style={{ marginBottom: 14 }}
      />
      {mode === "workflow" ? <WorkflowPromptEditor /> : <PersonaPromptEditor />}
    </Panel>
  );
}

function WorkflowPromptEditor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((data: { workflows: Workflow[] }) => {
        setWorkflows(data.workflows);
        if (data.workflows.length > 0) {
          setSlug(data.workflows[0].slug);
          setDraft(data.workflows[0].prompt);
        }
      })
      .catch(() => {});
  }, []);

  function selectSlug(next: string) {
    setSlug(next);
    setDraft(workflows.find((w) => w.slug === next)?.prompt ?? "");
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${slug}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "save failed");
        return;
      }
      setWorkflows((prev) => prev.map((w) => (w.slug === slug ? { ...w, prompt: draft } : w)));
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  const current = workflows.find((w) => w.slug === slug);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Select value={slug} onValueChange={selectSlug}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {workflows.map((w) => (
            <SelectItem key={w.slug} value={w.slug}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        rows={10}
        style={textareaStyle}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="primary" size="sm" icon="save" disabled={busy || !slug || draft === current?.prompt} onClick={save} loading={busy}>
          Save
        </Button>
        {saved && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-success)" }}>
            saved — next run uses this
          </span>
        )}
        {error && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</span>}
      </div>
    </div>
  );
}

function PersonaPromptEditor() {
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>("ceo");
  const [original, setOriginal] = useState("");
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(false);
    setError(null);
    fetch(`/api/settings/personas/${agent}`)
      .then((r) => r.json())
      .then((data: { content: string }) => {
        setOriginal(data.content);
        setDraft(data.content);
      })
      .catch(() => {});
  }, [agent]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/settings/personas/${agent}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "save failed");
        return;
      }
      setOriginal(draft);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {AGENTS.map((a) => (
          <button
            key={a}
            onClick={() => setAgent(a)}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              textTransform: "uppercase",
              background: agent === a ? "var(--color-room-250)" : "var(--color-room-000)",
              border: "1px solid " + (agent === a ? "var(--color-cyan)" : "var(--line)"),
              color: agent === a ? "var(--color-cyan-300)" : "var(--color-ink-300)",
            }}
          >
            {a}
          </button>
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink-400)",
        }}
      >
        System prompt
      </div>
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        rows={14}
        style={{ ...textareaStyle, minHeight: 132, resize: "vertical" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="primary" size="sm" icon="save" disabled={busy || draft === original} onClick={save} loading={busy}>
          Save persona
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDraft(original)} disabled={draft === original}>
          Reset
        </Button>
        {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-success)" }}>saved</span>}
        {error && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</span>}
      </div>
    </div>
  );
}
