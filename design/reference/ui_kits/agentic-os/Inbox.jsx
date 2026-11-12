const { Panel, Badge, Tag, Button, Icon, StatusDot } = window.AgenticOSDesignSystem_fa0359;

const BODIES = {
  b1: {
    lede: "Good morning. Three things need you today. Everything else is running clean.",
    sections: [
      { h: '1 — Relay is blocked', b: 'Stripe Connect review is holding the payout release. CFO queued a retry with backoff (see Queue). If it fails again, you\'ll need to reply to their compliance email — I\'ve drafted it.' },
      { h: '2 — Northwind pricing is showing signal', b: 'Activation +6pts WoW on usage-based pricing, strongest for 5+ seat teams. CMO recommends sending the launch email to the waitlist today.' },
      { h: '3 — ClipLab is ahead of schedule', b: 'GPU worker migration cut render time 3.4x. No action needed — logged the decision to memory.' },
    ],
    stats: [ ['Ventures healthy', '7 / 9'], ['Blocked', '1'], ['Runs overnight', '23'], ['Tokens', '1.24M'] ],
  },
  b2: {
    lede: "Weekly marketing review across the portfolio. Content engine is the standout.",
    sections: [
      { h: 'Pinecrest content engine', b: 'Drove 4,120 new sessions (+31% WoW) from 3 scheduled posts. Recommend doubling the cascade cadence for site-forge.' },
      { h: 'Paid acquisition', b: 'Paused per the Jun 24 decision until activation clears 40%. Northwind is close.' },
    ],
    stats: [ ['New sessions', '4.1k'], ['Posts shipped', '3'], ['In review', '1'], ['CAC', '$0'] ],
  },
  b3: { lede: "Burn and runway update for the portfolio.", sections: [ { h: 'Combined burn', b: '$58.2k/mo across 9 ventures. Runway 14 months at current spend.' }, { h: 'Alert', b: 'Stripe reconciliation failed with 429 — retry queued.' } ], stats: [ ['Burn / mo', '$58.2k'], ['Runway', '14mo'], ['Alerts', '1'], ['Accounts', '6'] ] },
  b4: { lede: "Engineering digest across all repos.", sections: [ { h: 'Shipped', b: '9 PRs merged across 4 repos. ClipLab GPU workers cut render time 3.4x.' }, { h: 'Open', b: '4 PRs in review, 0 failing checks.' } ], stats: [ ['PRs merged', '9'], ['In review', '4'], ['Repos', '12'], ['Failing', '0'] ] },
};

function Inbox({ go }) {
  const D = window.AO_DATA;
  const [sel, setSel] = React.useState('b1');
  const [read, setRead] = React.useState({ b3: true, b4: true });
  const b = D.briefings.find((x) => x.id === sel);
  const body = BODIES[sel];
  const markRead = (id) => setRead((r) => ({ ...r, [id]: true }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, height: 'calc(100vh - 108px)', maxWidth: 1200 }}>
      {/* List */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)', fontWeight: 600 }}>Briefings</span>
          <Badge tone="live">2</Badge>
        </div>
        <div style={{ overflowY: 'auto' }}>
          {D.briefings.map((x) => {
            const unread = x.unread && !read[x.id];
            const active = x.id === sel;
            return (
              <button key={x.id} onClick={() => { setSel(x.id); markRead(x.id); }} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '13px 16px', cursor: 'pointer',
                background: active ? 'var(--room-150)' : 'transparent', border: 'none', borderBottom: '1px solid var(--line-soft)',
                borderLeft: '2px solid ' + (active ? 'var(--cyan-400)' : 'transparent') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: '0 0 8px var(--cyan-glow)' }} />}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-400)' }}>{x.from}</span>
                  <span style={{ flex: '1 1 auto' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-400)' }}>{x.time}</span>
                </div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: unread ? 600 : 500, color: unread ? 'var(--ink-000)' : 'var(--ink-200)', marginBottom: 4 }}>{x.title}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-300)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{x.preview}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading pane */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--room-000)', border: '1px solid var(--gold-400)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--gold-400)' }}>{b.from}</span>
          <div style={{ flex: '1 1 auto' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>{b.from} Briefing · scheduled run</div>
            <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 600, marginTop: 2 }}>{b.title}</h2>
          </div>
          <Button size="sm" variant="ghost" icon="archive">Archive</Button>
          <Button size="sm" variant="secondary" icon="corner-up-right">Reply to agent</Button>
        </div>
        <div style={{ overflowY: 'auto', padding: '24px 28px', maxWidth: 760 }}>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--ink-000)', lineHeight: 1.55, margin: '0 0 8px' }}>{body.lede}</p>
          <div style={{ display: 'flex', gap: 10, margin: '18px 0 24px', flexWrap: 'wrap' }}>
            {body.stats.map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--room-100)', minWidth: 96 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--ink-000)' }}>{v}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-400)', marginTop: 3 }}>{k}</div>
              </div>
            ))}
          </div>
          {body.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--cyan-300)', marginBottom: 7 }}>{s.h}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-200)', lineHeight: 1.6, margin: 0, maxWidth: 640 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Inbox });
