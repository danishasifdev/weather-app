/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import { dayLabel, hourLabel, longDayLabel, toTemp, weatherInfo } from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

const SCENE_CARD =
  "animate-fade-up rounded-card shadow-card relative isolate flex min-h-85 flex-col justify-between overflow-hidden bg-white p-5.5 max-[760px]:min-h-80 max-[760px]:p-4.5";
const SCENE_OVERLAY =
  "pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(28,43,69,0.08),transparent_52%,rgba(255,255,255,0.12))]";

const FORECAST_ROW =
  "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center text-left transition-all hover:-translate-y-0.5";
const FORECAST_ROW_COMPACT =
  "gap-2 rounded-xl bg-white px-2.5 py-2 shadow-[0_6px_18px_rgba(28,43,69,0.05)] hover:shadow-[0_12px_24px_rgba(28,43,69,0.1)] sm:rounded-2xl sm:px-3";
const FORECAST_ROW_MODAL =
  "gap-3 rounded-forecast border border-slate-100 bg-[#F7F9FA] p-2.5 hover:border-brand-mint hover:bg-white hover:shadow-card sm:p-3";

const FORECAST_ICON =
  "text-brand-sky grid shrink-0 place-items-center bg-[linear-gradient(to_bottom_right,#eaf7f5,#eaf3fa)]";
const FORECAST_ICON_COMPACT = "h-9 w-9 rounded-xl";
const FORECAST_ICON_MODAL = "h-11 w-11 rounded-btn";

/** Illustrated card shell with the shared scrim layered over the scene. */
export function SceneCard({ weather = false, scrim, style, children }) {
  return (
    <article className={SCENE_CARD} style={style}>
      <span
        aria-hidden="true"
        className={weather ? "pointer-events-none absolute inset-0 z-1" : SCENE_OVERLAY}
        style={weather ? { background: scrim } : undefined}
      />
      {children}
    </article>
  );
}

/** Rounded icon tile used at the start of a scene card header. */
export function CardIcon({ tone = "orange", children }) {
  return (
    <span
      className={`grid h-10.5 w-10.5 flex-none place-items-center rounded-full bg-white/80 shadow-[0_6px_18px_rgba(28,43,69,0.1)] ${
        tone === "sky" ? "text-brand-sky" : "text-brand-orange"
      }`}
    >
      {children}
    </span>
  );
}

/** Shared header markup for the two illustrated overview cards. */
export function CardHeader({ icon, title, subtitle, badge, tone, ink }) {
  return (
    <div className="flex items-center gap-2.5">
      <CardIcon tone={tone}>{icon}</CardIcon>
      <div className="min-w-0">
        <p className={`text-base leading-[1.05] font-bold tracking-[-0.02em] ${ink.heading}`}>
          {title}
        </p>
        <p className={`text-11px mt-0.5 leading-[1.2] ${ink.body}`}>{subtitle}</p>
      </div>
      {badge}
    </div>
  );
}

/** Shared spacing for the large card metric. */
export function MetricRow({ children }) {
  return <div className="mt-7.5 flex items-end gap-4 max-[760px]:mt-6">{children}</div>;
}

/** Small uppercase eyebrow used across cards and modals. */
export function Kicker({ children, tone = "default", className = "" }) {
  return (
    <p
      className={`text-10px font-bold tracking-[0.16em] uppercase ${
        tone === "orange" ? "text-brand-text" : ""
      } ${className}`}
    >
      {children}
    </p>
  );
}

/** Rounded status badge. */
export function Pill({ children, tone = "white", className = "" }) {
  const tones = {
    white: "bg-white/75 text-10px font-bold text-brand-navy",
    grey: "bg-brand-grey text-10px font-semibold text-brand-muted",
    lime: "bg-brand-lime text-10px font-bold text-brand-navy",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** One of the three compact metric tiles in the current-weather card. */
export function StatCard({ label, value, suffix, tone = "white", icon }) {
  const tones = {
    white: "border-brand-navy/5 bg-white text-brand-navy",
    navy: "border-transparent bg-brand-navy text-white",
    lime: "border-transparent bg-brand-lime text-brand-navy",
  };

  return (
    <div
      className={`rounded-stat shadow-stat flex min-h-18 min-w-0 flex-col items-center justify-center border p-2.5 max-[760px]:px-2 max-[760px]:py-2.5 ${tones[tone]}`}
    >
      <div className="text-10px flex items-center gap-1.5 font-semibold whitespace-nowrap opacity-80">
        <span className="grid h-5 w-5 flex-none place-items-center">{icon}</span>
        <span className="max-[350px]:hidden">{label}</span>
      </div>
      <p className="mt-2 text-xl leading-none font-bold tracking-tighter max-[760px]:text-lg">
        {value}
        {suffix && (
          <span className="text-10px ml-0.5 font-medium tracking-normal opacity-75">{suffix}</span>
        )}
      </p>
    </div>
  );
}

/** Chart metric toggle. */
export function ControlButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`hover:bg-brand-orange rounded-btn text-11px inline-flex items-center gap-1.5 border border-transparent px-3 py-2.5 font-semibold transition-all max-[760px]:flex-1 max-[760px]:justify-center ${
        active
          ? "bg-brand-deep text-white shadow-[0_8px_18px_rgba(193,79,0,0.28)]"
          : "text-brand-muted bg-[#f4f5f7] hover:text-white"
      }`}
    >
      {children}
      <span className="max-[350px]:hidden">{label}</span>
    </button>
  );
}

