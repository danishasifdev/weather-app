/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/** Clouds are blurred once into a sprite, then reused every frame. */
function makeCloudSprite(top, bottom) {
  const c = document.createElement("canvas");
  c.width = 260;
  c.height = 120;
  const x = c.getContext("2d");
  const grad = x.createLinearGradient(0, 6, 0, 105);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  x.fillStyle = grad;
  x.filter = "blur(7px)";
  [
    [70, 70, 34],
    [125, 45, 48],
    [185, 66, 38],
    [225, 84, 25],
    [35, 86, 24],
  ].forEach(([cx, cy, r]) => {
    x.beginPath();
    x.ellipse(cx, cy, r, r * 0.55, 0, 0, TAU);
    x.fill();
  });
  x.filter = "none";
  return c;
}

function drawRidges(ctx, w, h, isDay, category) {
  const dark = category === "storm" || category === "rain";
  const layers = [
    { y: 0.8, amp: 0.075, step: 220, color: isDay ? "rgba(127,201,208,.30)" : "rgba(3,8,18,.6)", seed: 1.3 },
    { y: 0.9, amp: 0.05, step: 155, color: isDay ? "rgba(127,201,208,.42)" : "rgba(2,5,12,.8)", seed: 3.7 },
  ];
  if (dark) layers.forEach((l) => (l.color = isDay ? "rgba(90,120,140,.35)" : "rgba(2,5,12,.8)"));

  layers.forEach((layer) => {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let px = 0; px <= w + layer.step; px += layer.step) {
      const peak = h * layer.y - h * layer.amp * (0.25 + 0.75 * Math.abs(Math.sin(px * 0.0055 + layer.seed)));
      ctx.lineTo(px, peak);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
  });
}

