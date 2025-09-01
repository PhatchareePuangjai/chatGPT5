import React, { useEffect, useRef } from "react";

type Props = { fire: boolean; onEnd?: () => void; durationMs?: number };
export default function Confetti({ fire, onEnd, durationMs = 900 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fire || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let start = performance.now();
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const N = 90;
    const pieces = new Array(N).fill(0).map(() => ({
      x: Math.random() * rect.width,
      y: -Math.random() * 200,
      r: 4 + Math.random() * 6,
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI,
    }));

    const colors = ["#60a5fa","#f472b6","#34d399","#fbbf24","#f87171"];

    function loop(t: number) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, rect.width, rect.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = colors[(p.r | 0) % colors.length];
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      });
      raf = requestAnimationFrame(loop);
      if (elapsed > durationMs) {
        cancelAnimationFrame(raf);
        onEnd?.();
      }
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fire, onEnd, durationMs]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <canvas ref={ref} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
