# DESIGN — Agentic OS Command Center (v2 — Claude Design glass restyle, 2026-07-09)

Source of truth: the owner's Claude Design kit (project `fa0359d6`, `ui_kits/agentic-os`),
mirrored locally at `design/reference/`. Tokens live in `src/app/globals.css` (@theme) and
`design/tokens.json`. Where this file and the kit disagree, the kit wins.

## Aesthetic thesis
A Jarvis-grade dark ops room, evolved: translucent glass panels floating over an ambient
cyan/indigo glow — Vision-UI glassmorphism re-hued to the Jarvis world. Cyan = LIVE,
gold = a HUMAN decides. Everything pressable, nothing silent.

## The two surface modes
- **GLASS (default):** cards are `var(--card-bg)` (translucent gradient) + `var(--card-border-c)`
  hairline + `backdrop-filter: var(--card-blur)` + `var(--shadow-glass)`, floating over
  `var(--bg-ambient)` (near-black blue lit from below). Nested tiles use `var(--card-inner)`.
- **SOLID (`body.ao-solid`):** the original flat machined HUD. Same components, flat vars.
  The Shell header carries the GLASS/SOLID toggle; persist to localStorage (`ao_style`).

## Color rules
- Room scale `room-000…300` (cool near-black blue) for all structure. Never pure black/gray.
- LIVE cyan `#4FD1F0`: primary actions, running/streaming, focus, the conductor. Glow is an
  event, not wallpaper — >5% cyan coverage on a screen is a bug.
- COMMAND gold `#EDB94F`: human-fire moments only — MANUAL buttons, approvals, "you decide".
- Taxonomy (chips/borders ONLY): MANUAL gold `#EDB94F` · SKILL cyan `#4FD1F0` ·
  ROUTINE indigo `#8B93F7` · AGENT teal-green `#5EE0A8`. (v2 note: ROUTINE moved green→indigo,
  AGENT purple→teal-green, per the kit.)
- Status: ok `#46D6A0` / warn gold / bad `#F26D6D`, each with a matching `--glow-*` used only
  on the element in that state.
- Ink scale `ink-000…400` for text. All values from tokens; arbitrary values (`bg-[#…]`) are bugs.

## Type rules
- Display: **Space Grotesk** — headings, venture names, buttons, nav. 500-700.
- Body: **Geist** — paragraphs, chat, forms. 300-600.
- Mono: **JetBrains Mono** — ALL live data: numbers, timestamps, console, tags, eyebrows
  (`.eyebrow` = mono 10px uppercase 0.16em tracking).
- Desktop density: base UI 14px (`--text-base`); kit scale micro 10 → 3xl 46. No ad-hoc sizes.

## Spacing, radii, depth
- 4px grid; density is the point. Sidebar: hover-expand rail 76→240px.
- Radii are soft now: controls 10px (`--radius-md`), cards/tiles 14px, glass panels 20px,
  hero panels 24px, chips/dots pill. (v2: the old 3/8px sharp system is retired.)
- Glows (`--glow-live/command/ok/bad`) mark state; `--shadow-glass` is the resting elevation.

## Motion
- Durations 80/140/220/360ms, `--ease-out`/`--ease-hud`; panel entrances `ao-rise`.
- Ambient life is allowed ONLY on live things: `ao-glow-breathe` on the executing conductor,
  `ao-ping` on live dots, `ao-caret` on streaming text, `ao-sweep` on active progress.
  Idle elements stay still. `prefers-reduced-motion` collapses everything.

## Component canon (port from design/reference/components/)
Panel · Button (primary/command/secondary/ghost/danger, loading state) · NeonButton ·
Badge · Tag · TypeChip · StatusDot (ping when live) · IconButton · Input · Switch · Tabs ·
WorkflowButton (idle/running/done/error, never silent) · ConductorNode · VentureCard ·
StatusReadout · AgentRosterItem · ProposalCard · ConsoleStream · GlowingEffect.
Icons: lucide-react, 1.75 stroke default.

## Banned (anti-slop)
- Default Tailwind palette/radii/shadows; Inter; pure black backgrounds; pure gray neutrals.
- Emoji as UI icons; hero blobs; centered-everything; three-feature-cards-as-reflex.
- Purple/indigo outside the ROUTINE chip; cyan body copy; glow on non-live elements.
- Idle animation loops outside the allowed live set; scan-line overlays.
- Unstyled placeholder/empty states — every empty state is designed (see kit EmptyRow).