/** Layered, condition-aware atmosphere — capped at ~35fps for smooth scrolling. */
export default function WeatherBackdrop({ category = "clear", isDay = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const sprites = {
      light: makeCloudSprite("rgba(255,255,255,.78)", "rgba(176,196,220,.85)"),
      grey: makeCloudSprite("rgba(215,226,238,.7)", "rgba(110,132,158,.8)"),
      dark: makeCloudSprite("rgba(78,92,116,.95)", "rgba(20,28,42,.98)"),
    };

    let w = 0;
    let h = 0;
    let raf = 0;
    let lastFrame = -100;
    let clouds = [];
    let drops = [];
    let flakes = [];
    let splashes = [];
    let stars = [];
    let bolt = null;
    let flash = 0;
    let nextBolt = 0;

    function createScene() {
      const count =
        category === "storm" ? 8 : category === "cloudy" ? 9 : category === "fog" ? 7 : category === "partly" ? 4 : 2;
      const sprite =
        category === "storm" || category === "rain"
          ? sprites.dark
          : category === "cloudy" || category === "fog"
            ? sprites.grey
            : sprites.light;
      const high = category === "storm" || category === "rain";

      clouds = Array.from({ length: count }, (_, i) => ({
        x: rand(-w * 0.15, w * 1.05),
        y: high ? rand(h * 0.02, h * 0.3) : rand(h * 0.06, h * 0.42),
        scale: rand(0.7, category === "cloudy" ? 2.2 : 1.7),
        speed: rand(0.06, 0.24) * (i % 2 ? 1 : -1),
        alpha: rand(high ? 0.6 : 0.3, high ? 0.95 : 0.6),
        sprite,
      }));

      drops = Array.from({ length: category === "storm" ? 170 : 120 }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        len: rand(10, 28),
        speed: rand(8, 17),
        opacity: rand(0.12, 0.42),
        near: Math.random() > 0.6,
      }));

      flakes = Array.from({ length: 85 }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.8, 3),
        speed: rand(0.4, 1.6),
        drift: rand(-0.5, 0.5),
        opacity: rand(0.35, 0.9),
        phase: rand(0, TAU),
      }));

      stars = Array.from({ length: 100 }, () => ({
        x: rand(0, w),
        y: rand(0, h * 0.72),
        r: rand(0.3, 1.3),
        opacity: rand(0.2, 0.9),
        phase: rand(0, TAU),
      }));
      splashes = [];
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createScene();
      if (reducedMotion) draw(0);
    }

    function drawSky(ts) {
      if (isDay) {
        const x = w * 0.78;
        const y = h * 0.17;
        const r = Math.min(w, h) * 0.043;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 8);
        glow.addColorStop(0, "rgba(255,226,150,.3)");
        glow.addColorStop(0.4, "rgba(255,196,110,.11)");
        glow.addColorStop(1, "rgba(255,200,120,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - r * 8, y - r * 8, r * 16, r * 16);

        ctx.strokeStyle = "rgba(255,238,190,.32)";
        for (let i = 0; i < 12; i += 1) {
          const a = (i * Math.PI) / 6 + ts / 140000;
          const inner = r * 1.6;
          const outer = r * (3 + Math.sin(ts / 2200 + i) * 0.2);
          ctx.lineWidth = i % 3 === 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
          ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
          ctx.stroke();
        }

        const disc = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
        disc.addColorStop(0, "#fffdf0");
        disc.addColorStop(0.55, "#ffe9a8");
        disc.addColorStop(1, "#f5b942");
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = disc;
        ctx.fill();
      } else {
        const x = w * 0.79;
        const y = h * 0.16;
        const r = Math.min(w, h) * 0.03;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
        glow.addColorStop(0, "rgba(210,225,255,.18)");
        glow.addColorStop(1, "rgba(210,225,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = "rgba(241,245,249,.95)";
        ctx.fill();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x + r * 0.45, y - r * 0.22, r * 0.95, 0, TAU);
        ctx.fill();
        ctx.restore();

        stars.forEach((s) => {
          const twinkle = 0.55 + Math.sin(ts / 800 + s.phase) * 0.45;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, TAU);
          ctx.fillStyle = `rgba(226,238,255,${s.opacity * twinkle})`;
          ctx.fill();
        });
      }
    }

    function drawClouds(ts) {
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.speed > 0 && c.x - 130 * c.scale > w) c.x = -140 * c.scale;
        if (c.speed < 0 && c.x + 140 * c.scale < 0) c.x = w + 130 * c.scale;
        const breathe = 1 + Math.sin(ts / 4500 + c.y) * 0.03;
        ctx.globalAlpha = c.alpha;
        ctx.drawImage(
          c.sprite,
          c.x - 130 * c.scale,
          c.y - 60 * c.scale * breathe,
          260 * c.scale,
          120 * c.scale * breathe,
        );
      });
      ctx.globalAlpha = 1;
    }

    function drawRain() {
      ctx.lineCap = "round";
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.16, d.y + d.len);
        ctx.strokeStyle = isDay ? `rgba(60,130,150,${d.opacity + 0.08})` : `rgba(190,222,255,${d.opacity})`;
        ctx.lineWidth = d.near ? 1.4 : 0.8;
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.speed * 0.16;
        if (d.y > h) {
          if (d.near && Math.random() > 0.65) splashes.push({ x: d.x, y: h - rand(2, 24), ttl: 12 });
          d.y = -d.len;
          d.x = rand(0, w + 60);
        }
      });
      splashes = splashes.filter((s) => s.ttl > 0);
      splashes.forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, (12 - s.ttl) * 1.5, (12 - s.ttl) * 0.35, 0, 0, TAU);
        ctx.strokeStyle = isDay ? `rgba(60,130,150,${(s.ttl / 12) * 0.22})` : `rgba(190,222,255,${(s.ttl / 12) * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        s.ttl -= 1;
      });
    }

    function drawSnow(ts) {
      flakes.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, TAU);
        ctx.fillStyle = isDay ? `rgba(120,170,190,${f.opacity})` : `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift + Math.sin(ts / 1600 + f.phase) * 0.3;
        if (f.y > h + 6) {
          f.y = -6;
          f.x = rand(0, w);
        }
      });
    }

    function drawFog(ts) {
      for (let i = 0; i < 6; i += 1) {
        const y = h * (0.3 + i * 0.12) + Math.sin(ts / 3200 + i) * 7;
        const grad = ctx.createLinearGradient(0, y - 35, 0, y + 35);
        grad.addColorStop(0, "rgba(220,230,240,0)");
        grad.addColorStop(0.5, `rgba(220,230,240,${0.045 + i * 0.008})`);
        grad.addColorStop(1, "rgba(220,230,240,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - 35, w, 70);
      }
    }

    function drawLightning(ts) {
      if (category !== "storm") return;
      if (ts - nextBolt > rand(3500, 7000)) {
        nextBolt = ts;
        bolt = { x: rand(w * 0.2, w * 0.8), ttl: 14 };
        flash = 8;
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(226,235,255,${(flash / 8) * 0.09})`;
        ctx.fillRect(0, 0, w, h);
        flash -= 1;
      }
      if (bolt && bolt.ttl > 0) {
        ctx.save();
        ctx.globalAlpha = bolt.ttl / 14;
        ctx.strokeStyle = "#fff9dc";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        let x = bolt.x;
        let y = 0;
        ctx.moveTo(x, y);
        for (let i = 0; i < 7; i += 1) {
          x += rand(-26, 26);
          y += h / 7;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
        bolt.ttl -= 1;
      }
    }

    function draw(ts) {
      if (!reducedMotion) raf = requestAnimationFrame(draw);
      if (ts - lastFrame < 28) return;
      lastFrame = ts;

      ctx.clearRect(0, 0, w, h);
      if (category === "clear" || category === "partly" || category === "cloudy" || category === "fog") {
        drawSky(ts);
      }
      drawClouds(ts);
      drawRidges(ctx, w, h, isDay, category);
      if (category === "rain" || category === "storm") {
        drawRain();
        drawLightning(ts);
      } else if (category === "snow") {
        drawSnow(ts);
      } else if (category === "fog") {
        drawFog(ts);
      }

      const haze = ctx.createLinearGradient(0, h * 0.6, 0, h);
      haze.addColorStop(0, "rgba(0,0,0,0)");
      haze.addColorStop(1, isDay ? "rgba(255,255,255,.12)" : "rgba(2,5,12,.32)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [category, isDay]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
