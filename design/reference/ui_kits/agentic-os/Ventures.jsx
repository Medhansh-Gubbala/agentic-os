const { Panel, VentureCard, Tabs, Tabs: _T, TypeChip, StatusDot, Tag, Button, Icon } = window.AgenticOSDesignSystem_fa0359;

const DETAIL = {
  northStar: 'Become the default operating layer for solo founders running multiple ventures — every workflow one press away, every decision logged, memory that never forgets.',
  metric: { label: 'Weekly active operators', value: '1,284', delta: '+9.4%' },
  decisions: [
    { date: 'Jul 06', text: 'Split onboarding step 2; defer permission prompt to first use.', by: 'CTO' },
    { date: 'Jul 03', text: 'Move render workers to GPU; approved 3.4x speedup at +$1.2k/mo.', by: 'CTO' },
    { date: 'Jun 29', text: 'Adopt usage-based pricing for Northwind; sunset flat tier.', by: 'CEO' },
    { date: 'Jun 24', text: 'Pause paid acquisition until activation > 40%.', by: 'CMO' },
  ],
  memory: [
    'Primary persona: technical solo founder, 3–12 concurrent ventures.',
    'Onboarding drop-off historically concentrated at permission prompt.',
    'Prefers async agent proposals over autonomous execution for anything customer-facing.',
  ],
  tasks: [
    { id: 'TKT-418', title: 'Fix onboarding drop-off in step 2', state: 'In Progress', pri: 'High' },
    { id: 'TKT-411', title: 'Ship App Store copy v2', state: 'Todo', pri: 'Med' },
    { id: 'TKT-402', title: 'Instrument activation funnel', state: 'Done', pri: 'High' },
    { id: 'TKT-399', title: 'Migrate settings to new schema', state: 'Todo', pri: 'Low' },
  ],
  runs: [
    { prompt: 'audit onboarding flow', dur: '41.2s', tok: '128k', exit: 0, time: '09:14' },
    { prompt: 'draft app store copy', dur: '27.5s', tok: '88k', exit: 0, time: '08:02' },
    { prompt: 'instrument funnel events', dur: '1m 12s', tok: '204k', exit: 0, time: 'Yesterday' },
  ],
};

function DetailBody({ tab }) {
  const d = DETAIL;
  if (tab === 'north') return (
    <div>
      <p style={{ fontSize: 'var(--fs-md)', color: 'var(--ink-100)', lineHeight: 1.5, maxWidth: 720, margin: 0 }}>{d.northStar}</p>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, marginTop: 20, padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--room-100)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>{d.metric.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: 'var(--cyan-400)', textShadow: '0 0 16px var(--cyan-glow)' }}>{d.metric.value} <span style={{ fontSize: 13, color: 'var(--ok-400)' }}>{d.metric.delta}</span></span>
      </div>
    </div>
  );
  if (tab === 'decisions') return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {d.decisions.map((x, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--line-soft)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-400)', width: 52, flex: '0 0 auto' }}>{x.date}</span>
          <span style={{ flex: '1 1 auto', fontSize: 'var(--fs-sm)', color: 'var(--ink-100)' }}>{x.text}</span>
          <Tag>{x.by}</Tag>
        </div>
      ))}
    </div>
  );
  if (tab === 'memory') return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {d.memory.map((m, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--room-000)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="brain" size={14} color="var(--type-routine)" style={{ marginTop: 2 }} />
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-200)', lineHeight: 1.5 }}>{m}</span>
        </li>
      ))}
    </ul>
  );
  if (tab === 'tasks') return (
    <div>
      {d.tasks.map((t) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line-soft)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)', width: 58, flex: '0 0 auto' }}>{t.id}</span>
          <span style={{ flex: '1 1 auto', fontSize: 'var(--fs-sm)', color: 'var(--ink-100)' }}>{t.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: t.pri === 'High' ? 'var(--gold-300)' : 'var(--ink-400)' }}>{t.pri}</span>
          <Tag tone={t.state === 'Done' ? 'live' : 'neutral'}>{t.state}</Tag>
        </div>
      ))}
    </div>
  );
  return (
    <div>
      {d.runs.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line-soft)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)' }}>
          <Icon name="terminal" size={13} color="var(--cyan-400)" />
          <span style={{ flex: '1 1 auto', color: 'var(--ink-100)' }}>{r.prompt}</span>
          <span style={{ color: 'var(--ink-300)' }}>{r.dur}</span>
          <span style={{ color: 'var(--ink-400)' }}>{r.tok}</span>
          <span style={{ color: r.exit === 0 ? 'var(--ok-400)' : 'var(--bad-400)' }}>exit {r.exit}</span>
          <span style={{ color: 'var(--ink-400)', width: 64, textAlign: 'right' }}>{r.time}</span>
        </div>
      ))}
    </div>
  );
}

function Ventures({ go }) {
  const D = window.AO_DATA;
  const [sel, setSel] = React.useState(null);
  const [tab, setTab] = React.useState('north');
  const v = sel != null ? D.ventures[sel] : null;

  if (v) return (
    <div style={{ maxWidth: 1000 }}>
      <button onClick={() => setSel(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-300)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', marginBottom: 14, padding: 0 }}>
        <Icon name="chevron-left" size={14} /> All ventures
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <StatusDot status={v.running ? 'running' : v.health} size={10} />
        <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 600 }}>{v.name}</h2>
        <Tag icon="git-branch">{v.name.toLowerCase()}</Tag>
        <div style={{ flex: '1 1 auto' }} />
        <Button variant="primary" icon="play" onClick={() => go('sessions')}>Run session</Button>
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-200)', margin: '0 0 18px' }}>{v.focus}</p>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'north', label: 'North Star' },
        { id: 'decisions', label: 'Decisions', count: DETAIL.decisions.length },
        { id: 'memory', label: 'Memory' },
        { id: 'tasks', label: 'Linear', count: v.tasks },
        { id: 'runs', label: 'Recent runs' },
      ]} style={{ marginBottom: 18 }} />
      <DetailBody tab={tab} />
    </div>
  );

  return (
    <Panel eyebrow="Portfolio · 9 ventures" title="Ventures" padded style={{ maxWidth: 1392 }}
      actions={<Button size="sm" variant="secondary" icon="plus">New venture</Button>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {D.ventures.map((vv, i) => <VentureCard key={vv.name} {...vv} onClick={() => { setSel(i); setTab('north'); }} />)}
      </div>
    </Panel>
  );
}

Object.assign(window, { Ventures });
