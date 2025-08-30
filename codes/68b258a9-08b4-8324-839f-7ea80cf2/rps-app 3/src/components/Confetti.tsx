import React, { useEffect, useRef } from "react";

type Props = { fire: boolean; onEnd?: () => void; durationMs?: number };

export default function Confetti({ fire, onEnd, durationMs = 900 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!fire || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const N = 90;
    const pieces = new Array(N).fill(0).map(() => ({
      x: Math.random() * rect.width,
      y: -Math.random() * 200,
      r: 4 + Math.random() * 6,
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI,
    }));
    const colors = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#f87171"];
    const start = performance.now();

    function loop(t: number) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = colors[(p.r | 0) % colors.length];
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
      if (elapsed > durationMs) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onEnd?.();
      }
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, rect.width, rect.height);
    };
  }, [fire, onEnd, durationMs]);

  useEffect(() => {
    if (!fire && ref.current) {
      const c = ref.current;
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
  }, [fire]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <canvas ref={ref} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
