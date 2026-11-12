"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Badge, StatusDot } from "@/components/ds";

type NavTone = "live" | "command";

const NAV: { href: string; label: string; icon: string; badgeKey?: "inbox" | "queue"; tone?: NavTone }[] = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/workflows", label: "Workflows", icon: "workflow" },
  { href: "/ventures", label: "Ventures", icon: "layers" },
  { href: "/agents", label: "Agents", icon: "users-round" },
  { href: "/inbox", label: "Inbox", icon: "inbox", badgeKey: "inbox", tone: "live" },
  { href: "/queue", label: "Queue", icon: "list-todo", badgeKey: "queue", tone: "command" },
  { href: "/sessions", label: "Sessions", icon: "square-terminal" },
  { href: "/marketing", label: "Marketing", icon: "megaphone" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const RAIL_CLOSED = "var(--sidebar-w-closed)";
const RAIL_OPEN = "var(--sidebar-w-open)";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavItem({
  href,
  label,
  icon,
  badge,
  tone,
  active,
  open,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  tone?: NavTone;
  active: boolean;
  open: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={open ? undefined : label}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: 6,
        borderRadius: "var(--radius-lg)",
        cursor: "pointer",
        overflow: "hidden",
        background: active ? "var(--glass-raised)" : hover ? "rgba(148,190,222,0.06)" : "transparent",
        border: "1px solid " + (active ? "var(--card-border-c)" : "transparent"),
        backdropFilter: active ? "var(--card-blur)" : "none",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          flex: "0 0 auto",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: active ? "linear-gradient(180deg, var(--color-cyan), var(--color-cyan-600))" : "var(--card-inner)",
          border: "1px solid " + (active ? "transparent" : "var(--card-border-c)"),
          color: active ? "var(--color-cyan-fg)" : "var(--color-ink-300)",
          boxShadow: active ? "0 0 16px -4px var(--color-cyan-glow)" : "none",
          transition: "background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)",
        }}
      >
        <Icon name={icon} size={16} strokeWidth={active ? 2 : 1.75} />
        {badge != null && !open && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: tone === "command" ? "var(--color-gold)" : "var(--color-cyan)",
              border: "2px solid var(--color-room-000)",
              boxShadow: `0 0 8px ${tone === "command" ? "var(--color-gold-glow)" : "var(--color-cyan-glow)"}`,
            }}
          />
        )}
      </span>
      <span
        style={{
          flex: "1 1 auto",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-sm)",
          fontWeight: active ? 600 : 500,
          color: active ? "var(--color-ink-000)" : "var(--color-ink-200)",
          whiteSpace: "nowrap",
          opacity: open ? 1 : 0,
          transform: open ? "translateX(0)" : "translateX(-6px)",
          transition: "opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)",
        }}
      >
        {label}
      </span>
      {badge != null && (
        <span style={{ opacity: open ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out)", flex: "0 0 auto", marginRight: 4 }}>
          <Badge tone={tone === "command" ? "command" : "live"}>{badge}</Badge>
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [queuePending, setQueuePending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/briefings", { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setInboxUnread(data.unread ?? 0);
        }
      } catch {
        // ponytail: badge counts are best-effort, silently skip on failure
      }
      try {
        const res = await fetch("/api/queue?status=pending", { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setQueuePending(data.proposals?.length ?? 0);
        }
      } catch {
        // ponytail: badge counts are best-effort, silently skip on failure
      }
    }
    poll();
    const id = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const badgeFor = (key?: "inbox" | "queue") => {
    if (key === "inbox") return inboxUnread > 0 ? inboxUnread : undefined;
    if (key === "queue") return queuePending > 0 ? queuePending : undefined;
    return undefined;
  };

  return (
    <aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        width: open ? RAIL_OPEN : RAIL_CLOSED,
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px 14px",
        transition: "width var(--dur-slow) var(--ease-hud)",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 6px 18px", flex: "0 0 auto" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-md)",
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, var(--color-cyan), var(--color-cyan-600))",
            color: "var(--color-cyan-fg)",
            boxShadow: "0 0 18px -4px var(--color-cyan-glow)",
          }}
        >
          <Icon name="terminal" size={18} strokeWidth={2.25} />
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "var(--color-ink-000)",
            whiteSpace: "nowrap",
            opacity: open ? 1 : 0,
            transition: "opacity var(--dur-base) var(--ease-out)",
          }}
        >
          AGENTIC <span style={{ color: "var(--color-cyan)" }}>OS</span>
        </span>
      </div>

      <nav style={{ flex: "1 1 auto", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={badgeFor(item.badgeKey)}
            tone={item.tone}
            active={isActive(pathname, item.href)}
            open={open}
          />
        ))}
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 6px 0",
          borderTop: "1px solid var(--card-border-c)",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            flex: "0 0 auto",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--card-inner)",
            border: "1px solid rgba(79,209,240,0.35)",
          }}
        >
          <StatusDot status="live" size={7} />
        </span>
        <div style={{ minWidth: 0, whiteSpace: "nowrap", opacity: open ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-100)" }}>CLAUDE CODE</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-cyan-300)", letterSpacing: "0.1em" }}>
            CONDUCTOR · LIVE
          </div>
        </div>
      </div>
    </aside>
  );
}
