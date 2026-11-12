import React from 'react';
import { Icon } from './Icon.jsx';

/** IconButton — square icon-only control for toolbars and dense chrome. */
export function IconButton({ icon, size = 32, iconSize, variant = 'ghost', active = false, badge, title, className = '', style = {}, ...rest }) {
  const variants = {
    ghost: { background: active ? 'var(--room-200)' : 'transparent', color: active ? 'var(--cyan-400)' : 'var(--ink-200)', border: '1px solid ' + (active ? 'var(--line-strong)' : 'transparent') },
    solid: { background: 'var(--room-200)', color: 'var(--ink-100)', border: '1px solid var(--line-strong)' },
  };
  const v = variants[variant] || variants.ghost;
  return (
    <button
      title={title}
      className={className}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 'var(--r-md)', cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)', ...v, ...style,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--room-200)'; e.currentTarget.style.color = 'var(--ink-000)'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-200)'; } }}
      {...rest}
    >
      <Icon name={icon} size={iconSize || Math.round(size * 0.5)} />
      {badge != null && (
        <span style={{
          position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px',
          background: 'var(--cyan-400)', color: '#04222B', borderRadius: 'var(--r-pill)',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--room-050)',
        }}>{badge}</span>
      )}
    </button>
  );
}
