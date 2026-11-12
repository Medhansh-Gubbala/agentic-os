import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageFrame, EmptyPanel } from "@/components/page-frame";
import { Markdown } from "@/components/markdown";
import { getVenture, parseFrontmatter } from "@/lib/vault";
import { linearConfigured, projectForVenture } from "@/lib/linear";
import { listRuns } from "@/lib/db";
import { daysAgo } from "@/lib/format";
import { Icon, StatusDot, Tag, type TabItem } from "@/components/ds";
import { ButtonLink } from "@/components/nav-button";
import { VentureTabs } from "./venture-tabs";

export const dynamic = "force-dynamic";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s % 60)}s`;
}

function formatTokens(input: number | null, output: number | null): string {
  const total = (input ?? 0) + (output ?? 0);
  if (total === 0) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(total);
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "16px 12px",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: "var(--color-ink-400)",
        background: "var(--color-room-000)",
        border: "1px dashed var(--line-soft)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {text}
    </div>
  );
}

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venture = getVenture(slug);
  if (!venture) notFound();

  const configured = linearConfigured();
  const project = configured ? await projectForVenture(slug).catch(() => null) : null;

  if (!venture.seeded) {
    return (
      <PageFrame title={slug} scope="+ vault">
        <EmptyPanel what="Unseeded venture — no North Star in the vault yet. Seed it from a terminal session, then it fills in here automatically." />
      </PageFrame>
    );
  }

  const openIssues = project?.issues.filter((i) => !["completed", "canceled"].includes(i.state.type)) ?? [];
  const ventureRuns = listRuns({ limit: 200 }).filter((r) => r.venture?.toLowerCase() === slug.toLowerCase());
  const focusLine = venture.northStar!.currentFocus.split("\n")[0] ?? "";
  const memDays = venture.memory?.lastEntryDate
    ? // eslint-disable-next-line react-hooks/purity -- server component, computed per request
      Math.floor((Date.now() - new Date(venture.memory.lastEntryDate).getTime()) / 86_400_000)
    : Infinity;

  const tabs: TabItem[] = [
    { id: "north", label: "North Star" },
    { id: "decisions", label: "Decisions", count: venture.decisions.length },
    { id: "memory", label: "Memory" },
    { id: "linear", label: "Linear", count: openIssues.length },
    { id: "runs", label: "Recent runs", count: ventureRuns.length },
  ];

  const panels: Record<string, ReactNode> = {
    north: (
      <div style={{ maxWidth: 720 }}>
        <Markdown>{parseFrontmatter(venture.northStar!.raw).body}</Markdown>
      </div>
    ),
    decisions:
      venture.decisions.length === 0 ? (
        <EmptyRow text="No decisions logged yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {venture.decisions.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "13px 0", borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-ink-400)", width: 84, flex: "0 0 auto" }}>
                {d.date}
              </span>
              <span style={{ flex: "1 1 auto", fontSize: "var(--text-sm)", color: "var(--color-ink-100)" }}>{d.text}</span>
            </div>
          ))}
        </div>
      ),
    memory: venture.memory ? (
      <div style={{ padding: "14px 16px", background: "var(--color-room-000)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-sm)", maxHeight: 480, overflowY: "auto" }}>
        <Markdown>{venture.memory.raw}</Markdown>
      </div>
    ) : (
      <EmptyRow text="No MEMORY.md yet." />
    ),
    linear: !configured ? (
      <EmptyRow text="LINEAR_API_KEY not configured — see Settings." />
    ) : !project ? (
      <EmptyRow text={`No Linear project named "${slug}".`} />
    ) : openIssues.length === 0 ? (
      <EmptyRow text="No open issues." />
    ) : (
      <div>
        {openIssues.map((i) => (
          <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-400)", width: 58, flex: "0 0 auto" }}>
              {i.identifier}
            </span>
            <a href={i.url} target="_blank" rel="noreferrer" style={{ flex: "1 1 auto", fontSize: "var(--text-sm)", color: "var(--color-ink-100)" }}>
              {i.title}
            </a>
            <Tag>{i.state.name}</Tag>
          </div>
        ))}
      </div>
    ),
    runs:
      ventureRuns.length === 0 ? (
        <EmptyRow text="No runs recorded for this venture yet." />
      ) : (
        <div>
          {ventureRuns.slice(0, 30).map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 0",
                borderBottom: "1px solid var(--line-soft)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
              }}
            >
              <Icon name="terminal" size={13} color="var(--color-cyan)" />
              <span style={{ flex: "1 1 auto", color: "var(--color-ink-100)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.prompt}
              </span>
              <span style={{ color: "var(--color-ink-300)" }}>{formatDuration(r.duration_ms)}</span>
              <span style={{ color: "var(--color-ink-400)" }}>{formatTokens(r.input_tokens, r.output_tokens)}</span>
              <span
                style={{
                  color:
                    r.status === "done"
                      ? "var(--color-success)"
                      : r.status === "running"
                        ? "var(--color-cyan)"
                        : "var(--color-danger)",
                }}
              >
                {r.status === "done" ? `exit ${r.exit_code ?? 0}` : r.status}
              </span>
              <span style={{ color: "var(--color-ink-400)", width: 64, textAlign: "right" }}>{daysAgo(r.started_at)}</span>
            </div>
          ))}
        </div>
      ),
  };

  return (
    <PageFrame title={slug} scope={`+ vault${project ? " + linear" : ""}`}>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <StatusDot status={memDays <= 7 ? "ok" : memDays <= 30 ? "warn" : "bad"} size={10} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600 }}>{slug}</h2>
          <Tag icon="git-branch">{slug.toLowerCase()}</Tag>
          <div style={{ flex: "1 1 auto" }} />
          <ButtonLink href="/sessions" variant="primary" icon="play">
            Run session
          </ButtonLink>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-200)", margin: "0 0 18px" }}>{focusLine}</p>
        <VentureTabs tabs={tabs} panels={panels} />
      </div>
    </PageFrame>
  );
}
