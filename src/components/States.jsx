/* eslint-disable react/prop-types, react/no-unescaped-entities */
import { useEffect, useId, useState } from "react";
import { CloudOff, CloudSun, Wind, X } from "lucide-react";
import { Button } from "./ui";

/** Small shimmering block used by every skeleton layout. */
function Shimmer({ className = "", delay = 0, style }) {
  return (
    <div
      className={`after:animate-shimmer relative overflow-hidden bg-[#e9edf0] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)] after:content-[''] after:[animation-delay:var(--shimmer-delay)] ${className}`}
      style={{ "--shimmer-delay": `${delay}ms`, ...style }}
    />
  );
}

/** Three gently bouncing dots for inline "working on it" copy. */
export function LoadingDots({ className = "" }) {
  return (
    <span className={`inline-flex items-end gap-1 ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-loader-dots h-1 w-1 rounded-full bg-current"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

/** Compact orbit spinner that inherits the current text color. */
export function OrbitSpinner({ className = "" }) {
  return (
    <span
      className={`inline-grid place-items-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" className="animate-loader-spin h-full w-full">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="3"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="18 42"
        />
      </svg>
    </span>
  );
}

/**
 * Art-directed loader: a pulsing sun with turning rays, a drifting cloud and
 * falling rain inside an orbiting progress ring.
 */
export function WeatherLoader({ className = "" }) {
  const uid = useId().replace(/:/g, "");
  const sun = `loader-sun-${uid}`;

  return (
    <div
      className={`relative h-22 w-22 flex-none ${className}`}
      role="status"
      aria-label="Loading weather"
    >
      <svg viewBox="0 0 96 96" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={sun} cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#FFF6DF" />
            <stop offset="55%" stopColor="#FFC48A" />
            <stop offset="100%" stopColor="#FF8129" />
          </radialGradient>
        </defs>

        {/* Progress ring */}
        <circle
          cx="48"
          cy="48"
          r="43"
          fill="none"
          stroke="#D6EA70"
          strokeOpacity="0.45"
          strokeWidth="3"
        />
        <g className="animate-loader-spin" style={{ transformOrigin: "48px 48px" }}>
          <circle
            cx="48"
            cy="48"
            r="43"
            fill="none"
            stroke="#FF8129"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="64 300"
          />
        </g>

        {/* Sun rays + core */}
        <g
          className="animate-loader-spin"
          style={{ transformOrigin: "48px 48px", animationDuration: "12s" }}
        >
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={48 + Math.cos(a) * 19}
                y1={48 + Math.sin(a) * 19}
                x2={48 + Math.cos(a) * 25}
                y2={48 + Math.sin(a) * 25}
                stroke="#FF8129"
                strokeOpacity="0.65"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <circle
          cx="48"
          cy="48"
          r="14"
          fill={`url(#${sun})`}
          className="animate-loader-pulse"
          style={{ transformOrigin: "48px 48px" }}
        />

        {/* Drifting cloud */}
        <g className="animate-loader-drift">
          <path
            d="M25 64c-6 0-9-4-9-8s4-8 9-8c1-7 7-11 13-10 5 1 8 5 9 10 7-3 14 2 14 9 0 4-3 7-8 7Z"
            fill="#FFFFFF"
            opacity="0.96"
          />
          <path
            d="M25 64c-6 0-9-4-9-8s4-8 9-8c1-7 7-11 13-10 5 1 8 5 9 10 7-3 14 2 14 9 0 4-3 7-8 7Z"
            fill="#B4E7E1"
            opacity="0.55"
          />
        </g>

        {/* Rain */}
        {[34, 43, 52].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1="67"
            x2={x - 2}
            y2="73"
            stroke="#55B5E5"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-loader-rain"
            style={{ animationDelay: `${i * 320}ms` }}
          />
        ))}
      </svg>
    </div>
  );
}

const LOADING_LINES = [
  "Reading the sky…",
  "Mapping the clouds…",
  "Measuring the breeze…",
  "Almost there…",
];

const SIDE_BLOCKS = ["h-16", "h-36", "h-20", "h-56"];

