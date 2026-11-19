/* eslint-disable react/prop-types */
import { useId } from "react";

/* -------------------------------------------------------------------------- */
/*  Shared primitives                                                         */
/* -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;

const CLOUD_PATH =
  "M20 100C-2 100-4 66 22 62C20 38 48 26 68 40C76 14 118 6 138 30C158 16 196 26 198 54C226 50 242 76 222 96C218 99 214 100 208 100Z";

/** Unique, CSS safe scope id. Used for gradient ids, class names and keyframes. */
function useScope(prefix) {
  return `${prefix}${useId().replace(/:/g, "")}`;
}

/** Drift keyframes plus a single reduced motion rule that covers the whole svg. */
const baseCss = (p) => `
.${p}-d1{animation:${p}-drift 30s ease-in-out infinite alternate}
.${p}-d2{animation:${p}-drift 42s ease-in-out infinite alternate-reverse}
@keyframes ${p}-drift{from{transform:translateX(-14px)}to{transform:translateX(18px)}}
@media (prefers-reduced-motion:reduce){.${p} *{animation:none!important}}
`;

function CloudDefs({ ids, top, bottom, shade }) {
  return (
    <>
      <linearGradient id={ids.cloud} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={top} />
        <stop offset="100%" stopColor={bottom} />
      </linearGradient>
      <linearGradient id={ids.shade} x1="0" y1="0" x2="0" y2="1">
        <stop offset="45%" stopColor={shade} stopOpacity="0" />
        <stop offset="100%" stopColor={shade} stopOpacity="0.55" />
      </linearGradient>
      <filter id={ids.blur} x="-30%" y="-40%" width="160%" height="190%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      <filter id={ids.soft} x="-30%" y="-80%" width="160%" height="260%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </>
  );
}

function SceneCloud({ ids, shadow, shadowOpacity = 0.16 }) {
  return (
    <g>
      <path
        d={CLOUD_PATH}
        fill={shadow}
        opacity={shadowOpacity}
        transform="translate(0 14)"
        filter={`url(#${ids.blur})`}
      />
      <path d={CLOUD_PATH} fill={`url(#${ids.cloud})`} />
      <path d={CLOUD_PATH} fill={`url(#${ids.shade})`} />
      <ellipse
        cx="112"
        cy="40"
        rx="42"
        ry="9"
        fill="#FFFFFF"
        opacity="0.6"
        filter={`url(#${ids.soft})`}
      />
    </g>
  );
}

/** A positioned, drifting cloud. `drift` picks which of the two drift speeds. */
function CloudAt({ ids, shadow, x, y, s = 1, o = 1, drift = 1, sh = 0.16 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <g className={`${ids.p}-d${drift}`}>
        <SceneCloud ids={ids} shadow={shadow} shadowOpacity={sh} />
      </g>
    </g>
  );
}

function SunRays({ cx, cy, inner, outer, count = 12 }) {
  return (
    <g stroke="#FFC48A" strokeWidth="2.4" strokeLinecap="round" opacity="0.7">
      {Array.from({ length: count }, (_, i) => {
        const a = (i * TAU) / count;
        const o = i % 2 === 0 ? outer : outer - 7;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * inner}
            y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * o}
            y2={cy + Math.sin(a) * o}
          />
        );
      })}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/*  Current weather                                                           */
/* -------------------------------------------------------------------------- */

