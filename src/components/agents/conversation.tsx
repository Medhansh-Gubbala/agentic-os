"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon, StatusDot } from "@/components/ds";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentMessage } from "./agent-message";
import type { AgentInfo, MessageRow, ThreadRow, VentureLite } from "./types";

const NO_VENTURE = "__portfolio__";

function StreamingBubble({ runId, onDone }: { runId: number; onDone: () => void }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let terminal = false;
    const es = new EventSource(`/api/runs/${runId}/stream`);
    es.addEventListener("log", (e) => setText((prev) => prev + (e as MessageEvent).data));
    es.addEventListener("status", (e) => {
      const row = JSON.parse((e as MessageEvent).data) as { status: string };
      if (row.status !== "running") terminal = true;
    });
    es.onerror = () => {
      es.close();
      if (terminal) onDone();
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

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
        }}
      >
        <StatusDot status="running" size={7} />
      </span>
      <div
        style={{
          maxWidth: 560,
          padding: "11px 14px",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-sm)",
          lineHeight: 1.55,
          background: "var(--color-room-100)",
          border: "1px solid var(--line)",
          color: "var(--color-ink-100)",
          whiteSpace: "pre-wrap",
        }}
      >
        {text || "thinking…"}
        <span
          style={{
            display: "inline-block",
            width: 7,
            height: 13,
            marginLeft: 2,
            background: "var(--color-cyan)",
            verticalAlign: "text-bottom",
            animation: "ao-caret 1s step-end infinite",
          }}
        />
      </div>
    </div>
  );
}

export function Conversation({
  agent,
  thread,
  messages,
  ventures,
  streamingRunId,
  onSend,
  onStreamDone,
}: {
  agent?: AgentInfo;
  thread: ThreadRow | null;
  messages: MessageRow[];
  ventures: VentureLite[];
  streamingRunId: number | null;
  onSend: (content: string, venture?: string) => void;
  onStreamDone: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newVenture, setNewVenture] = useState<string>(NO_VENTURE);
  const [content, setContent] = useState("");
  const isNewThread = thread === null;
  const disabled = !!streamingRunId;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streamingRunId]);

  function send() {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    const v = isNewThread ? (newVenture === NO_VENTURE ? undefined : newVenture) : (thread?.venture ?? undefined);
    onSend(trimmed, v);
    setContent("");
  }

  return (
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--card-bg)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        border: "1px solid var(--card-border-c)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: 600, color: "var(--color-ink-000)" }}>
            {agent?.name ?? "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <StatusDot status={streamingRunId ? "running" : "ok"} size={6} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-300)" }}>
              {streamingRunId ? "replying…" : agent?.description || "idle"}
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-ink-400)",
          }}
        >
          Context
        </span>
        {isNewThread ? (
          <Select value={newVenture} onValueChange={setNewVenture}>
            <SelectTrigger
              size="sm"
              className="gap-2 border-[var(--line-strong)] bg-[var(--color-room-100)]"
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-100)" }}
            >
              <Icon name="layers" size={13} color="var(--color-cyan)" />
              <SelectValue placeholder="Portfolio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_VENTURE}>Portfolio (no venture)</SelectItem>
              {ventures
                .filter((v) => v.seeded)
                .map((v) => (
                  <SelectItem key={v.slug} value={v.slug}>
                    {v.slug}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line-strong)",
              background: "var(--color-room-100)",
            }}
          >
            <Icon name="layers" size={13} color="var(--color-cyan)" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-100)" }}>
              {thread?.venture ?? "Portfolio"}
            </span>
          </div>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: 20 }}>
        {messages.length === 0 && !streamingRunId && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>
            {thread ? "no messages yet" : "start a new conversation below"}
          </p>
        )}
        {messages.map((m) => (
          <AgentMessage key={m.id} message={m} venture={thread?.venture ?? null} agent={thread?.agent ?? ""} />
        ))}
        {streamingRunId && <StreamingBubble key={streamingRunId} runId={streamingRunId} onDone={onStreamDone} />}
      </div>

      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 10, flex: "0 0 auto" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={`Message ${agent?.name ?? "agent"}…`}
          disabled={disabled}
          style={{
            flex: "1 1 auto",
            resize: "none",
            padding: "9px 12px",
            background: "var(--color-room-000)",
            border: "1px solid var(--line-strong)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-ink-100)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            outline: "none",
          }}
        />
        <Button variant="primary" icon="arrow-up" onClick={send} disabled={disabled || !content.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
