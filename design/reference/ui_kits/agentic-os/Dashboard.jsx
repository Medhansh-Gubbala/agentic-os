const NS = window.AgenticOSDesignSystem_fa0359;
const { Panel, StatusReadout, VentureCard, TypeChip, StatusDot, Badge, Button, Icon } = NS;
// Defensive: degrade gracefully if served a stale/partial bundle instead of white-screening.
const NeonButton = NS.NeonButton || Button;
const GlowingEffect = NS.GlowingEffect || (() => null);

/* ---------- Row 1: KPI stat cards (Vision-UI pattern, Jarvis-hued) ---------- */
function KpiCard({ label, value, unit, delta, deltaTone = 'ok', icon, tile = 'live', onClick }) {
  const tiles = {
    live: 'linear-gradient(180deg, var(--cyan-400), var(--cyan-600))',
    command: 'linear-gradient(180deg, var(--gold-400), var(--gold-500))',
  };
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 20px', borderRadius: 'var(--r-xl)',
        background: 'var(--card-bg)', border: '1px solid var(--card-border-c)',
        backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)',
        boxShadow: 'var(--shadow-glass)', cursor: onClick ? 'pointer' : 'default', minWidth: 0,
      }}
    >
      <GlowingEffect spread={28} proximity={56} inactiveZone={0.01} borderWidth={1.5} variant={tile === 'command' ? 'command' : 'live'} />
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-300)', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 27, fontWeight: 700, lineHeight: 1, color: 'var(--ink-000)', letterSpacing: '-0.01em' }}>{value}</span>
          {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-400)' }}>{unit}</span>}
          {delta && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: deltaTone === 'bad' ? 'var(--bad-400)' : 'var(--ok-400)' }}>{delta}</span>}
        </div>
      </div>
      <span style={{
        width: 44, height: 44, flex: '0 0 auto', borderRadius: 'var(--r-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tiles[tile], color: tile === 'command' ? '#2B1E05' : '#04222B',
        boxShadow: `0 0 20px -6px ${tile === 'command' ? 'var(--gold-glow)' : 'var(--cyan-glow)'}`,
      }}><Icon name={icon} size={20} strokeWidth={2} /></span>
    </div>
  );
}

/* ---------- Token-flow area chart (glowing cyan, dashed grid) ---------- */
function smoothPath(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function TokenChart() {
  const W = 560, H = 190, PAD = 8;
  const tokens = [12, 9, 14, 22, 18, 34, 52, 41, 64, 58, 78, 71, 88];
  const runs =   [4,  3,  6,  9,  7, 12, 18, 14, 20, 17, 24, 21, 26];
  const max = 100;
  const toPts = (arr) => arr.map((v, i) => [PAD + (i * (W - PAD * 2)) / (arr.length - 1), H - 26 - (v / max) * (H - 46)]);
  const tp = toPts(tokens), rp = toPts(runs);
  const area = `${smoothPath(tp)} L ${tp[tp.length - 1][0]} ${H - 24} L ${tp[0][0]} ${H - 24} Z`;
  const hours = ['00', '04', '08', '12', '16', '20', 'now'];
  const last = tp[tp.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
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
        <line key={f} x1={PAD} x2={W - PAD} y1={H - 26 - f * (H - 46)} y2={H - 26 - f * (H - 46)}
          stroke="rgba(148,190,222,0.12)" strokeDasharray="3 5" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#aoAreaFill)" />
      <path d={smoothPath(rp)} fill="none" stroke="#8B93F7" strokeOpacity="0.7" strokeWidth="1.75" />
      <path d={smoothPath(tp)} fill="none" stroke="#4FD1F0" strokeWidth="2.5" filter="url(#aoLineGlow)" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#4FD1F0" filter="url(#aoLineGlow)" />
      <circle cx={last[0]} cy={last[1]} r="8" fill="none" stroke="rgba(79,209,240,0.4)" strokeWidth="1" />
      {hours.map((h, i) => (
        <text key={h} x={PAD + (i * (W - PAD * 2)) / (hours.length - 1)} y={H - 8}
          fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink-400)" textAnchor={i === 0 ? 'start' : i === hours.length - 1 ? 'end' : 'middle'}>{h}</text>
      ))}
    </svg>
  );
}

