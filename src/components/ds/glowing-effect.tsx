"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * GlowingEffect — pointer-tracked conic border glow (ported from the Aceternity
 * glowing-effect, re-hued for Agentic OS; vanilla React, no deps).
 *
 * Drop inside any `position: relative` container with a border-radius; it paints
 * a glowing gradient segment on the border that follows the pointer.
 * `glow` mode ignores the pointer and slowly orbits — use for RUNNING cards.
 */
const N = 5; // repeating-conic segments

const GRADIENTS: Record<string, string> = {
  live: `radial-gradient(circle, #4FD1F0 10%, rgba(79,209,240,0) 20%),
    radial-gradient(circle at 40% 40%, #8B93F7 5%, rgba(139,147,247,0) 15%),
    radial-gradient(circle at 60% 60%, #2CB6DA 10%, rgba(44,182,218,0) 20%),
    radial-gradient(circle at 40% 60%, #5EE0A8 10%, rgba(94,224,168,0) 20%),
    repeating-conic-gradient(from 236.84deg at 50% 50%, #4FD1F0 0%, #8B93F7 calc(25% / ${N}), #2CB6DA calc(50% / ${N}), #5EE0A8 calc(75% / ${N}), #4FD1F0 calc(100% / ${N}))`,
  command: `radial-gradient(circle, #EDB94F 10%, rgba(237,185,79,0) 20%),
    radial-gradient(circle at 40% 40%, #F6D188 5%, rgba(246,209,136,0) 15%),
    radial-gradient(circle at 60% 60%, #D49E30 10%, rgba(212,158,48,0) 20%),
    repeating-conic-gradient(from 236.84deg at 50% 50%, #EDB94F 0%, #F6D188 calc(25% / ${N}), #D49E30 calc(50% / ${N}), #EDB94F calc(75% / ${N}), #F6D188 calc(100% / ${N}))`,
  white: `repeating-conic-gradient(from 236.84deg at 50% 50%, #E4EAF3 0%, rgba(228,234,243,0.4) calc(25% / ${N}), #E4EAF3 calc(50% / ${N}), rgba(228,234,243,0.4) calc(75% / ${N}), #E4EAF3 calc(100% / ${N}))`,
};

export function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 64,
  spread = 24,
  variant = "live",
  glow = false,
  disabled = false,
  movementDuration = 1.6,
  borderWidth = 1.5,
  className = "",
  style = {},
}: {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "live" | "command" | "white";
  glow?: boolean;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const tween = useRef(0);

  // pointer-follow mode
  useEffect(() => {
    if (disabled || glow) return;
    const handleMove = (e?: PointerEvent) => {
      if (!containerRef.current) return;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const mx = e ? e.clientX : lastPos.current.x;
        const my = e ? e.clientY : lastPos.current.y;
        if (e) lastPos.current = { x: mx, y: my };
        const cx = left + width * 0.5;
        const cy = top + height * 0.5;
        if (Math.hypot(mx - cx, my - cy) < 0.5 * Math.min(width, height) * inactiveZone) {
          el.style.setProperty("--active", "0");
          return;
        }
        const isActive = mx > left - proximity && mx < left + width + proximity && my > top - proximity && my < top + height + proximity;
        el.style.setProperty("--active", isActive ? "1" : "0");
        if (!isActive) return;
        const current = parseFloat(el.style.getPropertyValue("--start")) || 0;
        const target = (180 * Math.atan2(my - cy, mx - cx)) / Math.PI + 90;
        const diff = ((target - current + 180) % 360) - 180;
        const to = current + diff;
        if (tween.current) cancelAnimationFrame(tween.current);
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / (movementDuration * 1000));
          const v = current + (to - current) * (1 - Math.pow(2, -10 * p));
          el.style.setProperty("--start", String(v));
          if (p < 1) tween.current = requestAnimationFrame(step);
        };
        tween.current = requestAnimationFrame(step);
      });
    };
    const onScroll = () => handleMove();
    const onPointer = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (tween.current) cancelAnimationFrame(tween.current);
      window.removeEventListener("scroll", onScroll);
      document.body.removeEventListener("pointermove", onPointer);
    };
  }, [disabled, glow, inactiveZone, proximity, movementDuration]);

  // glow mode: always on, slow orbit (for RUNNING things)
  useEffect(() => {
    if (disabled || !glow) return;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--active", "1");
    let alive = true;
    const t0 = performance.now();
    const base = parseFloat(el.style.getPropertyValue("--start")) || 0;
    const loop = (now: number) => {
      if (!alive || !containerRef.current) return;
      containerRef.current.style.setProperty("--start", String(base + ((now - t0) / 1000) * 42)); // 42deg/s
      tween.current = requestAnimationFrame(loop);
    };
    tween.current = requestAnimationFrame(loop);
    return () => {
      alive = false;
      if (tween.current) cancelAnimationFrame(tween.current);
    };
  }, [glow, disabled]);

  if (disabled) return null;

  const mask =
    "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), conic-gradient(from calc((var(--start) - var(--spread)) * 1deg), rgba(0,0,0,0) 0deg, #fff, rgba(0,0,0,0) calc(var(--spread) * 2deg))";

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        {
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          "--start": "0",
          "--active": "0",
          "--spread": spread,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          ...style,
        } as CSSProperties
      }
    >
      <div
        style={{
          position: "absolute",
          inset: `${-borderWidth}px`,
          borderRadius: "inherit",
          border: `${borderWidth}px solid transparent`,
          background: GRADIENTS[variant] || GRADIENTS.live,
          backgroundAttachment: "fixed",
          opacity: "var(--active)",
          transition: "opacity 300ms var(--ease-out)",
          WebkitMask: mask,
          mask,
          WebkitMaskClip: "padding-box, border-box",
          maskClip: "padding-box, border-box",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        } as CSSProperties}
      />
    </div>
  );
}
