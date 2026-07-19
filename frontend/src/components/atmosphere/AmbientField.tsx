"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  hue: number;
};

/**
 * Lightweight canvas field: soft cyan/indigo dust + slow drift.
 * Respects prefers-reduced-motion; pauses when tab is hidden.
 */
export function AmbientField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let particles: Particle[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(72, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => spawn());
    };

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.08 - Math.random() * 0.18,
      a: 0.15 + Math.random() * 0.4,
      hue: Math.random() > 0.55 ? 190 : 220,
    });

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) loop();
    };

    const loop = () => {
      if (!running || disposed) return;
      raf = requestAnimationFrame(loop);

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      ctx.clearRect(0, 0, w, h);

      // Soft vignette orbs (parallax with mouse)
      const ox = (mouse.x - 0.5) * 40;
      const oy = (mouse.y - 0.5) * 28;

      const orb = (
        x: number,
        y: number,
        radius: number,
        color: string,
        alpha: number,
      ) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, color.replace("ALPHA", String(alpha)));
        g.addColorStop(1, color.replace("ALPHA", "0"));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      orb(
        w * 0.5 + ox * 0.6,
        h * 0.48 + oy * 0.5,
        Math.min(w, h) * 0.42,
        "rgba(34,211,238,ALPHA)",
        0.07,
      );
      orb(
        w * 0.22 + ox,
        h * 0.28 + oy,
        Math.min(w, h) * 0.28,
        "rgba(99,102,241,ALPHA)",
        0.06,
      );
      orb(
        w * 0.78 - ox,
        h * 0.72 - oy,
        Math.min(w, h) * 0.3,
        "rgba(56,189,248,ALPHA)",
        0.05,
      );

      for (const p of particles) {
        p.x += p.vx + (mouse.x - 0.5) * 0.15;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let disposed = false;
    resize();
    loop();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
