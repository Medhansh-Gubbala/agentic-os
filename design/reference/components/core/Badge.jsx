import React from 'react';

/** Badge — small count / notification pill. tone drives color. */
export function Badge({ children, tone = 'neutral', glow = false, className = '', style = {} }) {
  const tones = {
    neutral: { bg: 'var(--room-250)', fg: 'var(--ink-200)', bd: 'var(--line-strong)' },
    live:    { bg: 'var(--cyan-wash)', fg: 'var(--cyan-300)', bd: 'rgba(79,209,240,0.35)' },
    command: { bg: 'var(--gold-wash)', fg: 'var(--gold-300)', bd: 'rgba(237,185,79,0.35)' },
    ok:      { bg: 'var(--ok-wash)',  fg: 'var(--ok-400)',  bd: 'rgba(70,214,160,0.35)' },
    bad:     { bg: 'var(--bad-wash)', fg: 'var(--bad-400)', bd: 'rgba(242,109,109,0.4)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 18, height: 18, padding: '0 6px',
        background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', fontWeight: 600, lineHeight: 1,
        boxShadow: glow && tone === 'bad' ? 'var(--glow-bad)' : (glow && tone === 'command' ? 'var(--glow-command)' : 'none'),
        ...style,
      }}
    >{children}</span>
  );
}
