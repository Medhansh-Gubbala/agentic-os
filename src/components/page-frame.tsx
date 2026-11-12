"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon, IconButton, Badge } from "@/components/ds";

type BellItem = {
  id: string;
  href: string;
  icon: string;
  tone: "live" | "command";
  title: string;
  meta: string;
  time: string;
  unread: boolean;
  briefingId?: number;
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.round(hr / 24)}d`;
}

function proposalIcon(kind: string): string {
  if (kind === "linear_issue") return "git-branch";
  if (kind === "gmail_draft") return "mail";
  return "sparkles";
}

/* Glass ↔ Solid style toggle — persists to localStorage, applies body.ao-solid */
function StyleToggle() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    setSolid(localStorage.getItem("ao_style") === "solid");
  }, []);
  useEffect(() => {
    document.body.classList.toggle("ao-solid", solid);
    localStorage.setItem("ao_style", solid ? "solid" : "glass");
  }, [solid]);
  const seg = (label: string, isOn: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        cursor: "pointer",
        border: "none",
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        letterSpacing: "0.12em",
        fontWeight: 700,
        background: isOn ? "linear-gradient(180deg, var(--color-cyan), var(--color-cyan-hover))" : "transparent",
        color: isOn ? "var(--color-cyan-fg)" : "var(--color-ink-300)",
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      }}
    >
      {label}
    </button>
  );
  return (
    <div
      title="Surface style"
      style={{
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: "var(--radius-full)",
        background: "var(--card-inner)",
        border: "1px solid var(--card-border-c)",
      }}
    >
      {seg("GLASS", !solid, () => setSolid(false))}
      {seg("SOLID", solid, () => setSolid(true))}
    </div>
  );
}

function LiveClock() {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!t) return null;
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const ss = String(t.getSeconds()).padStart(2, "0");
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-200)", letterSpacing: "0.04em" }}>
      {hh}:{mm}
      <span style={{ color: "var(--color-ink-400)" }}>:{ss}</span>
    </span>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BellItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const [briefingsRes, queueRes] = await Promise.all([
        fetch("/api/briefings?limit=10", { cache: "no-store" }),
        fetch("/api/queue?status=pending", { cache: "no-store" }),
      ]);
      const briefings = briefingsRes.ok ? await briefingsRes.json() : { briefings: [] };
      const queue = queueRes.ok ? await queueRes.json() : { proposals: [] };

      const briefingItems: BellItem[] = (briefings.briefings ?? []).map(
        (b: { id: number; title: string; workflow_name: string | null; unread: number; created_at: string }) => ({
          id: `briefing-${b.id}`,
          href: "/inbox",
          icon: "inbox",
          tone: "live" as const,
          title: b.title,
          meta: b.workflow_name ?? "briefing",
          time: timeAgo(b.created_at),
          unread: b.unread === 1,
          briefingId: b.id,
        }),
      );
      const proposalItems: BellItem[] = (queue.proposals ?? []).map(
        (p: { id: number; agent: string | null; venture: string | null; kind: string; created_at: string }) => ({
          id: `proposal-${p.id}`,
          href: "/queue",
          icon: proposalIcon(p.kind),
          tone: "command" as const,
          title: `${p.agent ?? "Agent"} proposed an action`,
          meta: `${p.venture ?? "—"} · needs approval`,
          time: timeAgo(p.created_at),
          unread: true,
        }),
      );

      setItems([...briefingItems, ...proposalItems].slice(0, 10));
    } catch {
      // ponytail: notification feed is best-effort, silently skip on failure
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((n) => n.unread).length;
  const TONE: Record<string, string> = { command: "var(--color-gold)", live: "var(--color-cyan)" };

  async function markAllRead() {
    const unreadBriefingIds = items.filter((n) => n.unread && n.briefingId != null).map((n) => n.briefingId as number);
    await Promise.all(
      unreadBriefingIds.map((id) =>
        fetch(`/api/briefings/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read" }),
        }).catch(() => {}),
      ),
    );
    load();
  }

  async function markRead(item: BellItem) {
    if (item.briefingId == null) return;
    fetch(`/api/briefings/${item.briefingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    })
      .then(load)
      .catch(() => {});
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconButton icon="bell" badge={unread || undefined} active={open} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 340,
            zIndex: 60,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border-strong-c)",
            borderRadius: "var(--radius-xl)",
            backdropFilter: "var(--card-blur)",
            WebkitBackdropFilter: "var(--card-blur)",
            boxShadow: "var(--shadow-pop)",
            overflow: "hidden",
            animation: "ao-rise var(--dur-base) var(--ease-out)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderBottom: "1px solid var(--card-border-c)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink-000)" }}>
              Notifications
            </span>
            {unread > 0 && <Badge tone="live">{unread}</Badge>}
            <div style={{ flex: "1 1 auto" }} />
            <button
              onClick={markAllRead}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-ink-300)",
                padding: "2px 4px",
              }}
            >
              MARK READ
            </button>
            <IconButton icon="x" size={26} iconSize={14} onClick={() => setOpen(false)} />
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto", padding: 6 }}>
            {items.length === 0 && (
              <div style={{ padding: "28px 0", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>
                Nothing to review.
              </div>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => {
                  setOpen(false);
                  if (n.unread) markRead(n);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "10px 8px",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(148,190,222,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flex: "0 0 auto",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--card-inner)",
                    border: `1px solid ${TONE[n.tone]}55`,
                    color: TONE[n.tone],
                  }}
                >
                  <Icon name={n.icon} size={14} />
                </span>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-xs)", color: n.unread ? "var(--color-ink-000)" : "var(--color-ink-200)", fontWeight: n.unread ? 600 : 400 }}>
                    {n.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-400)", marginTop: 2 }}>{n.meta}</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                  {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-cyan)", boxShadow: "0 0 6px var(--color-cyan-glow)" }} />}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-400)" }}>{n.time}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PageFrame({
  title,
  scope,
  children,
}: {
  title: string;
  scope: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
      <header style={{ height: 64, flex: "0 0 auto", display: "flex", alignItems: "center", gap: 14, padding: "0 24px 0 12px" }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div className="eyebrow" style={{ color: "var(--color-ink-400)" }}>
            {scope}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, lineHeight: 1.1, marginTop: 2, color: "var(--color-ink-000)" }}>
            {title}
          </h1>
        </div>
        <StyleToggle />
        <LiveClock />
        <NotificationsBell />
      </header>
      <main
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "16px 24px 28px",
          animation: "ao-rise var(--dur-slow) var(--ease-out)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export function EmptyPanel({ what }: { what: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-xl)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        boxShadow: "var(--shadow-glass)",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card-inner)",
          border: "1px solid var(--card-border-c)",
          color: "var(--color-ink-400)",
        }}
      >
        <Icon name="inbox" size={16} />
      </span>
      <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>{what}</p>
    </div>
  );
}
