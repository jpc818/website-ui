"use client";

import { useEffect, useRef } from "react";

const VIEW_RADIUS = 34;
const SEPARATION_RADIUS = 13;
const MAX_SPEED = 2.6;
const MIN_SPEED = 1.2;
const LEADER_PULL_RADIUS = 110;
const POINTER_RADIUS = 120;
const LEADERS = [
  { ax: 0.11, ay: 0.17, px: 0, py: 1.3 },
  { ax: 0.07, ay: 0.13, px: 2.1, py: 0.2 },
  { ax: 0.13, ay: 0.09, px: 4.2, py: 2.7 },
];

export function Murmuration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = coarse ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let count = 0;
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let next = new Int32Array(0);
    let head = new Int32Array(0);
    let cols = 0;
    let rows = 0;
    const leaders = LEADERS.map(() => ({ x: 0, y: 0 }));
    const pointer = { x: 0, y: 0, active: false };
    let clock = 0;

    const seed = () => {
      const area = width * height;
      count = Math.round(Math.min(coarse ? 300 : 1100, Math.max(220, area / 1100)));
      x = new Float32Array(count);
      y = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      next = new Int32Array(count);
      for (let i = 0; i < count; i++) {
        x[i] = Math.random() * width;
        y[i] = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        vx[i] = Math.cos(angle) * MIN_SPEED;
        vy[i] = Math.sin(angle) * MIN_SPEED;
      }
      cols = Math.ceil(width / VIEW_RADIUS) + 1;
      rows = Math.ceil(height / VIEW_RADIUS) + 1;
      head = new Int32Array(cols * rows);
    };

    const moveLeaders = () => {
      LEADERS.forEach((path, k) => {
        leaders[k].x = width * (0.5 + 0.4 * Math.sin(clock * path.ax + path.px));
        leaders[k].y = height * (0.5 + 0.36 * Math.sin(clock * path.ay + path.py));
      });
    };

    const step = (dt: number) => {
      clock += dt / 60;
      moveLeaders();

      head.fill(-1);
      for (let i = 0; i < count; i++) {
        const cx = Math.min(cols - 1, Math.max(0, (x[i] / VIEW_RADIUS) | 0));
        const cy = Math.min(rows - 1, Math.max(0, (y[i] / VIEW_RADIUS) | 0));
        const cell = cy * cols + cx;
        next[i] = head[cell];
        head[cell] = i;
      }

      for (let i = 0; i < count; i++) {
        const xi = x[i];
        const yi = y[i];
        const cx = Math.min(cols - 1, Math.max(0, (xi / VIEW_RADIUS) | 0));
        const cy = Math.min(rows - 1, Math.max(0, (yi / VIEW_RADIUS) | 0));
        let n = 0;
        let alignX = 0;
        let alignY = 0;
        let centerX = 0;
        let centerY = 0;
        let pushX = 0;
        let pushY = 0;

        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          if (gy < 0 || gy >= rows) continue;
          for (let gx = cx - 1; gx <= cx + 1; gx++) {
            if (gx < 0 || gx >= cols) continue;
            for (let j = head[gy * cols + gx]; j !== -1; j = next[j]) {
              if (j === i) continue;
              const dx = x[j] - xi;
              const dy = y[j] - yi;
              const d2 = dx * dx + dy * dy;
              if (d2 > VIEW_RADIUS * VIEW_RADIUS) continue;
              n++;
              alignX += vx[j];
              alignY += vy[j];
              centerX += dx;
              centerY += dy;
              if (d2 < SEPARATION_RADIUS * SEPARATION_RADIUS && d2 > 0.01) {
                pushX -= dx / d2;
                pushY -= dy / d2;
              }
            }
          }
        }

        let ax = 0;
        let ay = 0;
        if (n > 0) {
          ax += (alignX / n - vx[i]) * 0.06 + (centerX / n) * 0.0035;
          ay += (alignY / n - vy[i]) * 0.06 + (centerY / n) * 0.0035;
        }
        ax += pushX * 1.4;
        ay += pushY * 1.4;

        const leader = leaders[i % leaders.length];
        const lx = leader.x - xi;
        const ly = leader.y - yi;
        const ld = Math.hypot(lx, ly) || 1;
        const pull = ld > LEADER_PULL_RADIUS ? 0.05 : 0.012;
        ax += (lx / ld) * pull;
        ay += (ly / ld) * pull;

        if (pointer.active) {
          const px = xi - pointer.x;
          const py = yi - pointer.y;
          const pd = Math.hypot(px, py);
          if (pd < POINTER_RADIUS && pd > 0.1) {
            const force = (1 - pd / POINTER_RADIUS) * 0.9;
            ax += (px / pd) * force;
            ay += (py / pd) * force;
          }
        }

        let nvx = vx[i] + ax * dt;
        let nvy = vy[i] + ay * dt;
        const speed = Math.hypot(nvx, nvy) || 1;
        const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
        nvx = (nvx / speed) * clamped;
        nvy = (nvy / speed) * clamped;
        vx[i] = nvx;
        vy[i] = nvy;
        x[i] = xi + nvx * dt;
        y[i] = yi + nvy * dt;
      }
    };

    const render = (trails: boolean) => {
      if (trails) {
        ctx.fillStyle = "rgba(9, 11, 15, 0.3)";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      ctx.lineCap = "round";
      ctx.lineWidth = 1.3;
      const near = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        const leader = leaders[i % leaders.length];
        near[i] = Math.abs(leader.x - x[i]) + Math.abs(leader.y - y[i]) < 120 ? 1 : 0;
      }
      for (const tint of [0, 1]) {
        ctx.strokeStyle = tint ? "rgba(34, 211, 238, 0.85)" : "rgba(205, 212, 222, 0.55)";
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          if (near[i] !== tint) continue;
          ctx.moveTo(x[i] - vx[i] * 2.6, y[i] - vy[i] * 2.6);
          ctx.lineTo(x[i], y[i]);
        }
        ctx.stroke();
      }

      for (const leader of leaders) {
        const glow = ctx.createRadialGradient(leader.x, leader.y, 0, leader.x, leader.y, 26);
        glow.addColorStop(0, "rgba(245, 158, 11, 0.55)");
        glow.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(leader.x, leader.y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(leader.x, leader.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let frame = 0;
    let last = 0;
    let running = false;
    let visible = true;

    const loop = (time: number) => {
      if (running) frame = requestAnimationFrame(loop);
      const dt = last ? Math.min(2, (time - last) / (1000 / 60)) : 1;
      last = time;
      step(dt);
      render(true);
    };

    const sync = () => {
      const shouldRun = !reduceMotion && visible && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      last = 0;
      if (running) frame = requestAnimationFrame(loop);
      else cancelAnimationFrame(frame);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const widthChanged = Math.abs(rect.width - width) > 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || count === 0) {
        seed();
        if (reduceMotion) {
          for (let s = 0; s < 240; s++) step(1);
        }
      }
      cols = Math.ceil(width / VIEW_RADIUS) + 1;
      rows = Math.ceil(height / VIEW_RADIUS) + 1;
      head = new Int32Array(cols * rows);
      render(false);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    };
    const onPointerEnd = () => {
      pointer.active = false;
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const screenObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    screenObserver.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerEnd);

    resize();
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      screenObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      document.documentElement.removeEventListener("pointerleave", onPointerEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
