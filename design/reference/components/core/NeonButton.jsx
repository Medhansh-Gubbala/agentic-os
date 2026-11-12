import React from 'react';

/**
 * NeonButton — pill button with neon gradient hairlines (ported from the
 * neon-button kit component, re-hued for Agentic OS). The bottom edge carries a
 * lit gradient line; hovering ignites the top edge too.
 *
 * Variants: default (cyan wash), solid (cyan fill), command (gold wash),
 * ghost (transparent).
 */
export function NeonButton({
  children, variant = 'default', size = 'md', neon = true,
  disabled = false, onClick, className = '', style = {}, ...rest
}) {
  const [hover, setHover] = React.useState(false);

  const sizes = {
    sm: { px: 16, py: 5, fs: 'var(--fs-xs)' },
    md: { px: 28, py: 8, fs: 'var(--fs-sm)' },
    lg: { px: 40, py: 11, fs: 'var(--fs-base)' },
  };
  const s = sizes[size] || sizes.md;

  const accents = {
    default: { line: 'var(--cyan-400)', glow: 'var(--cyan-glow)' },
    solid:   { line: '#BFEFFB',          glow: 'var(--cyan-glow)' },
    command: { line: 'var(--gold-400)', glow: 'var(--gold-glow)' },
    ghost:   { line: 'var(--cyan-400)', glow: 'var(--cyan-glow)' },
  };
  const a = accents[variant] || accents.default;

  const variants = {
    default: {
      background: hover ? 'rgba(79,209,240,0)' : 'rgba(79,209,240,0.06)',
      border: '1px solid rgba(79,209,240,0.25)', color: 'var(--ink-000)',
    },
    solid: {
      background: hover ? 'linear-gradient(180deg, var(--cyan-300), var(--cyan-500))' : 'linear-gradient(180deg, var(--cyan-400), var(--cyan-500))',
      border: '1px solid transparent', color: '#04222B',
      boxShadow: '0 4px 18px -6px var(--cyan-glow)',
    },
    command: {
      background: hover ? 'rgba(237,185,79,0.02)' : 'rgba(237,185,79,0.08)',
      border: '1px solid rgba(237,185,79,0.3)', color: 'var(--gold-300)',
    },
    ghost: {
      background: hover ? 'rgba(255,255,255,0.06)' : 'transparent',
      border: '1px solid ' + (hover ? 'var(--card-border-strong-c)' : 'transparent'), color: 'var(--ink-100)',
    },
  };
  const v = variants[variant] || variants.default;

  const line = (pos, visible, op) => (
    <span style={{
      position: 'absolute', [pos]: -1, left: '12.5%', width: '75%', height: 1,
      background: `linear-gradient(90deg, transparent, ${a.line}, transparent)`,
      opacity: visible ? op : 0, transition: 'opacity 500ms var(--ease-in-out)',
      filter: `drop-shadow(0 0 6px ${a.glow})`, pointerEvents: 'none',
    }} />
  );

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: `${s.py}px ${s.px}px`, borderRadius: 'var(--r-pill)', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-display)', fontSize: s.fs, fontWeight: 'var(--fw-semibold)', letterSpacing: '0.02em',
        whiteSpace: 'nowrap', userSelect: 'none', opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        ...v, ...style,
      }}
      {...rest}
    >
      {neon && line('top', hover, 1)}
      {children}
      {neon && line('bottom', true, hover ? 0.35 : 0.9)}
    </button>
  );
}
