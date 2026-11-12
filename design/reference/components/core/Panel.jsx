import React from 'react';

/**
 * Panel — the base surface container. A dark recessed "screen" with a hairline
 * border and optional header (eyebrow label + right-side actions).
 * `glow="live"` adds the cyan HUD glow for live/active panels.
 */
export function Panel({ title, eyebrow, actions, glow, padded = true, gridBg = false, children, className = '', style = {} }) {
  const glows = {
    live: 'var(--glow-live)',
    command: 'var(--glow-command)',
    ok: 'var(--glow-ok)',
    bad: 'var(--glow-bad)',
  };
  return (
    <section
      className={className}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border-c)',
        borderRadius: 'var(--r-xl)',
        backdropFilter: 'var(--card-blur)',
        WebkitBackdropFilter: 'var(--card-blur)',
        boxShadow: glow ? glows[glow] : 'var(--shadow-glass)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', minWidth: 0,
        ...style,
      }}
    >
      {(title || eyebrow || actions) && (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--line-soft)', gap: 12, flex: '0 0 auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            {eyebrow && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', letterSpacing: 'var(--tracking-hud)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{eyebrow}</span>}
            {title && <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-semibold)' }}>{title}</h3>}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>{actions}</div>}
        </header>
      )}
      <div
        className={gridBg ? 'hud-grid' : ''}
        style={{ padding: padded ? 'var(--panel-pad)' : 0, flex: '1 1 auto', minHeight: 0 }}
      >
        {children}
      </div>
    </section>
  );
}
