"use client";

import { useState } from "react";
import { Button as DsButton, Icon } from "@/components/ds";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Markdown } from "@/components/markdown";
import type { MessageRow } from "./types";

export function AgentMessage({
  message,
  venture,
  agent,
}: {
  message: MessageRow;
  venture: string | null;
  agent: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (message.role === "user") {
    return (
      <div style={{ display: "flex", flexDirection: "row-reverse", gap: 11, marginBottom: 18 }}>
        <span
          style={{
            width: 30,
            height: 30,
            flex: "0 0 auto",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-room-200)",
            border: "1px solid var(--line-strong)",
            fontFamily: "var(--font-display)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-ink-200)",
          }}
        >
          YOU
        </span>
        <div
          style={{
            maxWidth: 560,
            padding: "11px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            lineHeight: 1.55,
            background: "var(--color-room-200)",
            border: "1px solid var(--line)",
            color: "var(--color-ink-100)",
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  async function save() {
    if (!venture) return;
    setSaving(true);
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venture, agent, text }),
      });
      setSaved(true);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 11, marginBottom: 18 }}>
      <span
        style={{
          width: 30,
          height: 30,
          flex: "0 0 auto",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-room-000)",
          border: "1px solid var(--color-cyan)",
          fontFamily: "var(--font-display)",
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-cyan)",
        }}
      >
        {agent ? agent.slice(0, 3).toUpperCase() : "AI"}
      </span>
      <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        <div
          style={{
            padding: "11px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            lineHeight: 1.55,
            background: "var(--color-room-100)",
            border: "1px solid var(--line)",
            color: "var(--color-ink-100)",
          }}
        >
          <Markdown>{message.content}</Markdown>
        </div>

        {message.proposalCount > 0 && (
          <a
            href="/queue"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(237,185,79,0.35)",
              background: "var(--color-gold-wash)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-tiny)",
              color: "var(--color-gold)",
              textDecoration: "none",
            }}
          >
            <Icon name="arrow-right" size={12} color="var(--color-gold)" />
            {message.proposalCount} action{message.proposalCount === 1 ? "" : "s"} sent to the approval queue
          </a>
        )}

        {venture && (
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) setText(message.content);
            }}
          >
            <DsButton variant="ghost" size="sm" icon={saved ? "check" : "save"} onClick={() => setOpen(true)} disabled={saved}>
              {saved ? "saved" : "save to memory"}
            </DsButton>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save to {venture} memory</DialogTitle>
              </DialogHeader>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "var(--color-room-000)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-ink-100)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  outline: "none",
                }}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving || !text.trim()}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
