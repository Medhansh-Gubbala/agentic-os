const { AgentRosterItem, ProposalCard, Input, Button, Icon, Tag, StatusDot } = window.AgenticOSDesignSystem_fa0359;

function useTyped(full, active, speed = 14) {
  const [n, setN] = React.useState(active ? 0 : full.length);
  React.useEffect(() => {
    if (!active) { setN(full.length); return; }
    setN(0); let i = 0;
    const id = setInterval(() => { i += 2; setN(i); if (i >= full.length) clearInterval(id); }, speed);
    return () => clearInterval(id);
  }, [full, active]);
  return full.slice(0, n);
}

function Bubble({ who, role, children, streaming }) {
  const isUser = who === 'you';
  return (
    <div style={{ display: 'flex', gap: 11, flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 18 }}>
      <span style={{ width: 30, height: 30, flex: '0 0 auto', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--room-200)' : 'var(--room-000)', border: '1px solid ' + (isUser ? 'var(--line-strong)' : 'var(--cyan-400)'),
        fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: isUser ? 'var(--ink-200)' : 'var(--cyan-400)' }}>
        {isUser ? 'YOU' : role}
      </span>
      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 8, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ padding: '11px 14px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)', lineHeight: 1.55,
          background: isUser ? 'var(--room-200)' : 'var(--room-100)', border: '1px solid var(--line)', color: 'var(--ink-100)' }}>
          {children}{streaming && <span style={{ display: 'inline-block', width: 7, height: 13, marginLeft: 2, background: 'var(--cyan-400)', verticalAlign: 'text-bottom', animation: 'ao-caret 1s step-end infinite' }} />}
        </div>
      </div>
    </div>
  );
}

function Agents({ go }) {
  const D = window.AO_DATA;
  const [sel, setSel] = React.useState(0);
  const [ctx, setCtx] = React.useState('Northwind');
  const [proposal, setProposal] = React.useState(null);
  const agent = D.agents[sel];
  const reply = "Activation on the new usage-based pricing is up 6 points week-over-week, strongest among teams over 5 seats. I'd send the launch email to the 2,481-person waitlist at 10:00 PT and open a Linear issue to instrument the pricing page funnel. Want me to queue both?";
  const typed = useTyped(reply, true);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 16, height: 'calc(100vh - 108px)', maxWidth: 1200 }}>
      {/* Roster */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)', padding: 8, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)', padding: '10px 12px 8px' }}>C-Suite</div>
        {D.agents.map((a, i) => <AgentRosterItem key={a.role} {...a} active={i === sel} onClick={() => setSel(i)} />)}
        <div style={{ flex: '1 1 auto' }} />
        <div style={{ padding: '12px', borderTop: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="shield" size={13} color="var(--ink-400)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)' }}>Human-in-the-loop</span>
        </div>
      </div>

      {/* Thread */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ flex: '1 1 auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--ink-000)' }}>{agent.role}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><StatusDot status={agent.status} size={6} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-300)' }}>{agent.statusText}</span></div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>Context</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-strong)', background: 'var(--room-100)', cursor: 'pointer' }}>
            <Icon name="layers" size={13} color="var(--cyan-400)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-100)' }}>{ctx}</span>
            <Icon name="chevron-down" size={13} color="var(--ink-400)" />
          </div>
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: 20 }}>
          <Bubble who="you"><span>How is the Northwind pricing experiment doing, and what should I do next?</span></Bubble>
          <Bubble who="agent" role={agent.role} streaming={typed.length < reply.length}>{typed}</Bubble>
          {typed.length >= reply.length && (
            <div style={{ maxWidth: 560, marginLeft: 41, marginTop: -6 }}>
              <ProposalCard
                action="Queue 2 actions: send launch email + open Linear issue"
                detail="1 · Send launch email → 2,481 waitlist @ 10:00 PT   2 · Create TKT: instrument pricing funnel"
                agent={agent.role} venture={ctx} kind="MANUAL" icon="sparkles" time="now"
                resolved={proposal}
                onApprove={() => setProposal('approved')} onReject={() => setProposal('rejected')} />
            </div>
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
          <Input icon="message-square" placeholder={`Message ${agent.role}…`} style={{ flex: '1 1 auto' }} />
          <Button variant="primary" icon="arrow-up">Send</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Agents });
