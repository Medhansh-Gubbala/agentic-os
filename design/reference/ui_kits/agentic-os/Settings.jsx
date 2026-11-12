const { Panel, Switch, Input, Tag, TypeChip, Button, Icon, StatusDot } = window.AgenticOSDesignSystem_fa0359;

const ROUTINES = [
  { name: 'CEO Morning Briefing', cadence: 'Daily · 07:00', on: true },
  { name: 'CMO Weekly Review', cadence: 'Mon · 09:00', on: true },
  { name: 'CFO Burn Report', cadence: 'Fri · 17:00', on: true },
  { name: 'Update memory graph', cadence: 'Every 4h', on: true },
  { name: 'Prune stale context', cadence: 'Nightly · 02:00', on: false },
];

const TOKEN_LOG = [
  ['site-forge', 412], ['ClipLab', 512], ['Northwind', 190], ['Pinecrest', 88], ['Foundry', 240], ['Relay', 34],
];

function Settings({ go }) {
  const D = window.AO_DATA;
  const [routines, setRoutines] = React.useState(ROUTINES);
  const [persona, setPersona] = React.useState('CEO');
  const max = Math.max(...TOKEN_LOG.map((t) => t[1]));
  const PERSONAS = {
    CEO: 'You are the CEO. Prioritize across the portfolio, surface the 3 things that need the founder today, and log every strategic decision to memory. Bias toward async proposals over autonomous action.',
    CMO: 'You are the CMO. Own hooks, drafts, and cascades. Never send customer-facing content without approval. Optimize for activation, not vanity metrics.',
    CFO: 'You are the CFO. Track burn and runway across all accounts. Alert on anomalies. Reconcile Stripe daily and escalate failures.',
    CTO: 'You are the CTO. Triage the PR queue, keep checks green, and propose issues with clear scope. Prefer small, reversible changes.',
  };

  return (
    <div style={{ maxWidth: 1200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
      {/* Connectors */}
      <Panel eyebrow="Integrations" title="Connectors">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {D.connectors.map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', background: 'var(--room-100)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
              <span style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--room-000)', border: '1px solid var(--line-strong)', flex: '0 0 auto' }}>
                <Icon name={c.icon} size={15} color="var(--ink-200)" />
              </span>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-000)', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)' }}>{c.detail}</div>
              </div>
              {c.status === 'bad'
                ? <Button size="sm" variant="danger" icon="refresh-cw">Reconnect</Button>
                : <StatusDot status={c.status === 'warn' ? 'warn' : 'ok'} label={c.status === 'warn' ? 'Expiring' : 'OK'} />}
            </div>
          ))}
        </div>
      </Panel>

      {/* Schedule editor */}
      <Panel eyebrow="Automation" title="Routine schedules" actions={<Button size="sm" variant="secondary" icon="plus">Add routine</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {routines.map((r, i) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', background: 'var(--room-100)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
              <Icon name="clock" size={15} color={r.on ? 'var(--type-routine)' : 'var(--ink-400)'} />
              <div style={{ flex: '1 1 auto' }}>
                <div style={{ fontSize: 'var(--fs-sm)', color: r.on ? 'var(--ink-000)' : 'var(--ink-300)', fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)' }}>{r.cadence}</div>
              </div>
              <Switch checked={r.on} onChange={(v) => setRoutines((rs) => rs.map((x, j) => j === i ? { ...x, on: v } : x))} />
            </div>
          ))}
        </div>
      </Panel>

      {/* Persona editor */}
      <Panel eyebrow="Agents" title="Persona editor">
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['CEO', 'CMO', 'CFO', 'CTO'].map((p) => (
            <button key={p} onClick={() => setPersona(p)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', fontWeight: 600,
              background: persona === p ? 'var(--room-250)' : 'var(--room-000)', border: '1px solid ' + (persona === p ? 'var(--cyan-400)' : 'var(--line)'), color: persona === p ? 'var(--cyan-300)' : 'var(--ink-300)' }}>{p}</button>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 8 }}>System prompt</div>
        <textarea defaultValue={PERSONAS[persona]} key={persona} style={{
          width: '100%', minHeight: 132, resize: 'vertical', padding: 12, background: 'var(--room-000)', border: '1px solid var(--line-strong)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-100)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button variant="primary" size="sm" icon="save">Save persona</Button>
          <Button variant="ghost" size="sm">Reset</Button>
        </div>
      </Panel>

      {/* Token usage log */}
      <Panel eyebrow="Usage" title="Tokens today · by venture" actions={<Tag tone="live">1.24M total</Tag>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          {TOKEN_LOG.map(([name, val]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 130, fontSize: 'var(--fs-xs)', color: 'var(--ink-200)', flex: '0 0 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
              <div style={{ flex: '1 1 auto', height: 8, background: 'var(--room-000)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (val / max * 100) + '%', background: 'linear-gradient(90deg, var(--cyan-600), var(--cyan-400))', borderRadius: 'var(--r-pill)', boxShadow: '0 0 8px var(--cyan-glow)' }} />
              </div>
              <span style={{ width: 52, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-300)', flex: '0 0 auto' }}>{val}k</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

Object.assign(window, { Settings });
