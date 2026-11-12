import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { TypeChip } from './TypeChip.jsx';

const CADENCE = {
  'on-demand': { icon: 'zap',     title: 'On demand' },
  scheduled:   { icon: 'clock',   title: 'Scheduled' },
  'long-running': { icon: 'infinity', title: 'Long running' },
};

/**
 * WorkflowButton — the pressable unit of Agentic OS. NEVER silent: shows its
 * live state at all times. Displays name, TypeChip, cadence icon, mono scope
 * tag, and a state (idle / running[glow] / done / error).
 */
export function WorkflowButton({
  name, type = 'SKILL', cadence = 'on-demand', scope,
  state = 'idle', meta, onClick, className = '', style = {},
}) {
  const cad = CADENCE[cadence] || CADENCE['on-demand'];

  const stateStyle = {
    idle:    { border: '1px solid var(--line)', boxShadow: 'var(--inset-top-hi)', bg: 'var(--room-150)' },
    running: { border: '1px solid rgba(79,209,240,0.5)', boxShadow: 'var(--glow-live)', bg: 'linear-gradient(180deg, rgba(79,209,240,0.06), var(--room-150))' },
    done:    { border: '1px solid rgba(70,214,160,0.45)', boxShadow: '0 0 0 1px rgba(70,214,160,0.15)', bg: 'var(--room-150)' },
    error:   { border: '1px solid rgba(242,109,109,0.5)', boxShadow: 'var(--glow-bad)', bg: 'linear-gradient(180deg, rgba(242,109,109,0.05), var(--room-150))' },
  };
  const st = stateStyle[state] || stateStyle.idle;

  const StateGlyph = () => {
    if (state === 'running') return <span style={{ position: 'relative', width: 14, height: 14, display: 'inline-flex' }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid var(--cyan-400)', borderTopColor: 'transparent', animation: 'ao-spin 0.7s linear infinite' }} />
    </span>;
    if (state === 'done')  return <Icon name="check" size={14} color="var(--ok-400)" />;
    if (state === 'error') return <Icon name="triangle-alert" size={14} color="var(--bad-400)" />;
    return <Icon name="chevron-right" size={14} color="var(--ink-400)" />;
  };

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8, width: '100%', textAlign: 'left',
        padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
        background: st.bg, border: st.border, boxShadow: st.boxShadow,
        transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { if (state === 'idle') { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={(e) => { if (state === 'idle') { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = ''; } }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.99)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <span title={cad.title} style={{ display: 'inline-flex', color: 'var(--ink-300)', flex: '0 0 auto' }}>
          <Icon name={cad.icon} size={14} />
        </span>
        <span style={{
          flex: '1 1 auto', minWidth: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)',
          fontWeight: 'var(--fw-medium)', color: 'var(--ink-100)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</span>
        <StateGlyph />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <TypeChip type={type} />
        {scope && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--ink-300)',
            letterSpacing: 'var(--tracking-mono)',
          }}>{scope}</span>
        )}
        {meta && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: state === 'running' ? 'var(--cyan-300)' : 'var(--ink-400)' }}>{meta}</span>
        )}
      </div>
    </button>
  );
}