const WEATHER_MOODS = {
  day: {
    sky: ["#9ADCD6", "#CBE9F2", "#FFE3D0"],
    hillFar: "#B4E7E1",
    hillMid: ["#A6E0D8", "#62BFB7"],
    hillNear: ["#75C8C5", "#3B9EB5"],
    cloud: ["#FFFFFF", "#D3E6EF"],
    shade: "#9FC3D6",
    shadow: "#3C7188",
    haze: "#FFFFFF",
    sun: 1,
  },
  overcast: {
    sky: ["#A9C3CC", "#C6D6DC", "#E3DDD6"],
    hillFar: "#9CBDBD",
    hillMid: ["#88B3B0", "#5E9A9B"],
    hillNear: ["#609AA3", "#3D7686"],
    cloud: ["#F1F5F7", "#BFCDD6"],
    shade: "#8499A8",
    shadow: "#2F4656",
    haze: "#FFFFFF",
    sun: 0.45,
  },
  storm: {
    sky: ["#5F7385", "#7C8D9A", "#A5A5A8"],
    hillFar: "#6F8E95",
    hillMid: ["#5A7F86", "#3E636E"],
    hillNear: ["#3F6671", "#2A4A57"],
    cloud: ["#9AA8B4", "#66788A"],
    shade: "#465766",
    shadow: "#18232D",
    haze: "#9FB0BB",
    sun: 0,
  },
  night: {
    sky: ["#1B2D4F", "#455F88", "#9A88A8"],
    hillFar: "#5B6F97",
    hillMid: ["#4A6089", "#33496F"],
    hillNear: ["#3A5578", "#243B5C"],
    cloud: ["#B9C6DE", "#7F90B3"],
    shade: "#5A6C92",
    shadow: "#101C33",
    haze: "#8EA2C8",
    sun: 1,
  },
  nightOvercast: {
    sky: ["#1E2A44", "#38486A", "#6C6C86"],
    hillFar: "#4A5B80",
    hillMid: ["#3E5278", "#2C3F63"],
    hillNear: ["#2F4666", "#1D3250"],
    cloud: ["#8E9BB6", "#58698A"],
    shade: "#44546F",
    shadow: "#0B1424",
    haze: "#7184AA",
    sun: 0.45,
  },
};

const STARS = [
  [380, 40, 1.6],
  [420, 74, 1.2],
  [520, 36, 1.8],
  [560, 98, 1.3],
  [345, 110, 1.1],
  [250, 52, 1.4],
  [90, 70, 1.5],
  [150, 30, 1.2],
];

const RAIN = Array.from({ length: 18 }, (_, i) => ({
  x: 326 + i * 14.5,
  y: 236 + (i % 4) * 8,
  delay: (i * 0.37) % 1.1,
  near: i % 2 === 0,
}));

const FLAKES = Array.from({ length: 14 }, (_, i) => ({
  x: 330 + i * 17,
  y: 238 + (i % 4) * 10,
  r: 1.6 + (i % 3) * 0.7,
  delay: (i * 0.41) % 2.8,
}));

