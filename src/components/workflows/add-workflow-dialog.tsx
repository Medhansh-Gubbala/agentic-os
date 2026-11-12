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
import { Button, Icon, Input } from "@/components/ds";
import { BRANCHES } from "./types";

const TYPES = ["manual", "skill", "routine", "agent"] as const;
const CADENCES = ["on_demand", "scheduled", "long_running"] as const;

const EMPTY = {
  slug: "",
  name: "",
  branch: "ops" as (typeof BRANCHES)[number],
  type: "manual" as (typeof TYPES)[number],
  cadence: "on_demand" as (typeof CADENCES)[number],
  schedule_cron: "",
  scope: "",
  prompt: "",
};

export function AddWorkflowDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          schedule_cron: form.cadence === "scheduled" ? form.schedule_cron : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "failed to create workflow");
        return;
      }
      setForm(EMPTY);
      setOpen(false);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: 11,
          width: "100%",
          cursor: "pointer",
          background: "transparent",
          border: "1px dashed var(--line-strong)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-ink-300)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          transition: "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-cyan-300)";
          e.currentTarget.style.borderColor = "rgba(79,209,240,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-ink-300)";
          e.currentTarget.style.borderColor = "var(--line-strong)";
        }}
      >
        <Icon name="plus" size={15} /> Add workflow
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New workflow</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            <Field label="slug">
              <Input mono value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label="name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="branch">
              <Select value={form.branch} onValueChange={(v) => set("branch", v as typeof form.branch)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="type">
              <Select value={form.type} onValueChange={(v) => set("type", v as typeof form.type)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="cadence">
              <Select
                value={form.cadence}
                onValueChange={(v) => set("cadence", v as typeof form.cadence)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CADENCES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {form.cadence === "scheduled" && (
              <Field label="schedule_cron">
                <Input mono value={form.schedule_cron} onChange={(e) => set("schedule_cron", e.target.value)} placeholder="0 7 * * *" />
              </Field>
            )}
            <Field label="scope">
              <Input mono value={form.scope} onChange={(e) => set("scope", e.target.value)} placeholder="+ vault" />
            </Field>
            <Field label="prompt">
              <textarea
                value={form.prompt}
                onChange={(e) => set("prompt", e.target.value)}
                rows={6}
                style={{
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line-strong)",
                  background: "var(--color-room-000)",
                  color: "var(--color-ink-100)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-tiny)",
                  outline: "none",
                }}
              />
            </Field>
            {error && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-gold)" }}>
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="command"
              onClick={submit}
              disabled={!form.slug || !form.name || !form.prompt}
              loading={submitting}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="eyebrow">{label}</label>
      {children}
    </div>
  );
}
