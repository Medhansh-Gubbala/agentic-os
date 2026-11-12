const { Button, Icon, StatusDot, Tabs } = window.AgenticOSDesignSystem_fa0359;

const DRAFT_TONE = { scheduled: 'var(--cyan-400)', draft: 'var(--ink-400)', published: 'var(--ok-400)' };
const HOOK_TONE = { ready: 'var(--ok-400)', draft: 'var(--ink-400)', review: 'var(--gold-400)' };

function Pill({ label, tone }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: tone, border: `1px solid ${tone}66`, borderRadius: 'var(--r-sm)', padding: '2px 7px', flex: '0 0 auto' }}>{label}</span>;
}

function DraftCard({ d }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 18px', background: 'var(--room-100)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill label={d.status} tone={DRAFT_TONE[d.status]} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)' }}>{d.platform}</span>
        <div style={{ flex: '1 1 auto' }} />
        {d.date && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)' }}>{d.date}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--ink-000)' }}>{d.title}</div>
      <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--ink-200)', lineHeight: 1.5 }}>{d.description}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <Button size="sm" variant="secondary" icon="arrow-right">Open</Button>
        <Button size="sm" variant="command" icon="sparkles">Regenerate</Button>
      </div>
    </div>
  );
}

function HookCard({ h }) {
  return (
    <div style={{ padding: '13px 14px', background: 'var(--room-100)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
      <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--ink-000)', lineHeight: 1.5, fontStyle: 'italic' }}>“{h.text}”</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Pill label={h.status} tone={HOOK_TONE[h.status]} />
        <div style={{ flex: '1 1 auto' }} />
        <Button size="sm" variant="ghost" icon="copy" />
        <Button size="sm" variant="secondary" icon="arrow-right">Use</Button>
      </div>
    </div>
  );
}

function CascadeCard({ c }) {
  const running = c.state === 'running';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--room-100)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
      <StatusDot status={running ? 'running' : 'idle'} size={7} />
      <div style={{ flex: '1 1 auto' }}>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-000)', fontWeight: 500 }}>{c.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)', marginTop: 4 }}>{c.steps} steps</div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: running ? 'var(--cyan-300)' : 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.state}</span>
    </div>
  );
}

function EmptyRow({ label }) {
  return <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-400)' }}>No {label} for this venture yet.</div>;
}

function Marketing({ go }) {
  const D = window.AO_DATA;
  const M = D.marketing;
  const ventureNames = D.ventures.map((v) => v.name);
  const [venture, setVenture] = React.useState(ventureNames[ventureNames.length - 1]);
  const [tab, setTab] = React.useState('drafts');

  const drafts = M.drafts.filter((d) => d.venture === venture);
  const hooks = M.hooks.filter((h) => h.venture === venture);
  const cascades = M.cascades.filter((c) => c.venture === venture);

  return (
    <div style={{ maxWidth: 1392 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--room-000)', border: '1px solid var(--type-routine)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--type-routine)', flex: '0 0 auto' }}>CMO</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--ink-000)' }}>Marketing Workspace</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-300)', marginTop: 2 }}>drafts · hooks · cascades, per venture</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {ventureNames.map((v) => {
          const active = v === venture;
          return (
            <button
              key={v}
              onClick={() => setVenture(v)}
              style={{
                padding: '9px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)',
                background: active ? 'var(--room-250)' : 'var(--room-100)',
                border: '1px solid ' + (active ? 'var(--cyan-400)' : 'var(--line)'),
                color: active ? 'var(--cyan-300)' : 'var(--ink-200)',
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line-strong)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line)'; }}
            >
              {v}
            </button>
          );
        })}
      </div>

      <Tabs
        value={tab} onChange={setTab} accent="var(--type-routine)"
        tabs={[
          { id: 'drafts', label: 'Drafts', count: drafts.length },
          { id: 'hooks', label: 'Hooks', count: hooks.length },
          { id: 'cascades', label: 'Cascades', count: cascades.length },
        ]}
        style={{ marginBottom: 20 }}
      />

      {tab === 'drafts' && (drafts.length
        ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{drafts.map((d, i) => <DraftCard key={i} d={d} />)}</div>
        : <EmptyRow label="drafts" />)}
      {tab === 'hooks' && (hooks.length
        ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{hooks.map((h, i) => <HookCard key={i} h={h} />)}</div>
        : <EmptyRow label="hooks" />)}
      {tab === 'cascades' && (cascades.length
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{cascades.map((c, i) => <CascadeCard key={i} c={c} />)}</div>
        : <EmptyRow label="cascades" />)}
    </div>
  );
}

Object.assign(window, { Marketing });
