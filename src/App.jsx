/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";

function formatDay(d) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
    new Date(d),
  );
}
function formatDate(d) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(new Date(d));
}

const WMO = {
  0: { label: "Clear Sky", bg: "sunny" },
  1: { label: "Mainly Clear", bg: "sunny" },
  2: { label: "Partly Cloudy", bg: "cloudy" },
  3: { label: "Overcast", bg: "cloudy" },
  45: { label: "Foggy", bg: "foggy" },
  48: { label: "Icy Fog", bg: "foggy" },
  51: { label: "Light Drizzle", bg: "rainy" },
  53: { label: "Drizzle", bg: "rainy" },
  55: { label: "Heavy Drizzle", bg: "rainy" },
  56: { label: "Freezing Drizzle", bg: "rainy" },
  57: { label: "Heavy Freezing Drizzle", bg: "rainy" },
  61: { label: "Light Rain", bg: "rainy" },
  63: { label: "Rain", bg: "rainy" },
  65: { label: "Heavy Rain", bg: "rainy" },
  66: { label: "Freezing Rain", bg: "rainy" },
  67: { label: "Heavy Freezing Rain", bg: "rainy" },
  71: { label: "Light Snow", bg: "snowy" },
  73: { label: "Snow", bg: "snowy" },
  75: { label: "Heavy Snow", bg: "snowy" },
  77: { label: "Snow Grains", bg: "snowy" },
  80: { label: "Light Showers", bg: "rainy" },
  81: { label: "Showers", bg: "rainy" },
  82: { label: "Heavy Showers", bg: "rainy" },
  85: { label: "Snow Showers", bg: "snowy" },
  86: { label: "Heavy Snow Showers", bg: "snowy" },
  95: { label: "Thunderstorm", bg: "stormy" },
  96: { label: "Thunderstorm w/ Hail", bg: "stormy" },
  99: { label: "Heavy Thunderstorm", bg: "stormy" },
};
function getWMO(c) {
  return WMO[c] || { label: "Unknown", bg: "sunny" };
}
function getIcon(c, big) {
  const s = big ? "text-7xl" : "text-2xl";
  if (c <= 1) return { e: "☀️", s };
  if (c === 2) return { e: "🌤", s };
  if (c === 3) return { e: "☁️", s };
  if (c === 45 || c === 48) return { e: "🌫", s };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c))
    return { e: "🌧", s };
  if ([71, 73, 75, 77, 85, 86].includes(c)) return { e: "❄️", s };
  if (c === 95) return { e: "🌩", s };
  if (c === 96 || c === 99) return { e: "⛈", s };
  return { e: "🌈", s };
}
function icon(c) {
  return getIcon(c).e;
}

const BGRAD = {
  sunny: "linear-gradient(175deg,#090f1a 0%,#112030 50%,#1c3346 100%)",
  cloudy: "linear-gradient(175deg,#1a2e44 0%,#2e4860 50%,#4a6278 100%)",
  rainy: "linear-gradient(175deg,#090f1a 0%,#112030 50%,#1c3346 100%)",
  snowy: "linear-gradient(175deg,#0d1720 0%,#1e3248 50%,#2e4d65 100%)",
  stormy: "linear-gradient(175deg,#060810 0%,#0e161f 50%,#131d27 100%)",
  foggy: "linear-gradient(175deg,#101520 0%,#1e2c3a 50%,#2e3e4e 100%)",
};

