import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * Tag — monospace scope/metadata tag, e.g. "+ projects", "@site-forge".
 * The mono, low-key sibling to TypeChip. Used for scope, repo, integration refs.
 */
export function Tag({ children, icon, tone = 'neutral', className = '', style = {} }) {
  const tones = {
    neutral: { fg: 'var(--ink-300)', bd: 'var(--line)' },
    live:    { fg: 'var(--cyan-300)', bd: 'rgba(79,209,240,0.3)' },
    dim:     { fg: 'var(--ink-400)', bd: 'var(--line-soft)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: 20, padding: '0 7px',
        background: 'var(--room-000)', color: t.fg, border: `1px solid ${t.bd}`,
        borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', letterSpacing: 'var(--tracking-mono)',
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}
