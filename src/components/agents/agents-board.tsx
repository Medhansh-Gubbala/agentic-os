"use client";

import { useCallback, useEffect, useState } from "react";
import { AgentRail } from "./agent-rail";
import { Conversation } from "./conversation";
import type { AgentInfo, MessageRow, ThreadRow, VentureLite } from "./types";

export function AgentsBoard() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [ventures, setVentures] = useState<VentureLite[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [thread, setThread] = useState<ThreadRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [streamingRunId, setStreamingRunId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAgents = useCallback(async () => {
    const res = await fetch("/api/agents");
    if (res.ok) setAgents((await res.json()).agents);
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshAgents();
    })();
    fetch("/api/vault")
      .then((r) => r.json())
      .then(setVentures)
      .catch(() => {});
  }, [refreshAgents]);

  const refreshThreads = useCallback(async (agent: string) => {
    const res = await fetch(`/api/agents/${agent}/threads`);
    if (res.ok) setThreads((await res.json()).threads);
  }, []);

  const refreshThread = useCallback(async (threadId: number) => {
    const res = await fetch(`/api/threads/${threadId}`);
    if (res.ok) {
      const data = await res.json();
      setThread(data.thread);
      setMessages(data.messages);
    }
  }, []);

  function selectAgent(agent: string) {
    setSelectedAgent(agent);
    setThread(null);
    setMessages([]);
    setStreamingRunId(null);
    setError(null);
    void refreshThreads(agent);
  }

  function newThread() {
    setThread(null);
    setMessages([]);
    setStreamingRunId(null);
    setError(null);
  }

  async function selectThread(id: number) {
    setStreamingRunId(null);
    setError(null);
    await refreshThread(id);
  }

  async function handleSend(content: string, venture?: string) {
    if (!selectedAgent) return;
    setError(null);
    try {
      if (!thread) {
        const res = await fetch(`/api/agents/${selectedAgent}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venture, content }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "failed to send");
        await refreshThread(data.threadId);
        await refreshThreads(selectedAgent);
        setStreamingRunId(data.runId);
      } else {
        const res = await fetch(`/api/threads/${thread.id}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "failed to send");
        await refreshThread(thread.id);
        setStreamingRunId(data.runId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleStreamDone() {
    const id = thread?.id;
    setStreamingRunId(null);
    if (id) await refreshThread(id);
    if (selectedAgent) await refreshThreads(selectedAgent);
  }

  const agentInfo = agents.find((a) => a.slug === selectedAgent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 1200, height: "calc(100vh - 160px)" }}>
      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", gap: 16 }}>
        <AgentRail
          agents={agents}
          threads={threads}
          selectedAgent={selectedAgent}
          selectedThreadId={thread?.id ?? null}
          streaming={streamingRunId != null}
          onSelectAgent={selectAgent}
          onSelectThread={selectThread}
          onNewThread={newThread}
        />

        {selectedAgent ? (
          <Conversation
            agent={agentInfo}
            thread={thread}
            messages={messages}
            ventures={ventures}
            streamingRunId={streamingRunId}
            onSend={handleSend}
            onStreamDone={handleStreamDone}
          />
        ) : (
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--card-bg)",
              backdropFilter: "var(--card-blur)",
              WebkitBackdropFilter: "var(--card-blur)",
              border: "1px solid var(--card-border-c)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)" }}>
              select an agent to start
            </p>
          </div>
        )}
      </div>
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(242,109,109,0.35)",
            background: "var(--color-danger-wash)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
