"use client";

import { useEffect, useRef } from "react";

type Obstacle = {
  x: number;
  w: number;
  h: number;
  kind: "block" | "tall" | "low";
};

type Game = {
  running: boolean;
  started: boolean;
  dead: boolean;
  speed: number;
  distance: number;
  score: number;
  high: number;
  catY: number;
  vel: number;
  onGround: boolean;
  frame: number;
  nextSpawn: number;
  obstacles: Obstacle[];
};

const GROUND = 0.78;
const GRAVITY = 0.75;
const JUMP = -13.5;
const CAT_W = 54;
const CAT_H = 36;

function pad(n: number) {
  return String(Math.floor(n)).padStart(5, "0");
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function ear(
  ctx: CanvasRenderingContext2D,
  tipX: number,
  tipY: number,
  leftX: number,
  leftY: number,
  rightX: number,
  rightY: number,
) {
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();
  ctx.fill();
}

function drawCat(
  ctx: CanvasRenderingContext2D,
  x: number,
  feetY: number,
  frame: number,
  jumping: boolean,
) {
  const y = feetY - CAT_H;
  const run = jumping ? 0 : Math.floor(frame / 5) % 2;
  const tailSwing = jumping ? -8 : run === 0 ? -4 : 6;

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 16);
  ctx.quadraticCurveTo(x - 8, y + 10 + tailSwing, x + 6, y + 22);
  ctx.lineTo(x + 12, y + 20);
  ctx.closePath();
  ctx.fill();

  ellipse(ctx, x + 22, y + 18, 16, 10);

  const hx = x + 38;
  const hy = y + 10;
  ear(ctx, hx - 4, hy - 16, hx - 9, hy - 2, hx, hy - 4);
  ear(ctx, hx + 10, hy - 16, hx + 2, hy - 4, hx + 14, hy - 1);
  ellipse(ctx, hx + 2, hy, 11, 10);

  ctx.fillStyle = "#f4f4f4";
  ear(ctx, hx - 3, hy - 12, hx - 6, hy - 3, hx - 1, hy - 5);
  ear(ctx, hx + 9, hy - 12, hx + 3, hy - 5, hx + 11, hy - 2);
  ellipse(ctx, hx + 5, hy - 1, 3.2, 3.4);

  ctx.fillStyle = "#111111";
  ellipse(ctx, hx + 6, hy - 1, 1.5, 2);

  ctx.fillStyle = "#f4f4f4";
  ellipse(ctx, hx + 6.4, hy - 2.1, 0.6, 0.7);

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(hx + 11, hy + 2);
  ctx.lineTo(hx + 8, hy + 5);
  ctx.lineTo(hx + 12, hy + 5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hx + 10, hy + 4);
  ctx.lineTo(hx + 20, hy + 1);
  ctx.moveTo(hx + 10, hy + 6);
  ctx.lineTo(hx + 19, hy + 7);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(hx + 8, hy + 6, 3, 0.1 * Math.PI, 0.7 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#111111";
  if (jumping) {
    ctx.fillRect(x + 12, y + 24, 7, 10);
    ctx.fillRect(x + 26, y + 22, 7, 12);
  } else if (run === 0) {
    ctx.fillRect(x + 12, y + 26, 7, 10);
    ctx.fillRect(x + 28, y + 28, 7, 8);
  } else {
    ctx.fillRect(x + 14, y + 28, 7, 8);
    ctx.fillRect(x + 26, y + 26, 7, 10);
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  groundY: number,
) {
  ctx.fillStyle = "#000000";
  const top = groundY - o.h;
  if (o.kind === "tall") {
    ctx.fillRect(o.x, top, o.w, o.h);
    ctx.fillRect(o.x - 4, top + 8, 6, 10);
    ctx.fillRect(o.x + o.w - 2, top + 14, 6, 10);
  } else if (o.kind === "low") {
    ctx.fillRect(o.x, top, o.w, o.h);
    ctx.fillRect(o.x + 6, top - 8, 8, 8);
  } else {
    ctx.fillRect(o.x, top, o.w, o.h);
    ctx.fillRect(o.x + o.w * 0.35, top - 10, o.w * 0.3, 10);
  }
}

function spawn(width: number): Obstacle {
  const roll = Math.random();
  if (roll < 0.35) {
    return { x: width + 20, w: 18, h: 48, kind: "tall" };
  }
  if (roll < 0.6) {
    return { x: width + 20, w: 36, h: 22, kind: "low" };
  }
  return { x: width + 20, w: 22 + Math.random() * 16, h: 32, kind: "block" };
}

function hits(catX: number, catY: number, o: Obstacle, groundY: number) {
  const catTop = catY - CAT_H + 4;
  const catLeft = catX + 4;
  const catRight = catX + CAT_W - 6;
  const catBottom = catY - 1;
  const oLeft = o.x + 2;
  const oRight = o.x + o.w - 2;
  const oTop = groundY - o.h;
  const oBottom = groundY;
  return catRight > oLeft && catLeft < oRight && catBottom > oTop && catTop < oBottom;
}

export function CatGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const draw = canvasEl.getContext("2d");
    if (!draw) return;
    const canvas = canvasEl;
    const ctx = draw;

    let high = 0;
    try {
      high = Number(localStorage.getItem("baie-cat-high") || "0");
    } catch {
      high = 0;
    }

    const g: Game = {
      running: false,
      started: false,
      dead: false,
      speed: 6,
      distance: 0,
      score: 0,
      high,
      catY: 0,
      vel: 0,
      onGround: true,
      frame: 0,
      nextSpawn: 90,
      obstacles: [],
    };
    gameRef.current = g;

    let raf = 0;
    let width = 0;
    let height = 0;
    let groundY = 0;
    const catX = 72;

    function resize() {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = w;
      height = Math.max(h, 320);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      groundY = height * GROUND;
      if (g.onGround) g.catY = groundY;
    }

    function reset() {
      g.running = true;
      g.started = true;
      g.dead = false;
      g.speed = 6;
      g.distance = 0;
      g.score = 0;
      g.catY = groundY;
      g.vel = 0;
      g.onGround = true;
      g.frame = 0;
      g.nextSpawn = 80;
      g.obstacles = [];
    }

    function jump() {
      if (!g.started || g.dead) {
        reset();
        return;
      }
      if (g.onGround) {
        g.vel = JUMP;
        g.onGround = false;
      }
    }

    function tick() {
      g.frame += 1;
      if (g.running) {
        g.vel += GRAVITY;
        g.catY += g.vel;
        if (g.catY >= groundY) {
          g.catY = groundY;
          g.vel = 0;
          g.onGround = true;
        }
        g.speed = Math.min(14, 6 + g.distance / 1800);
        g.distance += g.speed;
        g.score = Math.floor(g.distance / 10);
        g.nextSpawn -= 1;
        if (g.nextSpawn <= 0) {
          g.obstacles.push(spawn(width));
          g.nextSpawn = 55 + Math.random() * 70 - g.speed * 1.5;
        }
        for (const o of g.obstacles) o.x -= g.speed;
        g.obstacles = g.obstacles.filter((o) => o.x + o.w > -20);
        for (const o of g.obstacles) {
          if (hits(catX, g.catY, o, groundY)) {
            g.running = false;
            g.dead = true;
            if (g.score > g.high) {
              g.high = g.score;
              try {
                localStorage.setItem("baie-cat-high", String(g.high));
              } catch {
                /* ignore */
              }
            }
          }
        }
      }

      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      const dash = (g.distance * 0.4) % 28;
      ctx.fillStyle = "#111";
      for (let x = -dash; x < width; x += 28) {
        ctx.fillRect(x, groundY + 6, 14, 2);
      }

      for (const o of g.obstacles) drawObstacle(ctx, o, groundY);
      drawCat(ctx, catX, g.catY, g.frame, !g.onGround);

      ctx.fillStyle = "#111";
      ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`HI ${pad(g.high)}  ${pad(g.score)}`, width - 24, 36);

      ctx.textAlign = "left";
      ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
      if (!g.started) {
        ctx.fillText("CAT RUN", 24, 36);
        ctx.fillText("Tap or press space", 24, height - 28);
      } else if (g.dead) {
        ctx.textAlign = "center";
        ctx.font = "18px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("GAME OVER", width / 2, groundY - 80);
        ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Tap or space to retry", width / 2, groundY - 56);
      }

      raf = requestAnimationFrame(tick);
    }

    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", jump);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", jump);
    };
  }, []);

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#f4f4f4]">
      <canvas
        ref={canvasRef}
        className="block h-[100dvh] w-full touch-none"
        aria-label="Cat runner game. Tap or press space to jump."
      />
    </main>
  );
}