/** Illustrated backdrop for the current weather card. */
export function CurrentWeatherScene({ category = "partly", isDay = true }) {
  const p = useScope("cw");

  const stormy = category === "storm";
  const rainy = category === "rain" || stormy;
  const snowy = category === "snow";
  const clear = category === "clear";
  const heavy = rainy || snowy || category === "cloudy";

  const mood = !isDay
    ? heavy
      ? "nightOvercast"
      : "night"
    : stormy
      ? "storm"
      : heavy
        ? "overcast"
        : "day";
  const m = WEATHER_MOODS[mood];
  const sunOpacity = m.sun;
  const rainCount = stormy ? 18 : 14;

  const ids = {
    p,
    sky: `${p}-sky`,
    sun: `${p}-sun`,
    bloom: `${p}-bloom`,
    cloud: `${p}-cloud`,
    shade: `${p}-shade`,
    hillMid: `${p}-hm`,
    hillNear: `${p}-hn`,
    light: `${p}-light`,
    haze: `${p}-haze`,
    vig: `${p}-vig`,
    blur: `${p}-blur`,
    soft: `${p}-soft`,
  };

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <svg
        className={`${p} block h-full w-full`}
        viewBox="0 0 600 340"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          ${baseCss(p)}
          .${p}-spin{transform-box:fill-box;transform-origin:center;animation:${p}-spin 90s linear infinite}
          .${p}-pulse{transform-box:fill-box;transform-origin:center;animation:${p}-pulse 6s ease-in-out infinite}
          .${p}-rain{animation:${p}-fall 1.1s linear infinite}
          .${p}-snow{animation:${p}-snow 5s linear infinite}
          .${p}-star{animation:${p}-twinkle 4s ease-in-out infinite}
          .${p}-bolt{opacity:0;animation:${p}-flash 7s linear infinite}
          .${p}-flash{opacity:0;animation:${p}-flashbg 7s linear infinite}
          @keyframes ${p}-spin{to{transform:rotate(360deg)}}
          @keyframes ${p}-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
          @keyframes ${p}-fall{0%{transform:translate(0,-14px);opacity:0}15%{opacity:.9}100%{transform:translate(-10px,58px);opacity:0}}
          @keyframes ${p}-snow{0%{transform:translate(0,-10px);opacity:0}15%{opacity:1}50%{transform:translate(10px,28px)}100%{transform:translate(-4px,62px);opacity:0}}
          @keyframes ${p}-twinkle{0%,100%{opacity:.3}50%{opacity:1}}
          @keyframes ${p}-flash{0%,90%,100%{opacity:0}92%{opacity:1}94%{opacity:.15}96%{opacity:.85}}
          @keyframes ${p}-flashbg{0%,90%,100%{opacity:0}92%{opacity:.28}94%{opacity:0}96%{opacity:.2}}
        `}</style>

        <defs>
          <linearGradient id={ids.sky} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={m.sky[0]} />
            <stop offset="50%" stopColor={m.sky[1]} />
            <stop offset="100%" stopColor={m.sky[2]} />
          </linearGradient>

          <radialGradient id={ids.sun} cx="38%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="40%" stopColor="#FFE8B8" />
            <stop offset="78%" stopColor="#FFBC78" />
            <stop offset="100%" stopColor="#FF8129" />
          </radialGradient>

          <radialGradient id={ids.bloom}>
            <stop
              offset="0%"
              stopColor={isDay ? "#FFF1D6" : "#DCE8FF"}
              stopOpacity={isDay ? 0.85 : 0.35}
            />
            <stop
              offset="50%"
              stopColor={isDay ? "#FFD9A8" : "#DCE8FF"}
              stopOpacity={isDay ? 0.25 : 0.1}
            />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <CloudDefs ids={ids} top={m.cloud[0]} bottom={m.cloud[1]} shade={m.shade} />

          <linearGradient id={ids.hillMid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={m.hillMid[0]} />
            <stop offset="100%" stopColor={m.hillMid[1]} />
          </linearGradient>

          <linearGradient id={ids.hillNear} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={m.hillNear[0]} />
            <stop offset="100%" stopColor={m.hillNear[1]} />
          </linearGradient>

          <radialGradient id={ids.light}>
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={ids.haze} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={m.haze} stopOpacity="0" />
            <stop offset="100%" stopColor={m.haze} stopOpacity="0.28" />
          </linearGradient>

          {/* keeps white card text readable over bright skies */}
          <linearGradient id={ids.vig} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isDay ? "#1C4A6B" : "#0A1328"}
              stopOpacity={isDay ? 0.16 : 0.22}
            />
            <stop offset="50%" stopColor={isDay ? "#1C4A6B" : "#0A1328"} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="340" fill={`url(#${ids.sky})`} />
        <ellipse cx="470" cy="90" rx="230" ry="180" fill={`url(#${ids.light})`} />

        {/* Stars */}
        {!isDay &&
          !heavy &&
          STARS.map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="#FFFFFF"
              className={`${p}-star`}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}

        {/* Sun or moon */}
        {sunOpacity > 0 && (
          <g opacity={sunOpacity}>
            <circle cx="470" cy="82" r="170" fill={`url(#${ids.bloom})`} />
            {isDay ? (
              <g>
                <g className={`${p}-spin`}>
                  <SunRays cx={470} cy={82} inner={50} outer={68} />
                </g>
                <circle cx="470" cy="82" r="62" fill="#FFFFFF" opacity="0.12" />
                <g className={`${p}-pulse`}>
                  <circle cx="470" cy="82" r="39" fill={`url(#${ids.sun})`} />
                </g>
              </g>
            ) : (
              <g>
                <circle cx="470" cy="82" r="64" fill="#D9E8FF" opacity="0.1" />
                <path
                  d="M489 104A34 34 0 0 1 449 55a35 35 0 1 0 54 54 34 34 0 0 1-14-5Z"
                  fill="#FFF4D6"
                />
              </g>
            )}
          </g>
        )}

        {/* Hills */}
        <path
          d="M0 246C78 214 142 222 216 247C296 274 366 246 428 221C497 193 550 215 600 235V340H0Z"
          fill={m.hillFar}
          opacity="0.55"
        />
        <path
          d="M0 271C93 237 174 249 254 272C340 297 435 258 600 225V340H0Z"
          fill={`url(#${ids.hillMid})`}
          opacity="0.75"
        />
        <rect y="200" width="600" height="140" fill={`url(#${ids.haze})`} />
        <path
          d="M0 304C100 272 179 286 271 302C379 320 479 271 600 265V340H0Z"
          fill={`url(#${ids.hillNear})`}
          opacity="0.7"
        />

        {/* Clouds */}
        <CloudAt ids={ids} shadow={m.shadow} x={150} y={196} s={0.5} o={0.55} drift={2} sh={0.1} />
        {!clear && (
          <CloudAt ids={ids} shadow={m.shadow} x={318} y={130} s={1.25} drift={1} sh={0.18} />
        )}
        <CloudAt ids={ids} shadow={m.shadow} x={436} y={206} s={0.7} o={0.92} drift={2} sh={0.12} />
        {!clear && (
          <CloudAt ids={ids} shadow={m.shadow} x={60} y={232} s={0.8} o={0.8} drift={1} sh={0.1} />
        )}

        {/* Lightning */}
        {stormy && (
          <>
            <rect width="600" height="340" fill="#FFFFFF" className={`${p}-flash`} />
            <g className={`${p}-bolt`}>
              <path
                d="M440 250l-14 26h10l-8 24 22-32h-11l9-18Z"
                fill="#FFF3B0"
                filter={`url(#${ids.soft})`}
              />
              <path d="M440 250l-14 26h10l-8 24 22-32h-11l9-18Z" fill="#FFF8CC" />
            </g>
          </>
        )}

        {/* Rain: near drops are thicker and faster than far drops */}
        {rainy && (
          <g stroke="#5DB8E8" strokeLinecap="round" fill="none" opacity="0.8">
            {RAIN.slice(0, rainCount).map((r, i) => (
              <path
                key={i}
                d={`M${r.x} ${r.y}l-4 12`}
                className={`${p}-rain`}
                strokeWidth={r.near ? 2.6 : 1.7}
                style={{
                  animationDelay: `${r.delay}s`,
                  animationDuration: r.near ? "0.9s" : "1.4s",
                  opacity: r.near ? 1 : 0.6,
                }}
              />
            ))}
          </g>
        )}

        {/* Snow */}
        {snowy && (
          <g fill="#FFFFFF">
            {FLAKES.map((f, i) => (
              <circle
                key={i}
                cx={f.x}
                cy={f.y}
                r={f.r}
                className={`${p}-snow`}
                style={{ animationDelay: `${f.delay}s` }}
              />
            ))}
          </g>
        )}

        {/* Soft foreground light and top scrim */}
        <circle cx="112" cy="154" r="54" fill="#FFFFFF" opacity="0.1" />
        <circle cx="184" cy="78" r="28" fill="#FF8129" opacity="0.06" />
        <rect width="600" height="340" fill={`url(#${ids.vig})`} />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Air quality                                                               */
/* -------------------------------------------------------------------------- */

const AIR_MOODS = {
  good: {
    sky: ["#1A66A3", "#3D8FC6", "#7FC1E2", "#C9E6F2"],
    vig: ["#0B4577", 0.3],
    glow: ["#FFF4D6", "#FFE9B8", 0.85],
    core: ["#FFFDF2", "#FFF0C4", "#FFE29A"],
    cloud: ["#FFFFFF", "#E3F0F8"],
    shade: "#8DB8D6",
    shadow: "#1B5E8E",
    smog: ["#D9C7A5", 0],
    rays: 0.14,
  },
  standard: {
    sky: ["#356F9C", "#6A9DBC", "#B3BFC0", "#E6D8C0"],
    vig: ["#0B3558", 0.32],
    glow: ["#FFE9C2", "#FFD79A", 0.7],
    core: ["#FFF6DC", "#FFE2A8", "#FFCB7A"],
    cloud: ["#F6F2EA", "#D5D8D8"],
    shade: "#9FB0B8",
    shadow: "#2B5878",
    smog: ["#D8BE92", 0.16],
    rays: 0.09,
  },
  hazardous: {
    sky: ["#5E6F7C", "#8A8E8B", "#B09C80", "#CDB08B"],
    vig: ["#2A3138", 0.35],
    glow: ["#FFD9A0", "#F5A860", 0.6],
    core: ["#FFE7BF", "#FFB777", "#EE8A3A"],
    cloud: ["#D9CDBB", "#B3A58F"],
    shade: "#8E8068",
    shadow: "#3C3A34",
    smog: ["#C79A66", 0.34],
    rays: 0.04,
  },
};

// Same thresholds as the scale in AirQualityCard
const airMood = (aqi) =>
  aqi == null || aqi <= 50 ? "good" : aqi <= 150 ? "standard" : "hazardous";

/** Pass `aqi` to tint the sky. Without it the scene shows a clear day. */
export function AirQualityScene({ aqi }) {
  const p = useScope("air");
  const m = AIR_MOODS[airMood(aqi)];

  const ids = {
    p,
    sky: `${p}-sky`,
    cloud: `${p}-cloud`,
    shade: `${p}-shade`,
    glow: `${p}-glow`,
    core: `${p}-core`,
    ray: `${p}-ray`,
    vig: `${p}-vig`,
    kiteA: `${p}-kitea`,
    kiteB: `${p}-kiteb`,
    haze: `${p}-haze`,
    blur: `${p}-blur`,
    soft: `${p}-soft`,
  };

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <svg
        className={`${p} block h-full w-full`}
        viewBox="0 0 600 340"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          ${baseCss(p)}
          .${p}-kite{transform-box:fill-box;transform-origin:50% 60%;animation:${p}-bob 7s ease-in-out infinite}
          @keyframes ${p}-bob{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-6px) rotate(2.5deg)}}
        `}</style>

        <defs>
          <linearGradient id={ids.sky} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={m.sky[0]} />
            <stop offset="38%" stopColor={m.sky[1]} />
            <stop offset="72%" stopColor={m.sky[2]} />
            <stop offset="100%" stopColor={m.sky[3]} />
          </linearGradient>

          <CloudDefs ids={ids} top={m.cloud[0]} bottom={m.cloud[1]} shade={m.shade} />

          <radialGradient id={ids.glow}>
            <stop offset="0%" stopColor={m.glow[0]} stopOpacity={m.glow[2]} />
            <stop offset="45%" stopColor={m.glow[1]} stopOpacity={m.glow[2] * 0.33} />
            <stop offset="100%" stopColor={m.glow[1]} stopOpacity="0" />
          </radialGradient>

          <radialGradient id={ids.core}>
            <stop offset="0%" stopColor={m.core[0]} />
            <stop offset="70%" stopColor={m.core[1]} />
            <stop offset="100%" stopColor={m.core[2]} />
          </radialGradient>

          <linearGradient id={ids.ray} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={ids.vig} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={m.vig[0]} stopOpacity={m.vig[1]} />
            <stop offset="45%" stopColor={m.vig[0]} stopOpacity="0" />
          </linearGradient>

          <linearGradient id={ids.kiteA} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8A3D" />
            <stop offset="100%" stopColor="#F26A1B" />
          </linearGradient>
          <linearGradient id={ids.kiteB} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFB070" />
            <stop offset="100%" stopColor="#FF8B3F" />
          </linearGradient>

          <radialGradient id={ids.haze}>
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="340" fill={`url(#${ids.sky})`} />
        <rect width="600" height="340" fill={`url(#${ids.vig})`} />

        {/* Sun bloom, rays and core */}
        <circle cx="110" cy="62" r="190" fill={`url(#${ids.glow})`} />
        <g transform="translate(110 62)" opacity={m.rays} filter={`url(#${ids.soft})`}>
          {[-82, -64, -46, -30, -14, 4].map((a, i) => (
            <rect
              key={a}
              x={i % 2 ? -5 : -8}
              y="20"
              width={i % 2 ? 10 : 16}
              height="260"
              fill={`url(#${ids.ray})`}
              transform={`rotate(${a})`}
            />
          ))}
        </g>
        <circle cx="110" cy="62" r="54" fill="#FFFFFF" opacity="0.1" />
        <circle cx="110" cy="62" r="36" fill={`url(#${ids.core})`} />

        {/* Smog veil: sits over the sun but under the clouds */}
        <rect width="600" height="340" fill={m.smog[0]} opacity={m.smog[1]} />

        {/* Horizon haze */}
        <ellipse cx="300" cy="330" rx="380" ry="90" fill={`url(#${ids.haze})`} />

        {/* Kite */}
        <g transform="translate(402 34) rotate(9)">
          <g className={`${p}-kite`}>
            <path d="M52 8 12 56 52 104Z" fill={`url(#${ids.kiteA})`} />
            <path d="M52 8 92 56 52 104Z" fill={`url(#${ids.kiteB})`} />
            <path
              d="M52 8 92 56 52 104 12 56Z"
              fill="none"
              stroke="#FFF7EE"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M52 8V104M12 56H92" stroke="#FFE5D4" strokeWidth="1.6" opacity="0.8" />
            <path
              d="M52 104C46 130 60 144 48 166"
              stroke="#FFF7EE"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M48 130C34 132 30 142 32 150C42 148 47 139 48 130Z" fill="#D9ED8A" />
            <path d="M49 146C62 147 67 157 66 165C56 164 51 155 49 146Z" fill="#D9ED8A" />
          </g>
        </g>

        {/* Clouds: far to near */}
        <CloudAt ids={ids} shadow={m.shadow} x={335} y={146} s={0.6} o={0.55} drift={2} sh={0.1} />
        <CloudAt ids={ids} shadow={m.shadow} x={470} y={196} s={0.5} o={0.5} drift={1} sh={0.1} />
        <CloudAt ids={ids} shadow={m.shadow} x={40} y={108} s={0.95} drift={1} />
        <CloudAt ids={ids} shadow={m.shadow} x={-50} y={236} s={1.3} drift={2} />
        <CloudAt ids={ids} shadow={m.shadow} x={130} y={282} s={1.2} o={0.92} drift={1} />
        <CloudAt ids={ids} shadow={m.shadow} x={300} y={250} s={1.5} drift={2} />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Umbrella                                                                  */
/* -------------------------------------------------------------------------- */

// Canopy is centered on the pole at x=150. Ribs meet at the tip (150, 36).
const CANOPY =
  "M28 156C36 86 88 36 150 36S264 86 272 156Q241 138 211 156Q180 138 150 156Q119 138 89 156Q58 138 28 156Z";

// Only drops that land on or outside the canopy. Nothing falls under it.
const DROPS = [
  [14, 30],
  [48, 6],
  [96, 40],
  [142, 8],
  [196, 44],
  [240, 14],
  [280, 62],
  [292, 120],
  [8, 118],
  [36, 80],
  [262, 96],
  [286, 20],
];

/** Person holding an orange umbrella in the rain. Layered SVG with light motion. */
export function UmbrellaIllustration() {
  const p = useScope("um");
  const ids = {
    canopy: `${p}-canopy`,
    coat: `${p}-coat`,
    clip: `${p}-clip`,
    soft: `${p}-soft`,
  };

  return (
    <svg
      className={`${p} pointer-events-none absolute -right-4.5 -bottom-2 z-1 h-auto w-[64%] max-[900px]:w-[48%] max-[520px]:w-[54%]`}
      viewBox="0 0 300 360"
      role="img"
      aria-label="Person holding an umbrella in the rain"
    >
      <style>{`
        @media (prefers-reduced-motion:reduce){.${p} *{animation:none!important}}
        .${p}-drop{animation:${p}-fall 1.2s linear infinite}
        .${p}-sway{transform-box:view-box;transform-origin:150px 254px;animation:${p}-sway 6s ease-in-out infinite}
        .${p}-ripple{transform-box:fill-box;transform-origin:center;animation:${p}-ripple 2.6s ease-out infinite}
        @keyframes ${p}-fall{0%{transform:translate(0,-12px);opacity:0}15%{opacity:.9}100%{transform:translate(-8px,66px);opacity:0}}
        @keyframes ${p}-sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
        @keyframes ${p}-ripple{0%{transform:scale(.35);opacity:.55}100%{transform:scale(1.15);opacity:0}}
      `}</style>

      <defs>
        <linearGradient id={ids.canopy} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB872" />
          <stop offset="100%" stopColor="#F26F14" />
        </linearGradient>
        <linearGradient id={ids.coat} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B5278" />
          <stop offset="100%" stopColor="#1C2B45" />
        </linearGradient>
        <clipPath id={ids.clip}>
          <path d={CANOPY} />
        </clipPath>
        <filter id={ids.soft} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Falling rain, behind everything */}
      <g stroke="#55B5E5" strokeWidth="3" strokeLinecap="round" opacity="0.42">
        {DROPS.map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y}l-5 14`}
            className={`${p}-drop`}
            style={{ animationDelay: `${((i * 0.19) % 1.2).toFixed(2)}s` }}
          />
        ))}
      </g>

      {/* Puddle and ripples */}
      <ellipse cx="176" cy="346" rx="104" ry="10" fill="#55B5E5" opacity="0.12" />
      <ellipse cx="176" cy="346" rx="68" ry="6" fill="#55B5E5" opacity="0.16" />
      <g fill="none" stroke="#55B5E5" strokeWidth="2">
        <ellipse className={`${p}-ripple`} cx="146" cy="346" rx="26" ry="5" />
        <ellipse
          className={`${p}-ripple`}
          cx="206"
          cy="347"
          rx="26"
          ry="5"
          style={{ animationDelay: "1.2s" }}
        />
      </g>

      {/* Person */}
      <g transform="translate(2 0)">
        {/* legs and boots */}
        <path d="M156 290v38M188 290v38" stroke="#1C2B45" strokeWidth="13" strokeLinecap="round" />
        <path d="M143 332h26M175 332h26" stroke="#FF8129" strokeWidth="10" strokeLinecap="round" />

        {/* coat */}
        <path d="M151 214C160 208 184 208 193 214L211 292H133Z" fill={`url(#${ids.coat})`} />
        <path d="M151 214 133 292h14l12-78Z" fill="#FFFFFF" opacity="0.07" />
        <path d="M172 226V292" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.14" />
        <path
          d="M146 266h18M180 266h18"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.14"
        />

        {/* free arm */}
        <path
          d="M191 219C202 238 204 256 202 270"
          fill="none"
          stroke="#24405F"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle cx="202" cy="274" r="6" fill="#F6C6A8" />

        {/* neck, head and hair */}
        <rect x="166" y="203" width="12" height="11" rx="4" fill="#E9B293" />
        <circle cx="172" cy="188" r="18" fill="#F6C6A8" />
        <path
          d="M153 190c-3-19 7-31 19-31s22 12 19 31c-5-8-11-12-19-12s-14 4-19 12Z"
          fill="#1C2B45"
        />
        <circle cx="166" cy="190" r="1.7" fill="#1C2B45" />
        <circle cx="178" cy="190" r="1.7" fill="#1C2B45" />
        <path
          d="M167 197q5 4 10 0"
          fill="none"
          stroke="#1C2B45"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="161" cy="196" r="3" fill="#F29A86" opacity="0.4" />
        <circle cx="183" cy="196" r="3" fill="#F29A86" opacity="0.4" />

        {/* scarf */}
        <path d="M181 215l5 22 9-3-4-21Z" fill="#C3DA6B" />
        <path
          d="M153 211C162 220 182 220 191 211L189 203C181 209 163 209 155 203Z"
          fill="#D9ED8A"
        />
      </g>

      {/* Umbrella: swings gently around the gripping hand */}
      <g className={`${p}-sway`}>
        {/* pole with hooked handle */}
        <path
          d="M150 36V264c0 12-15 12-15 0"
          fill="none"
          stroke="#1C2B45"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* cast shadow on the person */}
        <ellipse
          cx="150"
          cy="160"
          rx="104"
          ry="8"
          fill="#1C2B45"
          opacity="0.14"
          filter={`url(#${ids.soft})`}
        />

        {/* canopy */}
        <g clipPath={`url(#${ids.clip})`}>
          <path d={CANOPY} fill={`url(#${ids.canopy})`} />
          {/* lit left panel */}
          <path d="M150 36C128 52 96 96 89 160H0V20H150Z" fill="#FFFFFF" opacity="0.14" />
          {/* shaded alternating panels */}
          <path d="M150 36C128 52 96 96 89 160H150Z" fill="#B94A00" opacity="0.1" />
          <path d="M150 36C172 52 204 96 211 160H290V20H150Z" fill="#B94A00" opacity="0.14" />
          {/* sheen */}
          <ellipse
            cx="96"
            cy="76"
            rx="34"
            ry="14"
            fill="#FFFFFF"
            opacity="0.3"
            transform="rotate(-38 96 76)"
            filter={`url(#${ids.soft})`}
          />
        </g>
        <path
          d="M150 36V156M150 36C128 52 96 96 89 156M150 36C172 52 204 96 211 156"
          fill="none"
          stroke="#FFE0D0"
          strokeWidth="2.2"
          opacity="0.8"
        />
        <path
          d={CANOPY}
          fill="none"
          stroke="#FFE9DA"
          strokeWidth="1.6"
          opacity="0.55"
          strokeLinejoin="round"
        />
        <path d="M150 36V22" stroke="#1C2B45" strokeWidth="4" strokeLinecap="round" />
        <circle cx="150" cy="19" r="3.6" fill="#1C2B45" />
      </g>

      {/* Gripping arm and hand sit on top of the pole */}
      <g transform="translate(2 0)">
        <path
          d="M155 219C142 232 144 246 148 254"
          fill="none"
          stroke="#24405F"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>
      <circle cx="150" cy="254" r="6.5" fill="#F6C6A8" />
    </svg>
  );
}
