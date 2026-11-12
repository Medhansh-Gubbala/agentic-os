"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ConsoleLineKind = "system" | "cmd" | "output" | "success" | "error" | "dim";

export type ConsoleLine = {
  kind?: ConsoleLineKind;
  time?: string;
  text: string;
};

const KIND_COLOR: Record<ConsoleLineKind, string> = {
  system: "var(--color-ink-400)",
  cmd: "var(--color-cyan-300)",
  output: "var(--color-ink-200)",
  success: "var(--color-success)",
  error: "var(--color-danger)",
  dim: "var(--color-ink-400)",
};

const FOLLOW_PX = 40;

/**
 * ConsoleStream — the Claude Code live console. Monospace log with typed line
 * kinds. Two independent reveal modes:
 *  - `streaming` (demo/typewriter): lines reveal progressively at a fixed
 *    cadence and always auto-follow — built for the kit mockups replaying a
 *    static, already-known line array.
 *  - `live` (real SSE): every line currently in `lines` renders immediately
 *    (the caller already streams them in), the last line gets a blinking
 *    caret, and auto-scroll only follows the bottom while the user hasn't
 *    scrolled up — it resumes once they scroll back near the bottom.
 * The two are mutually exclusive; `live` wins if both are passed.
 */
export function ConsoleStream({
  lines = [],
  streaming = false,
  live = false,
  height = 320,
  className = "",
  style = {},
}: {
  lines?: ConsoleLine[];
  streaming?: boolean;
  live?: boolean;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [shown, setShown] = useState(streaming ? 0 : lines.length);
  const [following, setFollowing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (live) return; // live mode shows every line as-is, no typewriter reveal
    if (!streaming) {
      setShown(lines.length);
      return;
    }
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) clearInterval(id);
    }, 420);
    return () => clearInterval(id);
  }, [streaming, live, lines.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (live && !following) return; // user scrolled up to read backlog — leave them be
    el.scrollTop = el.scrollHeight;
  }, [shown, lines.length, live, following]);

  function handleScroll() {
    if (!live) return;
    const el = scrollRef.current;
    if (!el) return;
    setFollowing(el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_PX);
  }

  const visible = live ? lines : lines.slice(0, shown);
  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={className}
      style={{
        height,
        overflowY: "auto",
        padding: 16,
        background: "var(--color-room-000)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        lineHeight: 1.65,
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {visible.map((ln, i) => {
        const kind = ln.kind || "output";
        const isLastVisible = i === visible.length - 1;
        const isNewest = (streaming && i === shown - 1) || (live && isLastVisible);
        const showCaret = live ? isLastVisible : streaming && isLastVisible && i === lines.length - 1;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              color: KIND_COLOR[kind] || "var(--color-ink-200)",
              animation: isNewest ? "ao-rise var(--dur-base) var(--ease-out)" : "none",
              textShadow: isNewest && (kind === "cmd" || kind === "success") ? "0 0 12px currentColor" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {ln.time && <span style={{ color: "var(--color-ink-400)", flex: "0 0 auto" }}>{ln.time}</span>}
            {kind === "cmd" && <span style={{ color: "var(--color-cyan)", flex: "0 0 auto" }}>{"❯"}</span>}
            <span style={{ flex: "1 1 auto", fontWeight: kind === "success" || kind === "error" ? 600 : 400 }}>
              {ln.text}
              {showCaret && (
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 13,
                    marginLeft: 3,
                    background: "var(--color-cyan)",
                    verticalAlign: "text-bottom",
                    animation: "ao-caret 1s step-end infinite",
                  }}
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
