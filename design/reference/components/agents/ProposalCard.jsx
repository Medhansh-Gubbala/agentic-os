import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
import { TypeChip } from '../workflows/TypeChip.jsx';

/**
 * ProposalCard — an agent proposes an action; the human APPROVES or REJECTS.
 * Also used in the Queue. Shows the action, a detail body, source agent/venture,
 * and a resolved state (approved/rejected) once acted on.
 */
export function ProposalCard({
  action, detail, agent, venture, icon = 'sparkles', kind, time,
  resolved, onApprove, onReject, className = '', style = {},
}) {
  const isResolved = resolved === 'approved' || resolved === 'rejected';
  const accent = resolved === 'approved' ? 'var(--ok-400)' : resolved === 'rejected' ? 'var(--bad-400)' : 'var(--gold-400)';
  return (
    <div
      className={className}
      style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: 16, borderRadius: 'var(--r-md)',
        background: 'var(--room-100)',
        border: `1px solid ${isResolved ? 'var(--line)' : 'rgba(237,185,79,0.35)'}`,
        boxShadow: isResolved ? 'var(--shadow-sm)' : 'var(--glow-command)',
        opacity: isResolved ? 0.82 : 1, ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <span style={{ width: 30, height: 30, flex: '0 0 auto', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-wash)', color: 'var(--gold-400)', border: '1px solid rgba(237,185,79,0.3)' }}>
          <Icon name={icon} size={15} />
        </span>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--ink-000)' }}>{action}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
            {agent && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-300)' }}>{agent}</span>}
            {venture && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-300)' }}>· {venture}</span>}
            {kind && <TypeChip type={kind} />}
          </div>
        </div>
        {time && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-400)', flex: '0 0 auto' }}>{time}</span>}
      </div>

      {detail && (
        <div style={{ padding: '10px 12px', background: 'var(--room-000)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-200)', lineHeight: 'var(--lh-normal)' }}>
          {detail}
        </div>
      )}

      {isResolved ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: accent }}>
          <Icon name={resolved === 'approved' ? 'check' : 'x'} size={13} color={accent} />
          {resolved === 'approved' ? 'Approved & fired' : 'Rejected'}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="command" size="sm" icon="check" onClick={onApprove}>Approve</Button>
          <Button variant="danger" size="sm" icon="x" onClick={onReject}>Reject</Button>
        </div>
      )}
    </div>
  );
}
