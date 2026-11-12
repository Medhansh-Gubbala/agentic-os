const { ProposalCard, Input, Button, Icon, Tag, StatusReadout } = window.AgenticOSDesignSystem_fa0359;

function QueueCard({ item, onResolve }) {
  const [mode, setMode] = React.useState('pending'); // pending | rejecting | approved | rejected
  const [reason, setReason] = React.useState('');

  if (mode === 'rejecting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 'var(--r-md)', background: 'var(--room-100)', border: '1px solid rgba(242,109,109,0.4)', boxShadow: 'var(--glow-bad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="message-square-x" size={15} color="var(--bad-400)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-000)' }}>Reject — tell the agent why</span>
        </div>
        <Input placeholder="e.g. Wrong send window — hold until pricing page ships" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="danger" size="sm" icon="x" onClick={() => { setMode('rejected'); onResolve(); }}>Confirm reject</Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('pending')}>Cancel</Button>
        </div>
      </div>
    );
  }
  return (
    <ProposalCard {...item} resolved={mode === 'approved' ? 'approved' : mode === 'rejected' ? 'rejected' : null}
      onApprove={() => { setMode('approved'); onResolve(); }}
      onReject={() => setMode('rejecting')} />
  );
}

function Queue({ go }) {
  const D = window.AO_DATA;
  const [remaining, setRemaining] = React.useState(D.queue.length);
  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* strip */}
      <div style={{ display: 'flex', gap: 40, padding: '14px 20px', background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)' }}>
        <StatusReadout label="Pending" value={remaining} icon="hand" tone="command" live />
        <StatusReadout label="Approved today" value={12} icon="check" tone="ok" />
        <StatusReadout label="Rejected today" value={3} icon="x" />
        <div style={{ flex: '1 1 auto' }} />
        <StatusReadout label="Avg decision" value="14s" icon="timer" />
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 12 }}>Awaiting your decision</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {D.queue.map((q) => <QueueCard key={q.id} item={q} onResolve={() => setRemaining((r) => Math.max(0, r - 1))} />)}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)', margin: '4px 0 10px' }}>History</div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          {D.queueHistory.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: 'var(--room-100)', borderBottom: i < D.queueHistory.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <Icon name={h.decision === 'approved' ? 'check' : 'x'} size={14} color={h.decision === 'approved' ? 'var(--ok-400)' : 'var(--bad-400)'} />
              <span style={{ flex: '1 1 auto', fontSize: 'var(--fs-sm)', color: 'var(--ink-100)' }}>{h.action}</span>
              <Tag>{h.venture}</Tag>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)', width: 70, textAlign: 'right' }}>{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Queue });
