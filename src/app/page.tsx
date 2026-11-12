import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { VentureCard } from "@/components/venture-card";
import { listVentures } from "@/lib/vault";
import { linearConfigured, listProjects } from "@/lib/linear";
import {
  db,
  listWorkflows,
  listActiveRuns,
  listRuns,
  listProposals,
  listBriefings,
  unreadBriefingCount,
  type RunRow,
  type WorkflowRow,
} from "@/lib/db";
import { Icon, Panel, StatusDot, TypeChip, GlowingEffect, type WorkflowType } from "@/components/ds";
import { ButtonLink, NeonButtonLink } from "@/components/nav-button";

export const dynamic = "force-dynamic";

// ---------- helpers (screen-local, real-data-only — no fabricated deltas/progress) ----------

function greeting(): string {
  // eslint-disable-next-line react-hooks/purity -- server component, computed per request
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

function formatCompactTokens(n: number): string {
  if (n <= 0) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

function elapsedStr(startedAt: string): string {
  // eslint-disable-next-line react-hooks/purity -- server component, computed per request
  const s = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function timeAgo(iso: string): string {
  // eslint-disable-next-line react-hooks/purity -- server component, computed per request
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.round(hr / 24)}d`;
}

function runTypeOf(run: RunRow, workflowsById: Map<number, WorkflowRow>): WorkflowType {
  if (run.kind === "workflow" && run.workflow_id) {
    const w = workflowsById.get(run.workflow_id);
    if (w) return w.type.toUpperCase() as WorkflowType;
  }
  if (run.kind === "chat") return "AGENT";
  return "MANUAL"; // a human-fired terminal session
}

function flowNameOf(run: RunRow, workflowsById: Map<number, WorkflowRow>): string {
  if (run.workflow_id) {
    const w = workflowsById.get(run.workflow_id);
    if (w) return w.name;
  }
  return run.prompt.length > 42 ? `${run.prompt.slice(0, 42)}…` : run.prompt;
}

function heroSummary(activeRuns: RunRow[], pendingCount: number, blockedVenture: string | null): string {
  if (activeRuns.length === 0) {
    if (pendingCount > 0) {
      return `No workflows running right now. ${pendingCount} approval${pendingCount === 1 ? "" : "s"} waiting on you.`;
    }
    return "No workflows running right now. All quiet.";
  }
  const ventures = [...new Set(activeRuns.map((r) => r.venture).filter(Boolean))] as string[];
  const list = ventures.slice(0, 3);
  const names =
    list.length === 0
      ? "the conductor"
      : list.length === 1
        ? list[0]
        : list.length === 2
          ? `${list[0]} and ${list[1]}`
          : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
  let s = `${activeRuns.length} workflow${activeRuns.length === 1 ? "" : "s"} executing across ${names}.`;
  if (pendingCount > 0) {
    s += blockedVenture ? ` ${blockedVenture} is blocked and needs you.` : ` ${pendingCount} approval${pendingCount === 1 ? "" : "s"} waiting on you.`;
  }
  return s;
}

// ---------- KPI row ----------

function KpiCard({
  label,
  value,
  unit,
  icon,
  tile = "live",
  href,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  tile?: "live" | "command";
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 20px",
        borderRadius: "var(--radius-xl)",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border-c)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        boxShadow: "var(--shadow-glass)",
        minWidth: 0,
      }}
    >
      <GlowingEffect spread={28} proximity={56} inactiveZone={0.01} borderWidth={1.5} variant={tile === "command" ? "command" : "live"} />
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-ink-300)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 27,
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--color-ink-000)",
              letterSpacing: "-0.01em",
            }}
          >
            {value}
          </span>
          {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-400)" }}>{unit}</span>}
        </div>
      </div>
      <span
        style={{
          width: 44,
          height: 44,
          flex: "0 0 auto",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            tile === "command"
              ? "linear-gradient(180deg, var(--color-gold), var(--color-gold-hover))"
              : "linear-gradient(180deg, var(--color-cyan), var(--color-cyan-hover))",
          color: tile === "command" ? "var(--color-gold-fg)" : "var(--color-cyan-fg)",
          boxShadow: `0 0 20px -6px ${tile === "command" ? "var(--color-gold-glow)" : "var(--color-cyan-glow)"}`,
        }}
      >
        <Icon name={icon} size={20} strokeWidth={2} />
      </span>
    </Link>
  );
}

// ---------- token-flow area chart, built from real per-run token usage ----------

function smoothPath(pts: [number, number][]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)],
      p1 = pts[i],
      p2 = pts[i + 1],
      p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function TokenChart({ points }: { points: { tokens: number; label: string }[] }) {
  const W = 560,
    H = 190,
    PAD = 8;
  const max = Math.max(...points.map((p) => p.tokens), 1);
  const tp: [number, number][] = points.map((p, i) => [
    PAD + (i * (W - PAD * 2)) / Math.max(1, points.length - 1),
    H - 26 - (p.tokens / max) * (H - 46),
  ]);
  const area = `${smoothPath(tp)} L ${tp[tp.length - 1][0]} ${H - 24} L ${tp[0][0]} ${H - 24} Z`;
  const last = tp[tp.length - 1];
  const labelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="aoAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(79,209,240,0.32)" />
          <stop offset="100%" stopColor="rgba(79,209,240,0)" />
        </linearGradient>
        <filter id="aoLineGlow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4FD1F0" floodOpacity="0.55" />
        </filter>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={W - PAD}
          y1={H - 26 - f * (H - 46)}
          y2={H - 26 - f * (H - 46)}
          stroke="rgba(148,190,222,0.12)"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#aoAreaFill)" />
      <path d={smoothPath(tp)} fill="none" stroke="#4FD1F0" strokeWidth="2.5" filter="url(#aoLineGlow)" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#4FD1F0" filter="url(#aoLineGlow)" />
      <circle cx={last[0]} cy={last[1]} r="8" fill="none" stroke="rgba(79,209,240,0.4)" strokeWidth="1" />
      {labelIdx.map((i, k) => (
        <text
          key={i}
          x={tp[i][0]}
          y={H - 8}
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--color-ink-400)"
          textAnchor={k === 0 ? "start" : k === labelIdx.length - 1 ? "end" : "middle"}
        >
          {points[i].label}
        </text>
      ))}
    </svg>
  );
}

// ---------- right-rail bits ----------

function RunningRow({ flow, elapsed, type, venture }: { flow: string; elapsed: string; type: WorkflowType; venture: string }) {
  return (
    <div style={{ padding: "11px 12px", borderRadius: "var(--radius-lg)", background: "var(--card-inner)", border: "1px solid var(--card-border-c)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot status="running" size={7} />
        <span
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-ink-100)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {flow}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-cyan-300)" }}>{elapsed}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "7px 0 0", paddingLeft: 15 }}>
        <TypeChip type={type} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-tiny)", color: "var(--color-ink-300)" }}>{venture}</span>
      </div>
    </div>
  );
}

function NeedTile({ icon, label, count, tone, href }: { icon: string; label: string; count: number; tone?: "command"; href: string }) {
  const accent = tone === "command" ? "var(--color-gold)" : "var(--color-cyan)";
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: "12px 13px",
        borderRadius: "var(--radius-lg)",
        background: "var(--card-inner)",
        border: `1px solid ${tone === "command" ? "rgba(237,185,79,0.35)" : "var(--card-border-c)"}`,
        boxShadow: tone === "command" ? "0 0 16px -6px var(--color-gold-glow)" : "none",
      }}
    >
      <Icon name={icon} size={16} color={accent} />
      <span style={{ flex: "1 1 auto", fontSize: "var(--text-xs)", color: "var(--color-ink-200)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: accent }}>{count}</span>
      <Icon name="chevron-right" size={14} color="var(--color-ink-400)" />
    </Link>
  );
}

function BriefingMini({ from, title, time, unread }: { from: string; title: string; time: string; unread: boolean }) {
  return (
    <Link href="/inbox" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 6px", borderRadius: "var(--radius-sm)" }}>
      {unread ? (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-cyan)", boxShadow: "0 0 8px var(--color-cyan-glow)", flex: "0 0 auto" }} />
      ) : (
        <span style={{ width: 7, flex: "0 0 auto" }} />
      )}
      <span
        style={{
          width: 44,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--color-ink-400)",
          flex: "0 0 auto",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {from}
      </span>
      <span
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          fontSize: "var(--text-xs)",
          color: unread ? "var(--color-ink-000)" : "var(--color-ink-300)",
          fontWeight: unread ? 500 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-ink-400)", flex: "0 0 auto" }}>{time}</span>
    </Link>
  );
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
        background: "var(--card-inner)",
        border: "1px dashed var(--card-border-c)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {text}
    </div>
  );
}

// ---------- page ----------

export default async function Dashboard() {
  const ventures = listVentures();
  const configured = linearConfigured();
  const projects = configured ? await listProjects().catch(() => []) : [];

  const workflows = listWorkflows();
  const workflowsById = new Map(workflows.map((w) => [w.id, w]));
  const enabledWorkflows = workflows.filter((w) => w.enabled === 1);
  const routines = enabledWorkflows.filter((w) => w.cadence === "scheduled");
  const activeRuns = listActiveRuns();
  const pendingProposals = listProposals("pending");
  const unreadBriefings = unreadBriefingCount();
  const recentBriefings = listBriefings(3);
  const recentRuns = [...listRuns({ limit: 13 })].reverse(); // chronological, oldest first

  // eslint-disable-next-line react-hooks/purity -- server component, computed per request
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const tokensRow = db
    .prepare(`SELECT COALESCE(SUM(input_tokens), 0) + COALESCE(SUM(output_tokens), 0) AS total FROM runs WHERE started_at >= ?`)
    .get(todayPrefix) as { total: number };

  const integrations = { linear: configured, google: false, claude: true };
  const intConfigured = Object.values(integrations).filter(Boolean).length;
  const intTotal = Object.keys(integrations).length;

  const blockedVenture = pendingProposals.find((p) => p.venture)?.venture ?? null;

  const seeded = ventures.filter((v) => v.seeded);
  const previewVentures = [...seeded, ...ventures.filter((v) => !v.seeded)].slice(0, 6);

  return (
    <PageFrame title="Dashboard" scope="+ vault + linear">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1392 }}>
        {/* Row 1 — KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <KpiCard label="Active workflows" value={String(activeRuns.length)} icon="activity" href="/workflows" />
          <KpiCard label="Routines armed" value={String(routines.length)} icon="clock" href="/workflows" />
          <KpiCard label="Integrations" value={`${intConfigured}/${intTotal}`} icon="plug" href="/settings" />
          <KpiCard label="Tokens today" value={formatCompactTokens(tokensRow.total)} icon="cpu" tile="command" href="/sessions" />
        </div>

        {/* Row 2 — conductor hero + token flow */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "stretch" }}>
          <div
            className="hud-grid"
            style={{
              position: "relative",
              borderRadius: "var(--radius-2xl)",
              overflow: "hidden",
              background: "radial-gradient(130% 190% at 18% -55%, rgba(79,209,240,0.2), rgba(11,17,33,0.35) 55%), var(--card-bg)",
              border: "1px solid rgba(79,209,240,0.28)",
              backdropFilter: "var(--card-blur)",
              WebkitBackdropFilter: "var(--card-blur)",
              boxShadow: "var(--shadow-glass)",
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <GlowingEffect glow variant="live" spread={20} borderWidth={1.5} />
            <span
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "38%",
                background: "linear-gradient(90deg, transparent, rgba(79,209,240,0.07), transparent)",
                animation: "ao-sweep 5s var(--ease-in-out) infinite",
                pointerEvents: "none",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StatusDot status={activeRuns.length > 0 ? "live" : "idle"} size={7} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: "var(--color-cyan-300)" }}>
                CLAUDE CODE — CONDUCTOR {activeRuns.length > 0 ? "· EXECUTING" : "· IDLE"}
              </span>
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.01em", margin: "14px 0 8px" }}>{greeting()}</h2>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-ink-200)", lineHeight: 1.55, maxWidth: 440 }}>
              {heroSummary(activeRuns, pendingProposals.length, blockedVenture)}
            </p>
            <div style={{ flex: "1 1 auto" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <NeonButtonLink href="/sessions" variant="solid">
                Open conductor
              </NeonButtonLink>
              {pendingProposals.length > 0 && (
                <NeonButtonLink href="/queue" variant="command">
                  {pendingProposals.length} approval{pendingProposals.length === 1 ? "" : "s"} waiting
                </NeonButtonLink>
              )}
            </div>
          </div>

          <Panel eyebrow="Conductor throughput" title={`Token flow · last ${recentRuns.length} runs`}>
            {recentRuns.length < 2 ? (
              <EmptyRow text="Not enough run history yet." />
            ) : (
              <TokenChart
                points={recentRuns.map((r) => ({
                  tokens: (r.input_tokens ?? 0) + (r.output_tokens ?? 0),
                  label: new Date(r.started_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                }))}
              />
            )}
          </Panel>
        </div>

        {/* Row 3 — venture portfolio + right rail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>
          <Panel
            eyebrow={`Portfolio · ${ventures.length} ventures`}
            title="Ventures"
            actions={
              <ButtonLink href="/ventures" size="sm" variant="ghost" iconRight="arrow-up-right">
                View all
              </ButtonLink>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {previewVentures.map((v) => (
                <VentureCard
                  key={v.slug}
                  venture={v}
                  linear={projects.find((p) => p.name.toLowerCase() === v.slug.toLowerCase()) ?? null}
                  linearConfigured={configured}
                  running={activeRuns.some((r) => r.venture === v.slug)}
                />
              ))}
            </div>
          </Panel>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel eyebrow="Running now" title="Live feed" glow="live" actions={<StatusDot status={activeRuns.length > 0 ? "live" : "idle"} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeRuns.length === 0 ? (
                  <EmptyRow text="No workflows running." />
                ) : (
                  activeRuns
                    .slice(0, 5)
                    .map((r) => (
                      <RunningRow
                        key={r.id}
                        flow={flowNameOf(r, workflowsById)}
                        elapsed={elapsedStr(r.started_at)}
                        type={runTypeOf(r, workflowsById)}
                        venture={r.venture ?? "—"}
                      />
                    ))
                )}
              </div>
            </Panel>

            <Panel eyebrow="Needs you" title="Decisions & briefings">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <NeedTile icon="hand" label="Pending approvals" count={pendingProposals.length} tone="command" href="/queue" />
                <NeedTile icon="inbox" label="Unread briefings" count={unreadBriefings} href="/inbox" />
              </div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--card-border-c)" }}>
                {recentBriefings.length === 0 ? (
                  <EmptyRow text="No briefings yet." />
                ) : (
                  recentBriefings.map((b) => (
                    <BriefingMini
                      key={b.id}
                      from={b.workflow_id ? (workflowsById.get(b.workflow_id)?.name.slice(0, 6) ?? "wkflw") : "sys"}
                      title={b.title}
                      time={timeAgo(b.created_at)}
                      unread={b.unread === 1}
                    />
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
