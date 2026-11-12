const { ConductorNode, WorkflowButton, Icon, Button } = window.AgenticOSDesignSystem_fa0359;

function BranchColumn({ branch, onAdd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      {/* Connector line up to the conductor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px' }}>
        <span style={{ width: 22, height: 22, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--room-200)', border: '1px solid var(--line)', flex: '0 0 auto' }}>
          <Icon name={branch.icon} size={13} color="var(--ink-200)" />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-300)', fontWeight: 600 }}>{branch.id}</span>
        <span style={{ flex: '1 1 auto', height: 1, background: 'var(--line-soft)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)' }}>{branch.flows.length}</span>
      </div>
      {branch.flows.map((f, i) => <WorkflowButton key={i} {...f} />)}
      {branch.id === 'OPS' && (
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', width: '100%', cursor: 'pointer',
          background: 'transparent', border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-300)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 500,
          transition: 'color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cyan-300)'; e.currentTarget.style.borderColor = 'rgba(79,209,240,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-300)'; e.currentTarget.style.borderColor = 'var(--line-strong)'; }}>
          <Icon name="plus" size={15} /> Add workflow
        </button>
      )}
    </div>
  );
}

function Workflows({ go }) {
  const D = window.AO_DATA;
  return (
    <div style={{ maxWidth: 1392 }}>
      <ConductorNode status="live" activeCount={3} tokensToday="1.24M" style={{ marginBottom: 4 }} />
      {/* branch spine */}
      <div style={{ height: 22, display: 'flex', justifyContent: 'center' }}>
        <span style={{ width: 1, background: 'linear-gradient(var(--cyan-500), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, alignItems: 'start' }}>
        {D.branches.map((b) => <BranchColumn key={b.id} branch={b} onAdd={() => {}} />)}
      </div>
    </div>
  );
}

Object.assign(window, { Workflows });
