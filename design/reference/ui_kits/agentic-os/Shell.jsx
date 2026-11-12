const { Icon, IconButton, Badge, StatusDot } = window.AgenticOSDesignSystem_fa0359;

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'workflows', label: 'Workflows', icon: 'workflow' },
  { id: 'ventures',  label: 'Ventures',  icon: 'layers' },
  { id: 'agents',    label: 'Agents',    icon: 'users-round' },
  { id: 'inbox',     label: 'Inbox',     icon: 'inbox', badge: 2, tone: 'live' },
  { id: 'queue',     label: 'Queue',     icon: 'list-todo', badge: 3, tone: 'command' },
  { id: 'sessions',  label: 'Sessions',  icon: 'square-terminal' },
  { id: 'marketing', label: 'Marketing', icon: 'megaphone' },
  { id: 'settings',  label: 'Settings',  icon: 'settings' },
];

const RAIL_CLOSED = 76;
const RAIL_OPEN = 240;

function NavItem({ item, active, open, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={open ? undefined : item.label}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        padding: 6, borderRadius: 'var(--r-lg)', cursor: 'pointer', overflow: 'hidden',
        background: active ? 'var(--glass-raised)' : (hover ? 'rgba(148,190,222,0.06)' : 'transparent'),
        border: '1px solid ' + (active ? 'var(--card-border-c)' : 'transparent'),
        backdropFilter: active ? 'var(--card-blur)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      }}
    >
      <span style={{
        width: 34, height: 34, flex: '0 0 auto', borderRadius: 'var(--r-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        background: active ? 'linear-gradient(180deg, var(--cyan-400), var(--cyan-600))' : 'var(--card-inner)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--card-border-c)'),
        color: active ? '#04222B' : 'var(--ink-300)',
        boxShadow: active ? '0 0 16px -4px var(--cyan-glow)' : 'none',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
      }}>
        <Icon name={item.icon} size={16} strokeWidth={active ? 2 : 1.75} />
        {item.badge != null && !open && (
          <span style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: item.tone === 'command' ? 'var(--gold-400)' : 'var(--cyan-400)', border: '2px solid #0A0F18', boxShadow: `0 0 8px ${item.tone === 'command' ? 'var(--gold-glow)' : 'var(--cyan-glow)'}` }} />
        )}
      </span>
      <span style={{
        flex: '1 1 auto', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)',
        fontWeight: active ? 600 : 500, color: active ? 'var(--ink-000)' : 'var(--ink-200)',
        whiteSpace: 'nowrap', opacity: open ? 1 : 0, transform: open ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
      }}>{item.label}</span>
      {item.badge != null && (
        <span style={{ opacity: open ? 1 : 0, transition: 'opacity var(--dur-base) var(--ease-out)', flex: '0 0 auto', marginRight: 4 }}>
          <Badge tone={item.tone}>{item.badge}</Badge>
        </span>
      )}
    </button>
  );
}

/* Notifications popover — opens on bell click, closes via X or outside click */
function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [items, setItems] = React.useState([
    { id: 'n1', icon: 'git-branch', tone: 'command', title: 'CTO proposed a Linear issue', meta: 'site-forge · needs approval', time: '2m', unread: true },
    { id: 'n2', icon: 'triangle-alert', tone: 'bad', title: 'Stripe reconciliation failed', meta: 'Relay · 429, retry queued', time: '26m', unread: true },
    { id: 'n3', icon: 'inbox', tone: 'live', title: 'CEO Morning Briefing ready', meta: 'scheduled run', time: '1h', unread: false },
    { id: 'n4', icon: 'check', tone: 'ok', title: 'ClipLab GPU migration finished', meta: 'render time −3.4×', time: '2h', unread: false },
  ]);
  const unread = items.filter((n) => n.unread).length;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const TONE = { command: 'var(--gold-400)', bad: 'var(--bad-400)', live: 'var(--cyan-400)', ok: 'var(--ok-400)' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <IconButton icon="bell" badge={unread || undefined} active={open} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 340, zIndex: 60,
          background: 'var(--card-bg)', border: '1px solid var(--card-border-strong-c)', borderRadius: 'var(--r-xl)',
          backdropFilter: 'var(--card-blur)', WebkitBackdropFilter: 'var(--card-blur)', boxShadow: 'var(--shadow-pop)',
          overflow: 'hidden', animation: 'ao-rise var(--dur-base) var(--ease-out)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderBottom: '1px solid var(--card-border-c)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-000)' }}>Notifications</span>
            {unread > 0 && <Badge tone="live">{unread}</Badge>}
            <div style={{ flex: '1 1 auto' }} />
            <button onClick={() => setItems((xs) => xs.map((n) => ({ ...n, unread: false })))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-300)', padding: '2px 4px' }}>MARK READ</button>
            <IconButton icon="x" size={26} iconSize={14} onClick={() => setOpen(false)} />
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
            {items.map((n) => (
              <button key={n.id} onClick={() => setItems((xs) => xs.map((x) => x.id === n.id ? { ...x, unread: false } : x))} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '10px 8px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148,190,222,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ width: 30, height: 30, flex: '0 0 auto', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-inner)', border: `1px solid ${TONE[n.tone]}55`, color: TONE[n.tone] }}>
                  <Icon name={n.icon} size={14} />
                </span>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: n.unread ? 'var(--ink-000)' : 'var(--ink-200)', fontWeight: n.unread ? 600 : 400 }}>{n.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)', marginTop: 2 }}>{n.meta}</div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                  {n.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: '0 0 6px var(--cyan-glow)' }} />}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)' }}>{n.time}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveClock() {
  const [t, setT] = React.useState(new Date());
  React.useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ss = String(t.getSeconds()).padStart(2, '0');
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--ink-200)', letterSpacing: '0.04em' }}>{hh}:{mm}<span style={{ color: 'var(--ink-400)' }}>:{ss}</span></span>;
}

