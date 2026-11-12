"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyPanel } from "@/components/page-frame";
import { Markdown } from "@/components/markdown";
import { Button, Icon, Panel } from "@/components/ds";

type VentureLite = { slug: string; seeded: boolean };
type Workflow = { slug: string; name: string; branch: string; takes_venture: 0 | 1 };
type Note = { name: string; mtime: string };

const POLL_MS = 1500;

function formatTime(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function VenturePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 16px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        background: active ? "var(--color-room-250)" : "var(--color-room-100)",
        border: "1px solid " + (active ? "var(--color-cyan)" : "var(--line)"),
        color: active ? "var(--color-cyan-300)" : "var(--color-ink-200)",
        transition: "all var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--line-strong)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      {label}
    </button>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px 14px",
        background: "var(--color-room-100)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink-000)" }}>
        {note.name}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
        {formatTime(note.mtime)}
      </span>
    </div>
  );
}

export function MarketingBoard() {
  const [ventures, setVentures] = useState<VentureLite[]>([]);
  const [generators, setGenerators] = useState<Workflow[]>([]);
  const [venture, setVenture] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

  const [generating, setGenerating] = useState<string | null>(null); // workflow slug in flight
  const [genError, setGenError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((vs: VentureLite[]) => {
        setVentures(vs);
        setVenture((prev) => prev || vs.find((v) => v.seeded)?.slug || "");
      })
      .catch(() => {});
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((data: { workflows: Workflow[] }) => {
        setGenerators(data.workflows.filter((w) => w.branch === "content" && w.takes_venture === 1));
      })
      .catch(() => {});
  }, []);

  const refreshNotes = useCallback(async (v: string) => {
    if (!v) return setNotes([]);
    const res = await fetch(`/api/marketing/notes?venture=${encodeURIComponent(v)}`);
    if (res.ok) setNotes((await res.json()).notes);
  }, []);

  useEffect(() => {
    void refreshNotes(venture);
  }, [venture, refreshNotes]);

  async function generate(slug: string, name: string) {
    setGenerating(slug);
    setGenError(null);
    setSavedPath(null);
    try {
      const runRes = await fetch(`/api/workflows/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venture, input: topic || undefined }),
      });
      if (!runRes.ok) {
        const data = await runRes.json().catch(() => ({}));
        setGenError(data.error ?? "failed to start");
        return;
      }
      const { runId } = await runRes.json();

      // ponytail: simple poll loop, mirrors WorkflowsBoard's interval pattern
      while (true) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        const res = await fetch(`/api/marketing/runs/${runId}`);
        const data = await res.json();
        if (data.status === "running") continue;
        if (data.status !== "done") {
          setGenError(`${name} failed: ${data.error ?? "unknown error"}`);
          return;
        }
        setTitle(data.title ?? name);
        setContent(data.content ?? "");
        void refreshNotes(venture); // the workflow itself may also have written a file
        return;
      }
    } finally {
      setGenerating(null);
    }
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/marketing/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venture, title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "failed to save");
        return;
      }
      setSavedPath(data.path);
      setTitle("");
      setContent("");
      void refreshNotes(venture);
    } finally {
      setSaving(false);
    }
  }

  const seededVentures = ventures.filter((v) => v.seeded);

  if (seededVentures.length === 0) {
    return <EmptyPanel what="No seeded ventures yet — nothing to draft for." />;
  }

  return (
    <div style={{ maxWidth: 1392, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-room-000)",
            border: "1px solid var(--color-tax-routine)",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-tax-routine)",
            flex: "0 0 auto",
          }}
        >
          CMO
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-ink-000)" }}>
            Marketing Workspace
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-300)", marginTop: 2 }}>
            drafts, per venture
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {seededVentures.map((v) => (
          <VenturePill key={v.slug} label={v.slug} active={v.slug === venture} onClick={() => setVenture(v.slug)} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel eyebrow="Generate" actions={genError ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-warn)" }}>{genError}</span> : undefined}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="topic / idea (optional)"
                style={{
                  padding: "9px 12px",
                  background: "var(--color-room-000)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-ink-100)",
                  fontSize: "var(--text-sm)",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {generators.map((g) => (
                  <Button
                    key={g.slug}
                    variant="command"
                    icon="sparkles"
                    loading={generating === g.slug}
                    disabled={!venture || (generating !== null && generating !== g.slug)}
                    onClick={() => generate(g.slug, g.name)}
                  >
                    {g.name}
                  </Button>
                ))}
                {generators.length === 0 && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>
                    no content-branch generators registered
                  </span>
                )}
              </div>
            </div>
          </Panel>

          <Panel
            eyebrow="Compose"
            actions={
              <Button variant="ghost" size="sm" icon={preview ? "pencil" : "eye"} onClick={() => setPreview((p) => !p)}>
                {preview ? "Edit" : "Preview"}
              </Button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="draft title"
                style={{
                  padding: "9px 12px",
                  background: "var(--color-room-000)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-ink-100)",
                  fontSize: "var(--text-sm)",
                  outline: "none",
                }}
              />
              {preview ? (
                <div
                  style={{
                    minHeight: 240,
                    padding: 12,
                    background: "var(--color-room-000)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {content ? (
                    <Markdown>{content}</Markdown>
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>
                      nothing to preview
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder="write, or generate above, then edit before saving…"
                  style={{
                    padding: 12,
                    background: "var(--color-room-000)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-ink-100)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Button
                  variant="primary"
                  icon="save"
                  onClick={save}
                  loading={saving}
                  disabled={!venture || !title.trim() || !content.trim()}
                >
                  Save to vault
                </Button>
                {saveError && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-warn)" }}>{saveError}</span>}
                {savedPath && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-success)" }}>
                    <Icon name="check" size={13} color="var(--color-success)" /> saved → {savedPath}
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <Panel eyebrow="Notes" title={venture || "—"}>
          {notes.length === 0 ? (
            <EmptyPanel what="No notes in this venture's vault folder yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notes.map((n) => (
                <NoteCard key={n.name} note={n} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
