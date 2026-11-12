"use client";

import { useState } from "react";
import Link from "next/link";
import type { Venture } from "@/lib/vault";
import type { LinearProject } from "@/lib/linear";
import { daysAgo, splitDatedLine } from "@/lib/format";
import { Icon, StatusDot, type Status } from "@/components/ds";

/**
 * VentureCard — Dashboard/Ventures grid tile. Visually matches ds/venture-card.tsx
 * (VentureCard) but rendered as a <Link> root instead of a <button>, since this
 * component is a server-rendered navigation target, not a client onClick handler.
 */
export function VentureCard({
  venture,
  linear,
  linearConfigured,
  running = false,
}: {
  venture: Venture;
  linear: LinearProject | null;
  linearConfigured: boolean;
  running?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const { slug, seeded, northStar, memory, decisions } = venture;

  if (!seeded) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 16,
          background: "var(--card-inner)",
          border: "1px dashed var(--card-border-c)",
          borderRadius: "var(--radius-lg)",
          opacity: 0.55,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot status="idle" size={8} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-ink-200)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {slug}
          </span>
        </div>
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)" }}>
          unseeded · no north star yet
        </p>
      </div>
    );
  }

  const focus = splitDatedLine(northStar!.currentFocus.split("\n")[0] ?? "");
  const memDays = memory?.lastEntryDate
    ? // eslint-disable-next-line react-hooks/purity -- server-rendered, recomputed per request
      Math.floor((Date.now() - new Date(memory.lastEntryDate).getTime()) / 86_400_000)
    : Infinity;
  const health: Status = memDays <= 7 ? "ok" : memDays <= 30 ? "warn" : "bad";
  const tasksLabel = !linearConfigured ? "—" : linear ? `${linear.counts.open} open` : "no linear";

  return (
    <Link
      href={`/ventures/${slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 16,
        background: "var(--card-inner)",
        border: `1px solid ${hover ? "var(--card-border-strong-c)" : "var(--card-border-c)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: running ? "var(--glow-live)" : "0 2px 6px -1px rgba(0,0,0,0.35)",
        transform: hover ? "translateY(-2px)" : "none",
        transition:
          "transform var(--dur-fast) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <StatusDot status={running ? "running" : health} size={8} />
        <span
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--color-ink-000)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {slug}
        </span>
        <Icon name="arrow-up-right" size={14} color="var(--color-ink-400)" />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "var(--text-xs)",
          color: "var(--color-ink-200)",
          lineHeight: 1.35,
          minHeight: 32,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {focus.text}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingTop: 8,
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: "var(--color-ink-300)",
          }}
        >
          <Icon name="circle-check" size={12} color="var(--color-ink-400)" />
          {tasksLabel}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: "var(--color-ink-300)",
          }}
        >
          <Icon name="brain" size={12} color="var(--color-ink-400)" />
          {memory?.lastEntryDate ? daysAgo(memory.lastEntryDate) : "never"}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-tiny)",
            color: "var(--color-ink-300)",
          }}
        >
          {decisions.length} decisions
        </span>
      </div>
    </Link>
  );
}
