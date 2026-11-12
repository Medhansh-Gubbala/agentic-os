import React from 'react';

/** Tabs — underline tab bar for switching views (e.g. venture detail sections). */
export function Tabs({ tabs = [], value, onChange, accent = 'var(--cyan-400)', className = '', style = {} }) {
  const active = value != null ? value : (tabs[0] && (tabs[0].id || tabs[0]));
  return (
    <div className={className} style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', ...style }}>
      {tabs.map((t) => {
        const id = t.id || t;
        const label = t.label || t;
        const count = t.count;
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange && onChange(id)}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)',
              color: isActive ? 'var(--ink-000)' : 'var(--ink-300)',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--ink-100)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--ink-300)'; }}
          >
            {label}
            {count != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: isActive ? accent : 'var(--ink-400)' }}>{count}</span>}
            {isActive && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, background: accent, borderRadius: 2, boxShadow: `0 0 8px ${accent}` }} />}
          </button>
        );
      })}
    </div>
  );
}