/** Compact circular icon action used in the header. */
export function IconButton({ label, onClick, children, active, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`hover:bg-brand-orange/10 hover:text-brand-text relative grid h-9 w-9 place-items-center rounded-full transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 max-[520px]:h-8 max-[520px]:w-8 ${
        active ? "bg-brand-orange/10 text-brand-text" : "text-[#62708a]"
      }`}
    >
      {active && (
        <span className="bg-brand-orange/20 pointer-events-none absolute inset-0 animate-ping rounded-full" />
      )}
      {children}
    </button>
  );
}

/** Shared button with visual variants. */
export function Button({
  children,
  onClick,
  variant = "primary",
  wide = false,
  small = false,
  className = "",
  ...rest
}) {
  const variants = {
    primary: "bg-brand-deep text-white shadow-orange",
    outline: "border border-brand-navy/10 bg-white text-brand-navy",
    soft: "bg-white text-brand-text shadow-sm",
  };
  const shape = wide
    ? "mt-3 w-full min-w-0 rounded-xl p-2.5 text-xs"
    : small
      ? "rounded-full px-3.5 py-1.5 text-xs"
      : "rounded-full px-6 py-3 text-13px";
  const weight = small || variant === "outline" ? "font-semibold" : "font-bold";

  const classes = [
    "flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5",
    shape,
    weight,
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}

/** Modal shell: backdrop, panel, header and close behavior. */
export function Modal({
  label,
  kicker,
  title,
  subtitle,
  onClose,
  closeLabel = "Close",
  size = "day",
  children,
}) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="bg-brand-navy/45 animate-fade-in fixed inset-0 z-80 flex items-center justify-center overflow-y-auto p-3 backdrop-blur-xs sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className={`animate-scale-in my-auto max-h-[90dvh] w-full overflow-y-auto rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(28,43,69,0.25)] sm:rounded-[28px] sm:p-7 ${
          size === "five-day" ? "max-w-140" : "max-w-170"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {kicker && <Kicker tone="orange">{kicker}</Kicker>}
            {title && (
              <h2 className="text-brand-navy mt-1.5 text-2xl font-bold tracking-[-0.045em] sm:text-[28px]">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-11px text-brand-muted mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="bg-brand-deep focus-visible:ring-brand-text/40 hover:bg-brand-orange grid h-9 w-9 flex-none place-items-center rounded-full text-white transition-all hover:text-white focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** One day in either the compact prediction list or the 5-day modal. */
export function ForecastRow({ day, unit, onSelect, variant = "compact" }) {
  const modal = variant === "modal";
  const extraDate = modal ? longDayLabel(day.date).split(",")[1]?.trim() || "" : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${FORECAST_ROW} ${modal ? FORECAST_ROW_MODAL : FORECAST_ROW_COMPACT}`}
    >
      <span className={`${FORECAST_ICON} ${modal ? FORECAST_ICON_MODAL : FORECAST_ICON_COMPACT}`}>
        <WeatherIcon code={day.code} size={modal ? 25 : 22} />
      </span>

      <span className="flex w-full min-w-0 flex-col gap-0.5">
        <strong className={`${modal ? "text-brand-navy text-sm" : "text-xs"} font-bold`}>
          {dayLabel(day.date)}
          {modal && (
            <span className="text-10px text-brand-muted ml-1.5 font-medium">{extraDate}</span>
          )}
        </strong>
        <small className="text-10px text-brand-muted truncate">
          {weatherInfo(day.code).label}
          {modal && ` · ${day.pop ?? 0}% rain`}
        </small>
      </span>

      <span
        className={`flex shrink-0 ${modal ? "items-center gap-2" : "flex-col items-end gap-0.5"}`}
      >
        <span
          className={`text-13px ${modal ? "text-brand-navy text-right font-bold" : "font-bold"}`}
        >
          {toTemp(day.max, unit)}°
          {modal && (
            <span className="text-10px text-brand-muted ml-1 font-medium">
              {toTemp(day.min, unit)}°
            </span>
          )}
        </span>
        {!modal && <small className="text-10px text-brand-muted">{toTemp(day.min, unit)}°</small>}
        {modal && <ChevronRight size={15} strokeWidth={2} className="text-brand-muted shrink-0" />}
      </span>
    </button>
  );
}

/** Label/value tile inside the day-detail modal. */
export function DetailTile({ label, value }) {
  return (
    <div className="min-w-0 rounded-[15px] border border-slate-100 bg-[#F7F9FA] p-3 transition-colors hover:bg-white">
      <span className="text-brand-muted block truncate text-[9px] font-semibold tracking-[0.09em] uppercase">
        {label}
      </span>
      <strong className="text-brand-navy mt-1.5 block truncate text-base font-bold tracking-tight">
        {value}
      </strong>
    </div>
  );
}

/** Single hour column in the day-detail hourly strip. */
export function HourChip({ hour, unit }) {
  const hourNumber = Number(hour.time.slice(11, 13));

  return (
    <div className="flex w-14 flex-none flex-col items-center gap-2 rounded-xl py-2 transition-colors hover:bg-white">
      <span className="text-brand-muted text-[9px] font-medium">{hourLabel(hour.time)}</span>
      <WeatherIcon code={hour.code} isDay={hourNumber >= 6 && hourNumber < 19} size={22} />
      <strong className="text-brand-navy text-xs font-bold">{toTemp(hour.temp, unit)}°</strong>
    </div>
  );
}

/** Consistent heading row used inside modals. */
export function SectionHeader({ title, hint, className = "" }) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-2 ${className}`}>
      <h3 className="text-brand-navy text-xs font-bold">{title}</h3>
      {hint && <span className="text-10px text-brand-muted max-[400px]:hidden">{hint}</span>}
    </div>
  );
}
