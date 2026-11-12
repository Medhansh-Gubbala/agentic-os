import React from 'react';

/**
 * TypeChip — the four workflow types, each a distinct color.
 * MANUAL (gold) · SKILL (cyan) · ROUTINE (indigo) · AGENT (teal-green)
 */
const TYPES = {
  MANUAL:  { c: 'var(--type-manual)',  bg: 'var(--type-manual-wash)',  bd: 'rgba(237,185,79,0.35)' },
  SKILL:   { c: 'var(--type-skill)',   bg: 'var(--type-skill-wash)',   bd: 'rgba(79,209,240,0.35)' },
  ROUTINE: { c: 'var(--type-routine)', bg: 'var(--type-routine-wash)', bd: 'rgba(139,147,247,0.35)' },
  AGENT:   { c: 'var(--type-agent)',   bg: 'var(--type-agent-wash)',   bd: 'rgba(94,224,168,0.35)' },
};

export function TypeChip({ type = 'SKILL', className = '', style = {} }) {
  const t = TYPES[type] || TYPES.SKILL;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 7px',
        background: t.bg, color: t.c, border: `1px solid ${t.bd}`, borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', ...style,
      }}
    >{type}</span>
  );
}
