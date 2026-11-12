import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { StatusDot } from '../core/StatusDot.jsx';

/**
 * ConductorNode — the glowing "CLAUDE CODE — CONDUCTOR" node that presides over
 * the workflow graph. Executes everything; shows live status + throughput.
 */
export function ConductorNode({ status = 'live', activeCount = 0, tokensToday, className = '', style = {} }) {
  const running = status === 'live' || status === 'running';
  return (
    <div
      className={className}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 22px', borderRadius: 'var(--r-lg)',
        background: 'radial-gradient(120% 180% at 50% -40%, rgba(79,209,240,0.16), rgba(16,20,29,0.4)), var(--room-100)',
        border: '1px solid rgba(79,209,240,0.4)',
        boxShadow: running ? 'var(--glow-live-lg)' : 'var(--shadow-md)',
        animation: running ? 'ao-glow-breathe 3.4s var(--ease-in-out) infinite' : 'none',
        overflow: 'hidden', ...style,
      }}
    >
      {/* sweep highlight */}
      {running && <span style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(79,209,240,0.10), transparent)', animation: 'ao-sweep 4s var(--ease-in-out) infinite', pointerEvents: 'none' }} />}

      <div style={{
        width: 46, height: 46, borderRadius: 'var(--r-md)', flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--cyan-400), var(--cyan-600))',
        boxShadow: '0 0 22px -4px var(--cyan-glow)', color: '#04222B',
      }}>
        <Icon name="terminal" size={24} strokeWidth={2} />
      </div>

      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)', color: 'var(--ink-000)', letterSpacing: '0.01em' }}>CLAUDE CODE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', letterSpacing: 'var(--tracking-hud)', color: 'var(--cyan-300)', textTransform: 'uppercase', padding: '2px 7px', border: '1px solid rgba(79,209,240,0.35)', borderRadius: 'var(--r-sm)' }}>CONDUCTOR</span>
        </div>
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 14 }}>
          <StatusDot status={running ? 'live' : 'idle'} label={running ? 'Executing' : 'Standby'} size={7} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-300)' }}>
            {activeCount} active {activeCount === 1 ? 'run' : 'runs'}
          </span>
        </div>
      </div>

      {tokensToday != null && (
        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--ink-000)', lineHeight: 1 }}>{tokensToday}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', letterSpacing: 'var(--tracking-hud)', textTransform: 'uppercase', color: 'var(--ink-400)', marginTop: 4 }}>tokens today</div>
        </div>
      )}
    </div>
  );
}