// ── Animations ────────────────────────────────────────────────────────────────
function RainCanvas() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const drops = Array.from({ length: 150 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      speed: 8 + Math.random() * 9,
      len: 14 + Math.random() * 16,
      op: 0.15 + Math.random() * 0.28,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1.5, d.y + d.len);
        ctx.strokeStyle = `rgba(180,220,255,${d.op})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > c.height) {
          d.y = -d.len;
          d.x = Math.random() * c.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={r}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
function SnowCanvas() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const fl = Array.from({ length: 100 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      rad: 1.5 + Math.random() * 3.5,
      speed: 0.8 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 0.4,
      op: 0.4 + Math.random() * 0.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      fl.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.op})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > c.height) {
          f.y = -f.rad * 2;
          f.x = Math.random() * c.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={r}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
function StormCanvas() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const drops = Array.from({ length: 130 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      speed: 11 + Math.random() * 12,
      len: 20 + Math.random() * 20,
      op: 0.2 + Math.random() * 0.28,
    }));
    let bt = 0,
      bolt = null,
      raf;
    const draw = (ts) => {
      ctx.clearRect(0, 0, c.width, c.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2.5, d.y + d.len);
        ctx.strokeStyle = `rgba(180,220,255,${d.op})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > c.height) {
          d.y = -d.len;
          d.x = Math.random() * c.width;
        }
      });
      if (ts - bt > 2000 + Math.random() * 2000) {
        bt = ts;
        bolt = { x: 80 + Math.random() * (c.width - 160), ttl: 14 };
      }
      if (bolt && bolt.ttl > 0) {
        ctx.save();
        ctx.globalAlpha = bolt.ttl / 14;
        ctx.strokeStyle = "#fffde7";
        ctx.shadowColor = "#ffd54f";
        ctx.shadowBlur = 24;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let bx = bolt.x,
          by = 0;
        ctx.moveTo(bx, by);
        for (let s = 0; s < 7; s++) {
          bx += (Math.random() - 0.5) * 36;
          by += c.height / 7;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
        ctx.restore();
        bolt.ttl--;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={r}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
function SunCanvas() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const sun = {
      x: c.width * 0.75,
      y: c.height * 0.18,
      r: Math.min(c.width, c.height) * 0.08,
    };
    const rays = Array.from({ length: 12 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 12,
      length: 80 + Math.random() * 40,
      width: 1.2 + Math.random() * 1.4,
      opacity: 0.12 + Math.random() * 0.08,
    }));
    const flares = Array.from({ length: 5 }, () => ({
      x: sun.x + (Math.random() - 0.5) * 140,
      y: sun.y + (Math.random() - 0.5) * 100,
      r: 18 + Math.random() * 28,
      opacity: 0.06 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
    }));
    let raf;
    const draw = (ts) => {
      ctx.clearRect(0, 0, c.width, c.height);
      rays.forEach((ray) => {
        const x2 = sun.x + Math.cos(ray.angle) * ray.length;
        const y2 = sun.y + Math.sin(ray.angle) * ray.length;
        ctx.strokeStyle = `rgba(255,235,150,${ray.opacity})`;
        ctx.lineWidth = ray.width;
        ctx.beginPath();
        ctx.moveTo(sun.x, sun.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,244,174,0.16)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,221,95,0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,210,85,0.95)";
      ctx.fill();
      flares.forEach((flare) => {
        const pulse = 0.5 + Math.sin(ts / 1200 + flare.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, flare.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,230,140,${flare.opacity * (0.5 + pulse * 0.5)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={r}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
function CloudCanvas() {
  const r = useRef(null);
  useEffect(() => {
    const c = r.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: (c.width / 6) * i,
      y: 30 + Math.random() * 80,
      w: 170 + Math.random() * 120,
      h: 55 + Math.random() * 30,
      speed: 0.12 + Math.random() * 0.16,
      op: 0.06 + Math.random() * 0.09,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      clouds.forEach((cl) => {
        ctx.save();
        ctx.globalAlpha = cl.op;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(cl.x, cl.y, cl.w / 2, cl.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        cl.x += cl.speed;
        if (cl.x - cl.w / 2 > c.width) cl.x = -cl.w / 2;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={r}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// glass tokens (inline style objects)
const G = {
  card: {
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(30px) saturate(1.5)",
    WebkitBackdropFilter: "blur(30px) saturate(1.5)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "18px",
  },
  sm: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
  },
  pill: {
    background: "rgba(255,255,255,0.09)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "99px",
  },
};

const TXT = {
  h1: {
    color: "#fff",
    fontSize: "80px",
    fontWeight: 100,
    lineHeight: 1,
    letterSpacing: "-.02em",
  },
  loc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "22px",
    fontWeight: 300,
    letterSpacing: ".01em",
  },
  cond: { color: "rgba(255,255,255,0.62)", fontSize: "18px", fontWeight: 300 },
  hl: { color: "rgba(255,255,255,0.45)", fontSize: "16px" },
  label: {
    color: "rgba(255,255,255,0.28)",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: ".13em",
  },
  muted: { color: "rgba(255,255,255,0.38)", fontSize: "12px" },
};

// ── Detail panel (tap a day) ──────────────────────────────────────────────────
function DetailPanel({ date, code, maxT, minT, windV, isToday, onClose }) {
  const feels = Math.round((maxT + minT) / 2 + 1);
  const hum = Math.round(40 + Math.abs(Math.sin(maxT * 7)) * 35);
  const uv =
    code <= 2
      ? Math.floor(Math.random() * 5 + 4)
      : Math.floor(Math.random() * 3);
  const vis = code >= 45 && code <= 48 ? 2 : code >= 51 ? 8 : 15;
  const pres = Math.round(992 + Math.random() * 18);
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = (new Date().getHours() + i) % 24;
    const temp = Math.round(
      minT + (maxT - minT) * Math.sin((i / 11 + 0.08) * Math.PI),
    );
    const label =
      i === 0
        ? "Now"
        : h === 0
          ? "12AM"
          : h < 12
            ? `${h}AM`
            : h === 12
              ? "12PM"
              : `${h - 12}PM`;
    return { label, temp, ic: (h >= 21 || h < 6) && i > 0 ? "🌙" : icon(code) };
  });
  const metrics = [
    {
      ic: "🌡",
      lb: "FEELS LIKE",
      v: `${feels}°`,
      sub: feels > maxT ? "Hotter than actual" : "Similar to actual",
    },
    {
      ic: "💨",
      lb: "WIND",
      v: `${windV} km/h`,
      sub: `Gusts ${Math.round(windV * 1.3)} km/h`,
    },
    {
      ic: "💧",
      lb: "HUMIDITY",
      v: `${hum}%`,
      sub: `Dew point ${Math.round(minT - 4)}°`,
    },
    {
      ic: "☀️",
      lb: "UV INDEX",
      v: String(uv),
      sub: uv < 3 ? "Low" : uv < 6 ? "Moderate" : "High",
    },
    {
      ic: "👁",
      lb: "VISIBILITY",
      v: `${vis} km`,
      sub: vis >= 10 ? "Clear view" : "Reduced",
    },
    { ic: "📊", lb: "PRESSURE", v: `${pres} hPa`, sub: "↓ Falling" },
    { ic: "🌅", lb: "SUNRISE", v: "5:42 AM", sub: "Dawn" },
    { ic: "🌇", lb: "SUNSET", v: "7:18 PM", sub: "Dusk" },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "0",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...G.card,
          width: "100%",
          maxWidth: "640px",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "28px 24px",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <p style={{ ...TXT.label, marginBottom: "6px" }}>
              {isToday ? "Today" : formatDate(date)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "52px" }}>{icon(code)}</span>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "44px",
                    fontWeight: 100,
                    lineHeight: 1,
                  }}
                >
                  {maxT}°
                  <span
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "26px",
                      marginLeft: "8px",
                    }}
                  >
                    / {minT}°
                  </span>
                </p>
                <p style={{ ...TXT.cond, fontSize: "15px" }}>
                  {getWMO(code).label}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.32)",
              padding: "4px",
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/* hourly strip */}
        <div style={{ ...G.sm, padding: "12px 14px", marginBottom: "14px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            {hours.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  minWidth: "42px",
                }}
              >
                <span style={{ ...TXT.muted, fontSize: "11px" }}>
                  {h.label}
                </span>
                <span style={{ fontSize: "18px" }}>{h.ic}</span>
                <span
                  style={{ color: "#fff", fontSize: "14px", fontWeight: 300 }}
                >
                  {h.temp}°
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* metrics 2-col */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {metrics.map((m) => (
            <div key={m.lb} style={{ ...G.sm, padding: "13px 14px" }}>
              <p
                style={{
                  ...TXT.label,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "6px",
                }}
              >
                <span>{m.ic}</span>
                {m.lb}
              </p>
              <p
                style={{
                  color: "#fff",
                  fontSize: "21px",
                  fontWeight: 200,
                  lineHeight: 1.1,
                }}
              >
                {m.v}
              </p>
              <p style={{ ...TXT.muted, marginTop: "3px" }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState("");
  const [dispLoc, setDispLoc] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selDay, setSelDay] = useState(null);

  const debounceRef = useRef(null);

  const fetchWeather = ({ lat, lon, tz = "auto", label }) => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${tz}` +
            `&daily=weathercode,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max` +
            `&forecast_days=10`,
        );

        const data = await res.json();

        setWeather(data.daily);
        if (label) setDispLoc(label);
      } catch (e) {
        setError(e.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce delay
  };
  useEffect(() => {
    if (query.length < 2) {
      setWeather(null);
      setError("");
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const gd = await (
          await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`,
          )
        ).json();

        if (!gd.results?.length) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          gd.results[0];

        fetchWeather({
          lat: latitude,
          lon: longitude,
          tz: timezone,
          label: `${name}, ${country_code}`,
        });
      } catch (e) {
        setError(e.message);
        setWeather(null);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Your Location",
        });
      },
      () => {
        fetchWeather({
          lat: 33.6844,
          lon: 73.0479,
          label: "Islamabad, PK",
        });
      },
    );
  }, []);

  const dates = weather?.time || [];
  const maxArr = weather?.temperature_2m_max || [];
  const minArr = weather?.temperature_2m_min || [];
  const codes = weather?.weathercode || [];
  const windArr = weather?.wind_speed_10m_max || [];
  const precipArr = weather?.precipitation_probability_max || [];

  const code0 = codes[0] ?? 0;
  const bgKey = getWMO(code0).bg;
  const bgGrad = BGRAD[bgKey] || BGRAD.sunny;
  const anim =
    bgKey === "rainy"
      ? "rain"
      : bgKey === "snowy"
        ? "snow"
        : bgKey === "stormy"
          ? "storm"
          : bgKey === "cloudy" || bgKey === "foggy"
            ? "cloud"
            : bgKey === "sunny"
              ? "sun"
              : null;

  const allMin = minArr.length ? Math.min(...minArr) : 0;
  const allMax = maxArr.length ? Math.max(...maxArr) : 1;
  const range = allMax - allMin || 1;
  const nowH = new Date().getHours();

  const hum = Math.round(42 + Math.abs(Math.sin((maxArr[0] || 20) * 7)) * 33);
  const uv = code0 <= 2 ? 8 : code0 <= 3 ? 5 : 2;
  const feels = Math.round(((maxArr[0] || 20) + (minArr[0] || 15)) / 2 + 1);
  const windVal = Math.round(windArr[0] || 0);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: bgGrad,
        fontFamily:
          "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
        transition: "background 1.6s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* animated weather layer */}
      {weather && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {anim === "rain" && <RainCanvas />}
          {anim === "snow" && <SnowCanvas />}
          {anim === "storm" && <StormCanvas />}
          {anim === "cloud" && <CloudCanvas />}
          {anim === "sun" && <SunCanvas />}
        </div>
      )}
      {/* ambient orbs */}
      <div
        style={{
          background:
            "radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)",
        }}
        className="absolute top-[-20%] left-[-10%] w-[65vw] h-[65vw] rounded-full pointer-events-none z-0"
      />
      <div
        style={{
          background:
            "radial-gradient(circle,rgba(60,120,255,0.12) 0%,transparent 70%)",
        }}
        className="absolute top-[-25%] left-[-15%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
      />

      {/* ── scrollable page ── */}
      <div className="relative z-10 h-full overflow-y-auto flex flex-col items-center">
        <div
          style={{
            width: "100%",
            padding: "0 16px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
          className="lg:max-w-5xl"
        >
          {/* ── HERO ── */}
          <div style={{ textAlign: "center", padding: "48px 0 20px" }}>
            {weather ? (
              <>
                <p style={{ ...TXT.loc, marginBottom: "2px" }}>{dispLoc}</p>
                <p style={{ ...TXT.h1, margin: "0 0 2px" }}>
                  {Math.round(maxArr[0])}°
                </p>
                <p style={{ ...TXT.cond, marginBottom: "4px" }}>
                  {getWMO(code0).label}
                </p>
                <p style={{ ...TXT.hl }}>
                  Highest: {Math.round(maxArr[0])}°&nbsp;&nbsp;Lowest:
                  {Math.round(minArr[0])}°
                </p>
              </>
            ) : (
              <>
                <div
                  style={{ fontSize: "56px", marginBottom: "10px" }}
                  className="flex items-center justify-center"
                >
                  <img src="/icon.png" alt="icon" className="w-10 h-10" />
                </div>
                <p style={{ color: "#fff", fontSize: "28px", fontWeight: 200 }}>
                  Weather
                </p>
                <p style={{ ...TXT.muted, marginTop: "6px", fontSize: "14px" }}>
                  Search any city below
                </p>
              </>
            )}
          </div>

          {/* ── SEARCH ── */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                ...G.pill,
                display: "flex",
                alignItems: "center",
                padding: "11px 20px",
                gap: "10px",
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
                <path d="m21 21-4.3-4.3" strokeWidth="1.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "15px",
                  fontFamily: "inherit",
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setWeather(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.28)",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {loading && (
              <p
                style={{ textAlign: "center", ...TXT.muted, marginTop: "6px" }}
              >
                Fetching weather…
              </p>
            )}
            {error && (
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,110,110,0.85)",
                  fontSize: "13px",
                  marginTop: "6px",
                }}
              >
                ⚠ {error}
              </p>
            )}
          </div>

          {weather && (
            <>
              {/* ── HOURLY STRIP ── */}
              <div
                style={{
                  ...G.card,
                  padding: "14px 16px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    ...TXT.label,
                    display: "flex",
                    alignItems: "center",
                    justifyItems: "center",
                    gap: "5px",
                    marginBottom: "10px",
                  }}
                  className=" border-b border-neutral-600"
                >
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path
                      d="M12 7v5l3 3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="mb-0.5 pb-0.5">
                    {getWMO(code0).label} conditions will continue today. Wind
                    gusts up to {Math.round(windVal * 1.25)} km/h.
                  </p>
                </div>
                <div className="flex gap-4 justify-between overflow-x-auto pb-0.5">
                  {Array.from({ length: 14 }, (_, i) => {
                    const h = (nowH + i) % 24;
                    const temp = Math.round(
                      minArr[0] +
                        (maxArr[0] - minArr[0]) *
                          Math.sin((i / 13 + 0.07) * Math.PI),
                    );
                    const label =
                      i === 0
                        ? "Now"
                        : h === 0
                          ? "12AM"
                          : h < 12
                            ? `${h}AM`
                            : h === 12
                              ? "12PM"
                              : `${h - 12}PM`;
                    const night = (h >= 21 || h < 6) && i > 0;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "5px",
                          minWidth: "42px",
                        }}
                      >
                        <span style={{ ...TXT.muted, fontSize: "11px" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: "16px" }}>
                          {night ? "🌙" : icon(code0)}
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: 300,
                          }}
                        >
                          {temp}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex lg:flex-row justify-between gap-2 flex-col-reverse">
                {/* ── 10-DAY FORECAST ── */}
                <div
                  style={{
                    ...G.card,
                    padding: "14px 16px",
                    marginBottom: "10px",
                  }}
                  className="w-full lg:max-w-xl"
                >
                  <p
                    style={{
                      ...TXT.label,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        strokeWidth="1.5"
                      />
                      <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" />
                    </svg>
                    10-day forecast
                  </p>
                  <div className="flex flex-col justify-between h-full pb-4">
                    {dates.map((date, i) => {
                      const bS = ((minArr[i] - allMin) / range) * 100;
                      const bE = ((maxArr[i] - allMin) / range) * 100;
                      const bW = bE - bS;
                      return (
                        <button
                          key={date}
                          onClick={() => setSelDay(i)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "10px",
                            transition: "background .14s",
                            color: "#fff",
                            borderBottom:
                              i < dates.length - 1
                                ? "1px solid rgba(255,255,255,0.05)"
                                : "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <span
                            style={{
                              color: "rgba(255,255,255,0.75)",
                              fontSize: "14px",
                              width: "42px",
                              textAlign: "left",
                              fontWeight: 300,
                              flexShrink: 0,
                            }}
                          >
                            {i === 0 ? "Today" : formatDay(date)}
                          </span>
                          <span
                            style={{
                              fontSize: "19px",
                              width: "24px",
                              textAlign: "center",
                              flexShrink: 0,
                            }}
                          >
                            {icon(codes[i])}
                          </span>
                          <span
                            style={{
                              color: "rgba(100,190,255,0.85)",
                              fontSize: "12px",
                              width: "32px",
                              textAlign: "right",
                              fontWeight: 300,
                              flexShrink: 0,
                            }}
                          >
                            {precipArr[i] > 15 ? `${precipArr[i]}%` : ""}
                          </span>
                          <span
                            style={{
                              color: "rgba(255,255,255,0.38)",
                              fontSize: "14px",
                              width: "28px",
                              textAlign: "right",
                              fontWeight: 300,
                              flexShrink: 0,
                            }}
                          >
                            {Math.round(minArr[i])}°
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "3px",
                              background: "rgba(255,255,255,0.10)",
                              borderRadius: "99px",
                              overflow: "hidden",
                              margin: "0 6px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                marginLeft: `${bS}%`,
                                width: `${bW}%`,
                                background:
                                  "linear-gradient(to right,#60a5fa,#fbbf24,#f97316)",
                                borderRadius: "99px",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "14px",
                              width: "28px",
                              textAlign: "right",
                              fontWeight: 300,
                              flexShrink: 0,
                            }}
                          >
                            {Math.round(maxArr[i])}°
                          </span>
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            stroke="rgba(255,255,255,0.18)"
                            viewBox="0 0 24 24"
                            style={{ flexShrink: 0 }}
                          >
                            <path
                              d="M9 18l6-6-6-6"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── TODAY'S METRICS (2-col grid, like the screenshot bottom tiles) ── */}
                <div className="grid grid-cols-2 gap-2.5 mb-2.5 sm:grid-cols-4 lg:grid-cols-2">
                  {/* UV Index */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                        <path
                          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      UV index
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "36px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "2px",
                      }}
                    >
                      {uv}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "14px",
                        fontWeight: 300,
                        marginBottom: "10px",
                      }}
                    >
                      {uv >= 8
                        ? "Very High"
                        : uv >= 6
                          ? "High"
                          : uv >= 3
                            ? "Moderate"
                            : "Low"}
                    </p>
                    {/* uv bar */}
                    <div
                      style={{
                        height: "5px",
                        borderRadius: "99px",
                        overflow: "hidden",
                        background:
                          "linear-gradient(to right,#4ade80,#facc15,#f97316,#ef4444,#a855f7)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(uv / 11) * 100}%`,
                          background: "transparent",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "-3px",
                            width: "11px",
                            height: "11px",
                            borderRadius: "50%",
                            background: "#fff",
                            boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                          }}
                        />
                      </div>
                    </div>
                    <p style={{ ...TXT.muted, marginTop: "8px" }}>
                      {uv < 3 ? "Low for the day" : "Wear SPF 50+"}
                    </p>
                  </div>

                  {/* Sunset */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2v1M4.22 4.22l.7.7M2 12h1M4.22 19.78l.7-.7M12 22v-1M19.78 19.78l-.7-.7M22 12h-1M19.78 4.22l-.7.7"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path d="M17 12a5 5 0 1 1-10 0" strokeWidth="1.5" />
                        <path
                          d="M3 16h18"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Sunset
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "6px",
                      }}
                    >
                      7:18 PM
                    </p>
                    {/* arc */}
                    <div
                      style={{
                        position: "relative",
                        height: "44px",
                        marginBottom: "4px",
                      }}
                    >
                      <svg viewBox="0 0 120 50" width="100%" height="44">
                        <path
                          d="M10 44 Q60 4 110 44"
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx="97"
                          cy="18"
                          r="5"
                          fill="#fbbf24"
                          opacity=".9"
                        />
                      </svg>
                    </div>
                    <p style={{ ...TXT.muted }}>Sunrise: 5:42 AM</p>
                  </div>

                  {/* Wind */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Wind
                    </p>
                    {/* compass */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "70px",
                          height: "70px",
                        }}
                      >
                        <svg viewBox="0 0 70 70" width="70" height="70">
                          <circle
                            cx="35"
                            cy="35"
                            r="32"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1.5"
                          />
                          {["N", "E", "S", "W"].map((l, i) => {
                            const a = i * 90 - 90;
                            const x = 35 + 28 * Math.cos((a * Math.PI) / 180);
                            const y = 35 + 28 * Math.sin((a * Math.PI) / 180);
                            return (
                              <text
                                key={l}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="rgba(255,255,255,0.35)"
                                fontSize="9"
                                fontFamily="-apple-system"
                              >
                                {l}
                              </text>
                            );
                          })}
                          {/* arrow */}
                          <line
                            x1="35"
                            y1="35"
                            x2="35"
                            y2="14"
                            stroke="rgba(255,255,255,0.7)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="35"
                            cy="35"
                            r="3"
                            fill="rgba(255,255,255,0.5)"
                          />
                        </svg>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            paddingTop: "2px",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 300,
                              marginTop: "16px",
                            }}
                          >
                            {windVal}
                          </span>
                          <span style={{ ...TXT.muted, fontSize: "10px" }}>
                            km/h
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ ...TXT.muted, textAlign: "center" }}>
                      Gusts {Math.round(windVal * 1.3)} km/h ESE
                    </p>
                  </div>

                  {/* Precipitation */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z"
                          strokeWidth="1.5"
                        />
                      </svg>
                      Precipitation
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "32px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "2px",
                      }}
                    >
                      {precipArr[0] || 0} mm
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "14px",
                        fontWeight: 300,
                        marginBottom: "8px",
                      }}
                    >
                      Today
                    </p>
                    <p style={{ ...TXT.muted }}>
                      Next expected{" "}
                      {precipArr.slice(1).findIndex((p) => p > 20) >= 0
                        ? `${precipArr[0]}% chance`
                        : "< 1 mm Wed."}
                    </p>
                  </div>

                  {/* Feels like */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
                          strokeWidth="1.5"
                        />
                      </svg>
                      Feels like
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "36px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "4px",
                      }}
                    >
                      {feels}°
                    </p>
                    <p style={{ ...TXT.muted }}>
                      {feels > Math.round(maxArr[0])
                        ? "Feels hotter than actual."
                        : feels < Math.round(minArr[0])
                          ? "Feels cooler."
                          : "Similar to the actual temperature."}
                    </p>
                  </div>

                  {/* Humidity */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z"
                          strokeWidth="1.5"
                        />
                      </svg>
                      Humidity
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "36px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "6px",
                      }}
                    >
                      {hum}%
                    </p>
                    <div
                      style={{
                        height: "3px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "99px",
                        overflow: "hidden",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${hum}%`,
                          background:
                            "linear-gradient(to right,#60a5fa,#38bdf8)",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                    <p style={{ ...TXT.muted }}>
                      Dew point {Math.round(minArr[0] - 4)}°
                    </p>
                  </div>

                  {/* Visibility */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          strokeWidth="1.5"
                        />
                        <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                      </svg>
                      Visibility
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "36px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "4px",
                      }}
                    >
                      {code0 >= 45 && code0 <= 48 ? 2 : code0 >= 51 ? 8 : 15} km
                    </p>
                    <p style={{ ...TXT.muted }}>
                      {code0 >= 45
                        ? "Reduced visibility"
                        : code0 >= 51
                          ? "Good"
                          : "Clear view."}
                    </p>
                  </div>

                  {/* Pressure */}
                  <div style={{ ...G.card, padding: "16px" }}>
                    <p
                      style={{
                        ...TXT.label,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path
                          d="M12 8v4l3 3"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Pressure
                    </p>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "32px",
                        fontWeight: 100,
                        lineHeight: 1,
                        marginBottom: "2px",
                      }}
                    >
                      995
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "13px",
                        marginBottom: "8px",
                      }}
                    >
                      hPa
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ ...TXT.muted }}>Low</span>
                      <span style={{ ...TXT.muted }}>High</span>
                    </div>
                    <div
                      style={{
                        height: "3px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "99px",
                        overflow: "hidden",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: "48%",
                          marginLeft: "26%",
                          background:
                            "linear-gradient(to right,#60a5fa,#a78bfa)",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      {selDay !== null && weather && (
        <DetailPanel
          date={dates[selDay]}
          code={codes[selDay]}
          maxT={Math.round(maxArr[selDay])}
          minT={Math.round(minArr[selDay])}
          windV={Math.round(windArr[selDay])}
          isToday={selDay === 0}
          onClose={() => setSelDay(null)}
        />
      )}

      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
        input::placeholder{color:rgba(255,255,255,0.24);}
      `}</style>
    </div>
  );
}