/* Glass ↔ Solid style toggle — the two combined directions live in one app */
function StyleToggle() {
  const [solid, setSolid] = React.useState(() => localStorage.getItem('ao_style') === 'solid');
  React.useEffect(() => {
    document.body.classList.toggle('ao-solid', solid);
    localStorage.setItem('ao_style', solid ? 'solid' : 'glass');
  }, [solid]);
  const seg = (label, isOn, onClick) => (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: 'var(--r-pill)', cursor: 'pointer', border: 'none',
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em', fontWeight: 700,
      background: isOn ? 'linear-gradient(180deg, var(--cyan-400), var(--cyan-500))' : 'transparent',
      color: isOn ? '#04222B' : 'var(--ink-300)',
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
    }}>{label}</button>
  );
  return (
    <div title="Surface style" style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 'var(--r-pill)', background: 'var(--card-inner)', border: '1px solid var(--card-border-c)' }}>
      {seg('GLASS', !solid, () => setSolid(false))}
      {seg('SOLID', solid, () => setSolid(true))}
    </div>
  );
}

function Shell({ active, onNav, title, eyebrow, headerRight, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Hover-expand sidebar (ported collapsible-sidebar behavior) */}
      <aside
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          width: open ? RAIL_OPEN : RAIL_CLOSED, flex: '0 0 auto',
          display: 'flex', flexDirection: 'column', padding: '16px 12px 14px',
          transition: 'width var(--dur-slow) var(--ease-hud)',
          overflow: 'hidden',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px 18px', flex: '0 0 auto' }}>
          <span style={{
            width: 34, height: 34, borderRadius: 'var(--r-md)', flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--cyan-400), var(--cyan-600))', color: '#04222B',
            boxShadow: '0 0 18px -4px var(--cyan-glow)',
          }}><Icon name="terminal" size={18} strokeWidth={2.25} /></span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--ink-000)',
            whiteSpace: 'nowrap', opacity: open ? 1 : 0, transition: 'opacity var(--dur-base) var(--ease-out)',
          }}>AGENTIC <span style={{ color: 'var(--cyan-400)' }}>OS</span></span>
        </div>

        <nav style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map((item) => <NavItem key={item.id} item={item} active={active === item.id} open={open} onClick={() => onNav(item.id)} />)}
        </nav>

        {/* Conductor status footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 6px 0', borderTop: '1px solid var(--card-border-c)', flex: '0 0 auto' }}>
          <span style={{ width: 34, height: 34, flex: '0 0 auto', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-inner)', border: '1px solid rgba(79,209,240,0.35)' }}>
            <StatusDot status="live" size={7} />
          </span>
          <div style={{ minWidth: 0, whiteSpace: 'nowrap', opacity: open ? 1 : 0, transition: 'opacity var(--dur-base) var(--ease-out)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-100)' }}>CLAUDE CODE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan-300)', letterSpacing: '0.1em' }}>CONDUCTOR · LIVE</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 64, flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 14,
          padding: '0 24px 0 12px',
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            {eyebrow && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>{eyebrow}</div>}
            <h1 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, lineHeight: 1.1, marginTop: eyebrow ? 2 : 0 }}>{title}</h1>
          </div>
          {headerRight}
          <StyleToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 'var(--r-pill)', border: '1px solid var(--card-border-c)', background: 'var(--card-inner)' }}>
            <Icon name="cpu" size={13} color="var(--ink-400)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--cyan-300)' }}>1.24M</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-400)' }}>TOK</span>
          </div>
          <LiveClock />
          <NotificationsBell />
        </header>
        <main key={active} style={{ flex: '1 1 auto', overflowY: 'auto', padding: '16px 24px 28px', animation: 'ao-rise var(--dur-slow) var(--ease-out)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Shell, LiveClock });
