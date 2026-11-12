import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * StatusReadout — a single HUD metric in the dashboard status strip.
 * Big mono numeral + uppercase label + optional icon and trend/delta.
 */
export function StatusReadout({ label, value, unit, icon, tone = 'default', live = false, delta, className = '', style = {} }) {
  const tones = {
    default: 'var(--ink-000)',
    live:    'var(--cyan-400)',
    command: 'var(--gold-400)',
    ok:      'var(--ok-400)',
    bad:     'var(--bad-400)',
  };
  const color = tones[tone] || tones.default;
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {icon && <Icon name={icon} size={13} color="var(--ink-400)" />}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', letterSpacing: 'var(--tracking-hud)', textTransform: 'uppercase', color: 'var(--ink-400)', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xl)', fontWeight: 700, lineHeight: 1,
          color, letterSpacing: '-0.01em',
          textShadow: live ? `0 0 18px ${tone === 'command' ? 'var(--gold-glow)' : 'var(--cyan-glow)'}` : 'none',
        }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-300)' }}>{unit}</span>}
        {delta && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: delta.startsWith('-') ? 'var(--bad-400)' : 'var(--ok-400)', marginLeft: 2 }}>{delta}</span>}
      </div>
    </div>
  );
}
