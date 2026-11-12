import React from 'react';

/**
 * StatusDot — the atomic health/state indicator.
 * live/running dots emit a pulsing ping ring; static states are steady.
 */
export function StatusDot({ status = 'ok', size = 8, pulse, label, className = '', style = {} }) {
  const map = {
    ok:      { c: 'var(--ok-400)',   glow: 'var(--ok-glow)' },
    live:    { c: 'var(--cyan-400)', glow: 'var(--cyan-glow)' },
    running: { c: 'var(--cyan-400)', glow: 'var(--cyan-glow)' },
    bad:     { c: 'var(--bad-400)',  glow: 'var(--bad-glow)' },
    warn:    { c: 'var(--gold-400)', glow: 'var(--gold-glow)' },
    idle:    { c: 'var(--ink-400)',  glow: 'transparent' },
  };
  const s = map[status] || map.ok;
  const doPulse = pulse != null ? pulse : (status === 'live' || status === 'running');
  const dot = (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flex: '0 0 auto' }}>
      {doPulse && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: s.c,
          animation: 'ao-ping 1.8s var(--ease-out) infinite',
        }} />
      )}
      <span style={{
        position: 'relative', width: size, height: size, borderRadius: '50%', background: s.c,
        boxShadow: s.glow === 'transparent' ? 'none' : `0 0 8px ${s.glow}`,
      }} />
    </span>
  );
  if (!label) return <span className={className} style={style}>{dot}</span>;
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, ...style }}>
      {dot}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', letterSpacing: 'var(--tracking-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</span>
    </span>
  );
}
