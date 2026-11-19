/* eslint-disable react/prop-types */
import { clockLabel, speedLabel, toWind } from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

const X_POSITIONS = [50, 150, 250, 350];

function minutesFromISO(iso) {
  if (!iso) return null;
  const [h, m] = String(iso).slice(11, 16).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Minimal semicircular sun trajectory with a peach fill and position markers. */
const VB_W = 320;
const VB_H = 118;
const CX = 160;
const BASE = 104;
const RX = 136;
const RY = 76;

const clamp01 = (n) => Math.min(Math.max(n, 0), 1);

// t = 0 at sunrise, 1 at sunset
const pointAt = (t) => {
  const a = Math.PI * (1 - clamp01(t));
  return { x: CX + RX * Math.cos(a), y: BASE - RY * Math.sin(a) };
};

const ARC = `M${CX - RX} ${BASE} A${RX} ${RY} 0 0 1 ${CX + RX} ${BASE}`;
const MARKERS = [pointAt(0), pointAt(0.5), pointAt(1)];

const pad = (n) => String(n).padStart(2, "0");

export function SunPath({ sunrise, sunset, now = new Date() }) {
  const rise = minutesFromISO(sunrise);
  const set = minutesFromISO(sunset);
  const hasTimes = rise != null && set != null && set > rise;
  const mid = hasTimes ? Math.round((rise + set) / 2) : 720;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const rawProgress = hasTimes ? (nowMin - rise) / (set - rise) : 0.5;
  const isDaytime = rawProgress >= 0 && rawProgress <= 1;
  const sun = pointAt(rawProgress);

  return (
    <div className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Sun path for today"
      >
        <path d={`${ARC} Z`} fill="#FFE0D0" opacity="0.42" />

        <path
          d={ARC}
          fill="none"
          stroke="#FF8129"
          strokeWidth="2"
          strokeDasharray="3 7"
          strokeLinecap="round"
          opacity="0.8"
        />

        <line
          x1="16"
          y1={BASE}
          x2="304"
          y2={BASE}
          stroke="#FF8129"
          strokeWidth="2"
          opacity="0.72"
        />

        {MARKERS.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill="#fff"
              stroke="#FF8129"
              strokeWidth="2"
            />
            <circle cx={p.x} cy={p.y} r="2.8" fill="#FF8129" />
          </g>
        ))}

        <g
          transform={`translate(${sun.x} ${sun.y})`}
          opacity={isDaytime ? 1 : 0.45}
        >
          <circle r="12" fill="#FFE0D0" opacity="0.9" />
          <circle r="7" fill="#FF8129" />
          <g stroke="#FF8129" strokeWidth="1.5" strokeLinecap="round">
            <path d="M0-16v-4M0 16v4M-16 0h-4M16 0h4M-11-11l-3-3M11-11l3-3M-11 11l-3 3M11 11l3 3" />
          </g>
        </g>
      </svg>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-brand-muted">Sunrise</span>
          <strong className="text-xs font-bold">{clockLabel(sunrise)}</strong>
        </div>

        {hasTimes && (
          <span className="text-center text-[10px] text-brand-muted">
            Daylight peak {pad(Math.floor(mid / 60))}:{pad(mid % 60)}
          </span>
        )}

        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[10px] text-brand-muted">Sunset</span>
          <strong className="text-xs font-bold">{clockLabel(sunset)}</strong>
        </div>
      </div>
    </div>
  );
}

function smoothPath(points) {
  if (!points.length) return "";
  return points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const mid = (prev.x + point.x) / 2;
    return `${path} C ${mid} ${prev.y}, ${mid} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function readValue(slot, mode, unit) {
  if (mode === "rain") return slot.pop ?? 0;
  if (mode === "wind") return toWind(slot.wind, unit) ?? 0;
  return slot.temp ?? 0;
}

function displayValue(slot, mode, unit) {
  if (mode === "rain") return `${slot.pop ?? "--"}%`;
  if (mode === "wind") {
    const wind = toWind(slot.wind, unit);
    return wind == null ? "--" : `${wind} ${speedLabel(unit)}`;
  }
  return slot.temp == null ? "--" : `${slot.temp}°`;
}

/** Custom Bézier chart — no bars, no visible axes, HTML labels. */
export function TemperatureChart({ slots, mode = "temperature", unit = "C" }) {
  if (!slots.length) return null;

  const values = slots.map((slot) => readValue(slot, mode, unit));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const low = min - span * 0.28;
  const high = max + span * 0.28;

  const yFor = (value) => 112 - ((value - low) / (high - low)) * 86;
  const points = values.map((value, i) => ({
    x: X_POSITIONS[i],
    y: yFor(value),
  }));
  const comparison = values.map((value, i) => ({
    x: X_POSITIONS[i],
    y: yFor(value + (i % 2 === 0 ? -span * 0.22 : span * 0.2)),
  }));

  return (
    <div
      className="relative mt-10 w-full min-w-0"
      aria-label={`${mode} chart for four parts of the day`}
    >
      {/* Chart area */}
      <div className="relative h-[190px] w-full min-w-0">
        {/* Vertical separators */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-center">
              {i !== 0 && <span className="h-full w-px bg-brand-navy/[0.08]" />}
            </div>
          ))}
        </div>

        {/* Temperature curves */}
        <svg
          className="absolute inset-0 block h-full w-full overflow-visible"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="chart-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFB066" />
              <stop offset="50%" stopColor="#FF8129" />
              <stop offset="100%" stopColor="#FFB066" />
            </linearGradient>

            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8129" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#FF8129" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Comparison line */}
          <path
            d={smoothPath(comparison)}
            fill="none"
            stroke="#DCE0E5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Area below curve */}
          <path
            d={`${smoothPath(points)} L 350 145 L 50 145 Z`}
            fill="url(#chart-fill)"
          />

          {/* Main curve */}
          <path
            d={smoothPath(points)}
            fill="none"
            stroke="url(#chart-stroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Temperature dots */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill={index === 1 ? "#1C2B45" : "#FF8129"}
              />
            </g>
          ))}
        </svg>

        {/* Weather icon badges */}
        {slots.map((slot, index) => {
          const point = points[index];
          const iconTop = Math.max(8, point.y - 63);

          return (
            <div
              key={slot.label}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{
                left: `${(point.x / 400) * 100}%`,
                top: `${(iconTop / 150) * 100}%`,
              }}
            >
              <div
                className={`grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full border transition-colors ${
                  index === 1
                    ? "border-brand-navy bg-brand-navy text-brand-orange shadow-[0_12px_25px_rgba(28,43,69,0.12)]"
                    : "border-brand-navy/10 bg-white text-brand-sky shadow-[0_5px_18px_rgba(28,43,69,0.04)]"
                }`}
              >
                <WeatherIcon
                  code={slot.code}
                  isDay={slot.label !== "Night"}
                  className="size-6 sm:size-8"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Temperature labels */}
      <div className="grid w-full grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.label}
            className="flex min-w-0 flex-col items-center gap-1.5 py-2 text-center"
          >
            <strong className="text-[20px] font-bold tracking-[-0.04em] text-brand-text">
              {displayValue(slot, mode, unit)}
            </strong>

            <span className="text-[13px] font-medium text-brand-muted">
              {slot.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