export function DashboardSkeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((n) => (n + 1) % LOADING_LINES.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="animate-fade-in mx-auto w-full max-w-[1600px] px-4 pb-5 sm:px-6 xl:px-8"
      aria-busy="true"
      aria-label="Loading weather"
    >
      <div className="shadow-panel grid grid-cols-[minmax(0,2.85fr)_minmax(0,1fr)] gap-5.5 rounded-4xl border border-white bg-white p-5.5 max-[1180px]:grid-cols-1 max-[760px]:rounded-[26px] max-[760px]:p-3.5">
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-4.5 max-[760px]:grid-cols-1">
            {[0, 1].map((card) => (
              <div
                key={card}
                className="rounded-card shadow-card relative isolate flex min-h-85 flex-col justify-between overflow-hidden bg-white p-5 max-[760px]:min-h-80 max-[760px]:p-4.5"
              >
                {card === 0 ? (
                  <CloudSun
                    size={116}
                    strokeWidth={0.9}
                    aria-hidden="true"
                    className="animate-loader-float text-brand-navy/6 pointer-events-none absolute top-8 -right-5"
                  />
                ) : (
                  <Wind
                    size={116}
                    strokeWidth={0.9}
                    aria-hidden="true"
                    className="animate-loader-float text-brand-sky/10 pointer-events-none absolute top-8 -right-5"
                    style={{ animationDelay: "700ms" }}
                  />
                )}
                <Shimmer className="h-10 w-10 rounded-full" delay={card * 90} />
                <Shimmer className="mt-8 h-4 w-28 rounded-xl" delay={card * 90 + 120} />
                <Shimmer className="mt-4 h-16 w-40 rounded-2xl" delay={card * 90 + 240} />
                <div className="mt-8 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <Shimmer
                      key={i}
                      className="h-18 rounded-2xl"
                      delay={card * 90 + 360 + i * 110}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4.5 grid grid-cols-[minmax(0,1.7fr)_minmax(250px,0.9fr)] items-stretch gap-4.5 max-[900px]:grid-cols-1">
            <Shimmer className="h-64 rounded-[24px]" delay={120} />
            <Shimmer className="h-64 rounded-[24px]" delay={240} />
          </div>
        </div>
        <div className="bg-brand-grey flex min-w-0 flex-col gap-3.5 rounded-[28px] p-4.5 shadow-[inset_0_1px_0_#fff] max-[1180px]:grid max-[1180px]:grid-cols-2 max-[1180px]:items-start max-[760px]:flex max-[760px]:p-4">
          {SIDE_BLOCKS.map((height, i) => (
            <Shimmer key={height} className={`w-full rounded-2xl ${height}`} delay={i * 150} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5">
        <WeatherLoader />
        <p className="text-brand-ink flex items-center gap-2 text-xs font-semibold">
          <span>{LOADING_LINES[step]}</span>
          <LoadingDots />
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry, onUseLocation }) {
  return (
    <div className="animate-fade-up mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="rounded-forecast text-brand-text shadow-card mb-7 grid h-24 w-24 place-items-center bg-white p-3.5 px-4">
        <CloudOff size={44} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <p className="text-brand-text text-xs font-semibold tracking-[0.2em] uppercase">
        Couldn't load the forecast
      </p>
      <h2 className="text-brand-navy mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {error?.title || "Something went wrong"}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#858A98]">
        {error?.message ||
          "We couldn't reach the weather service. Check your connection and try again."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Button variant="outline" onClick={onUseLocation}>
          Use my location
        </Button>
      </div>
      <p className="mt-8 text-xs text-[#858A98]">You can also search for any city above.</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className="animate-fade-in rounded-forecast shadow-card mb-3 flex flex-wrap items-center justify-between gap-3 border border-rose-100 bg-white p-3.5 px-4">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-500">
          !
        </span>
        <div>
          <p className="text-brand-navy font-semibold">Couldn't refresh the forecast</p>
          <p className="text-xs text-[#858A98]">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="soft" small onClick={onRetry}>
          Retry
        </Button>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="hover:text-brand-navy text-[#858A98] transition"
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export function NoticeBanner({ message, actionLabel, onAction }) {
  return (
    <div className="animate-fade-in rounded-forecast shadow-card mb-3 flex flex-wrap items-center justify-between gap-3 border border-transparent bg-white p-3.5 px-4 text-xs text-[#858A98]">
      <span>{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-brand-text hover:text-brand-navy font-semibold transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
