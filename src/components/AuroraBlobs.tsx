"use client";

import { useEffect, useRef } from "react";

type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  phase: number;
  phaseSpeed: number;
  color: [number, number, number];
  influence: number;
};

const PALETTE: { color: [number, number, number]; rf: number; inf: number }[] = [
  { color: [80,  150, 230], rf: 0.42, inf: 0.05  },
  { color: [100, 210, 195], rf: 0.38, inf: 0.035 },
  { color: [160, 110, 240], rf: 0.35, inf: 0.055 },
  { color: [60,  195, 170], rf: 0.30, inf: 0.025 },
  { color: [130, 170, 255], rf: 0.33, inf: 0.045 },
];

export default function AuroraBlobs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const dim = () => Math.max(canvas.width, canvas.height);

    const blobs: Blob[] = PALETTE.map((p, i) => ({
      x:          canvas.width  * (0.1 + i * 0.2),
      y:          canvas.height * (0.2 + (i % 3) * 0.3),
      vx:         (Math.random() - 0.5) * 1.2,
      vy:         (Math.random() - 0.5) * 1.2,
      baseRadius: dim() * p.rf,
      phase:      Math.random() * Math.PI * 2,
      phaseSpeed: 0.004 + Math.random() * 0.006,
      color:      p.color,
      influence:  p.inf,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      resize();
      blobs.forEach((b, i) => { b.baseRadius = dim() * PALETTE[i].rf; });
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob) => {
        // mouse pull — user-requested 0.05 base influence
        const dx = mouse.x - blob.x;
        const dy = mouse.y - blob.y;
        blob.vx += dx * blob.influence * 0.012;
        blob.vy += dy * blob.influence * 0.012;

        // organic turbulence
        blob.vx += Math.sin(t * 0.013 + blob.phase)      * 0.28;
        blob.vy += Math.cos(t * 0.017 + blob.phase * 1.3) * 0.28;

        // damping — less than before for more energy
        blob.vx *= 0.91;
        blob.vy *= 0.91;

        blob.x += blob.vx;
        blob.y += blob.vy;

        blob.phase += blob.phaseSpeed;

        // soft walls
        if (blob.x < -blob.baseRadius * 0.5)                    blob.vx += 1.2;
        if (blob.x > canvas.width + blob.baseRadius * 0.5)      blob.vx -= 1.2;
        if (blob.y < -blob.baseRadius * 0.5)                    blob.vy += 1.2;
        if (blob.y > canvas.height + blob.baseRadius * 0.5)     blob.vy -= 1.2;

        // pulsing radius for organic blob feel
        const pulse = 1 + 0.12 * Math.sin(t * blob.phaseSpeed * 3 + blob.phase);
        const r = blob.baseRadius * pulse;

        const [cr, cg, cb] = blob.color;

        // outer soft halo
        const halo = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, r * 1.5);
        halo.addColorStop(0,   `rgba(${cr},${cg},${cb},0)`);
        halo.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.08)`);
        halo.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // core blob
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, r);
        grad.addColorStop(0,   `rgba(${cr},${cg},${cb},0.72)`);
        grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.42)`);
        grad.addColorStop(0.75,`rgba(${cr},${cg},${cb},0.15)`);
        grad.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: "blur(48px)", opacity: 0.82 }}
    />
  );
}
