import React from 'react';

/**
 * ConsoleStream — the Claude Code live console. Monospace log with typed line
 * kinds; when `streaming`, lines reveal progressively and the newest glows in
 * with a blinking caret.
 */
const KIND_COLOR = {
  system:  'var(--ink-400)',
  cmd:     'var(--cyan-300)',
  output:  'var(--ink-200)',
  success: 'var(--ok-400)',
  error:   'var(--bad-400)',
  dim:     'var(--ink-400)',
};

export function ConsoleStream({ lines = [], streaming = false, height = 320, className = '', style = {} }) {
  const [shown, setShown] = React.useState(streaming ? 0 : lines.length);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (!streaming) { setShown(lines.length); return; }
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) clearInterval(id);
    }, 420);
    return () => clearInterval(id);
  }, [streaming, lines.length]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [shown]);

  const visible = lines.slice(0, shown);
  return (
    <div
      ref={scrollRef}
      className={className}
      style={{
        height, overflowY: 'auto', padding: 16,
        background: 'var(--room-000)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', lineHeight: 1.65,
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)', ...style,
      }}
    >
      {visible.map((ln, i) => {
        const kind = ln.kind || 'output';
        const isNewest = streaming && i === shown - 1;
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, color: KIND_COLOR[kind] || 'var(--ink-200)',
            animation: isNewest ? 'ao-rise var(--dur-base) var(--ease-out)' : 'none',
            textShadow: isNewest && (kind === 'cmd' || kind === 'success') ? '0 0 12px currentColor' : 'none',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {ln.time && <span style={{ color: 'var(--ink-400)', flex: '0 0 auto' }}>{ln.time}</span>}
            {kind === 'cmd' && <span style={{ color: 'var(--cyan-400)', flex: '0 0 auto' }}>❯</span>}
            <span style={{ flex: '1 1 auto', fontWeight: kind === 'success' || kind === 'error' ? 600 : 400 }}>
              {ln.text}
              {isNewest && i === lines.length - 1 && streaming && (
                <span style={{ display: 'inline-block', width: 7, height: 13, marginLeft: 3, background: 'var(--cyan-400)', verticalAlign: 'text-bottom', animation: 'ao-caret 1s step-end infinite' }} />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
