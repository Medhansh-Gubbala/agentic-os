const { ConsoleStream, Input, Button, Icon, Tag, StatusDot } = window.AgenticOSDesignSystem_fa0359;

function Sessions({ go }) {
  const D = window.AO_DATA;
  const [runKey, setRunKey] = React.useState(1);
  const [running, setRunning] = React.useState(true);
  const [repo, setRepo] = React.useState('site-forge');
  const [prompt, setPrompt] = React.useState('audit onboarding flow');

  React.useEffect(() => {
    const ms = D.consoleLines.length * 420 + 400;
    const id = setTimeout(() => setRunning(false), ms);
    return () => clearTimeout(id);
  }, [runKey]);

  const launch = () => { setRunning(true); setRunKey((k) => k + 1); };

  return (
    <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Launcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', height: 34, borderRadius: 'var(--r-md)', border: '1px solid var(--line-strong)', background: 'var(--room-000)', flex: '0 0 auto' }}>
          <Icon name="git-branch" size={14} color="var(--cyan-400)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-100)' }}>{repo}</span>
          <Icon name="chevron-down" size={13} color="var(--ink-400)" />
        </div>
        <Input mono placeholder="Describe the task for Claude Code…" value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ flex: '1 1 auto' }} />
        <Button variant="command" icon="play" onClick={launch}>Launch session</Button>
      </div>

      {/* Live console */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', border: '1px solid var(--card-border-c)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: running ? 'var(--glow-live)' : 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--line)' }}>
          <StatusDot status={running ? 'running' : 'ok'} size={7} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-100)' }}>claude-code · {repo}</span>
          <Tag tone="dim">session #{2840 + runKey}</Tag>
          <div style={{ flex: '1 1 auto' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: running ? 'var(--cyan-300)' : 'var(--ink-400)' }}>{running ? 'streaming…' : 'exited 0'}</span>
        </div>
        <div style={{ padding: 12 }}>
          <ConsoleStream key={runKey} streaming={running} lines={D.consoleLines} height={300} style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 4 }} />
        </div>
      </div>

      {/* History */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)', margin: '4px 0 10px' }}>Run history</div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 90px 80px 80px 70px', gap: 12, padding: '9px 16px', background: 'var(--room-000)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>
            <span>Venture</span><span>Prompt</span><span>Duration</span><span>Tokens</span><span>Exit</span><span style={{ textAlign: 'right' }}>Time</span>
          </div>
          {D.sessions.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 90px 80px 80px 70px', gap: 12, padding: '11px 16px', background: 'var(--room-100)', borderTop: '1px solid var(--line-soft)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-100)' }}>{s.venture}</span>
              <span style={{ color: 'var(--ink-200)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.prompt}</span>
              <span style={{ color: 'var(--ink-300)' }}>{s.duration}</span>
              <span style={{ color: 'var(--ink-300)' }}>{s.tokens}</span>
              <span style={{ color: s.exit === 0 ? 'var(--ok-400)' : 'var(--bad-400)' }}>exit {s.exit}</span>
              <span style={{ color: 'var(--ink-400)', textAlign: 'right' }}>{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sessions });
