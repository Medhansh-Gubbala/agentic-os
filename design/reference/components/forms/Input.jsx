import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Input — text field with optional leading icon and mono variant for data entry. */
export function Input({ icon, mono = false, invalid = false, size = 'md', style = {}, className = '', ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const h = size === 'sm' ? 30 : size === 'lg' ? 40 : 34;
  const border = invalid ? 'rgba(242,109,109,0.6)' : focused ? 'var(--cyan-400)' : 'var(--line-strong)';
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, height: h, padding: '0 12px',
        background: 'var(--room-000)', border: `1px solid ${border}`, borderRadius: 'var(--r-md)',
        boxShadow: focused ? '0 0 0 3px rgba(79,209,240,0.15)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)', ...style,
      }}
    >
      {icon && <Icon name={icon} size={15} color="var(--ink-400)" />}
      <input
        onFocus={(e) => { setFocused(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur && rest.onBlur(e); }}
        {...rest}
        style={{
          flex: '1 1 auto', minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--ink-100)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
          fontSize: mono ? 'var(--fs-xs)' : 'var(--fs-sm)', letterSpacing: mono ? 'var(--tracking-mono)' : 0,
        }}
      />
    </div>
  );
}