/* ---------- Right rail bits ---------- */
function RunningRow({ item }) {
  return (
    <div style={{ padding: '11px 12px', borderRadius: 'var(--r-lg)', background: 'var(--card-inner)', border: '1px solid var(--card-border-c)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status="running" size={7} />
        <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--ink-100)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.flow}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--cyan-300)' }}>{item.elapsed}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '7px 0 8px', paddingLeft: 15 }}>
        <TypeChip type={item.type} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-300)' }}>{item.venture}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(148,190,222,0.1)', overflow: 'hidden', marginLeft: 15 }}>
        <div style={{ height: '100%', width: item.pct + '%', background: 'linear-gradient(90deg, var(--cyan-500), var(--cyan-400))', boxShadow: '0 0 8px var(--cyan-glow)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

function NeedTile({ icon, label, count, tone, onClick }) {
  const accent = tone === 'command' ? 'var(--gold-400)' : 'var(--cyan-400)';
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '12px 13px', borderRadius: 'var(--r-lg)', background: 'var(--card-inner)',
      border: `1px solid ${tone === 'command' ? 'rgba(237,185,79,0.35)' : 'var(--card-border-c)'}`,
      boxShadow: tone === 'command' ? '0 0 16px -6px var(--gold-glow)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out)',
    }}>
      <Icon name={icon} size={16} color={accent} />
      <span style={{ flex: '1 1 auto', fontSize: 'var(--fs-xs)', color: 'var(--ink-200)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: accent }}>{count}</span>
      <Icon name="chevron-right" size={14} color="var(--ink-400)" />
    </button>
  );
}

function BriefingMini({ b, onOpen }) {
  return (
    <button onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 6px', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', border: 'none' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148,190,222,0.06)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {b.unread ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: '0 0 8px var(--cyan-glow)', flex: '0 0 auto' }} /> : <span style={{ width: 7, flex: '0 0 auto' }} />}
      <span style={{ width: 28, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-400)', flex: '0 0 auto' }}>{b.from}</span>
      <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 'var(--fs-xs)', color: b.unread ? 'var(--ink-000)' : 'var(--ink-300)', fontWeight: b.unread ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-400)', flex: '0 0 auto' }}>{b.time}</span>
    </button>
  );
}

/* ---------- The screen ---------- */
function Dashboard({ go }) {
  const D = window.AO_DATA;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1392 }}>
      {/* Row 1 — status readout strip as KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <KpiCard label="Active workflows" value="3" delta="live" deltaTone="ok" icon="activity" onClick={() => go('workflows')} />
        <KpiCard label="Routines armed" value="11" delta="+2" icon="clock" onClick={() => go('workflows')} />
        <KpiCard label="Integrations" value="5/6" delta="-1" deltaTone="bad" icon="plug" onClick={() => go('settings')} />
        <KpiCard label="Tokens today" value="1.24M" delta="+18%" icon="cpu" tile="command" onClick={() => go('sessions')} />
      </div>

      {/* Row 2 — conductor hero + token flow chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, alignItems: 'stretch' }}>
        <div className="hud-grid" style={{
          position: 'relative', borderRadius: 'var(--r-2xl)', overflow: 'hidden',
          background: 'radial-gradient(130% 190% at 18% -55%, rgba(79,209,240,0.2), rgba(11,17,33,0.35) 55%), var(--card-bg)',
          border: '1px solid rgba(79,209,240,0.28)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)',
          boxShadow: 'var(--shadow-glass)', padding: '26px 28px', display: 'flex', flexDirection: 'column',
        }}>
          <GlowingEffect glow variant="live" spread={20} borderWidth={1.5} />
          <span style={{ position: 'absolute', top: 0, bottom: 0, width: '38%', background: 'linear-gradient(90deg, transparent, rgba(79,209,240,0.07), transparent)', animation: 'ao-sweep 5s var(--ease-in-out) infinite', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <StatusDot status="live" size={7} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--cyan-300)' }}>CLAUDE CODE — CONDUCTOR · EXECUTING</span>
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em', margin: '14px 0 8px' }}>Good morning.</h2>
          <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--ink-200)', lineHeight: 1.55, maxWidth: 440 }}>
            3 workflows executing across <span style={{ color: 'var(--ink-000)', fontWeight: 500 }}>site-forge</span>, <span style={{ color: 'var(--ink-000)', fontWeight: 500 }}>ClipLab</span> and <span style={{ color: 'var(--ink-000)', fontWeight: 500 }}>Pinecrest</span>. Relay is blocked and needs you.
          </p>
          <div style={{ flex: '1 1 auto' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <NeonButton variant="solid" onClick={() => go('sessions')}>Open conductor</NeonButton>
            <NeonButton variant="command" onClick={() => go('queue')}>3 approvals waiting</NeonButton>
          </div>
        </div>

        <Panel eyebrow="Conductor throughput" title="Token flow · 24h" padded
          actions={<span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-300)' }}><span style={{ width: 10, height: 2, background: 'var(--cyan-400)', borderRadius: 1 }}></span>tokens</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-300)' }}><span style={{ width: 10, height: 2, background: '#8B93F7', borderRadius: 1 }}></span>runs</span>
          </span>}>
          <TokenChart />
        </Panel>
      </div>

      {/* Row 3 — venture portfolio + right rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>
        <Panel eyebrow="Portfolio · 9 ventures" title="Ventures" actions={<Button size="sm" variant="ghost" iconRight="arrow-up-right" onClick={() => go('ventures')}>View all</Button>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {D.ventures.map((v) => <VentureCard key={v.name} {...v} onClick={() => go('ventures')} />)}
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel eyebrow="Running now" title="Live feed" glow="live" actions={<StatusDot status="live" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {D.runningNow.map((item, i) => <RunningRow key={i} item={item} />)}
            </div>
          </Panel>

          <Panel eyebrow="Needs you" title="Decisions & briefings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <NeedTile icon="hand" label="Pending approvals" count={3} tone="command" onClick={() => go('queue')} />
              <NeedTile icon="inbox" label="Unread briefings" count={2} onClick={() => go('inbox')} />
            </div>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--card-border-c)' }}>
              {D.briefings.slice(0, 3).map((b) => <BriefingMini key={b.id} b={b} onOpen={() => go('inbox')} />)}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
