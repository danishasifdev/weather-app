/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Droplet,
  Eye,
  Gauge,
  Leaf,
  Sun,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import { SunPath, TemperatureChart } from "./Charts";
import {
  AirQualityScene,
  CurrentWeatherScene,
  UmbrellaIllustration,
} from "./Illustrations";
import WeatherIcon from "./WeatherIcon";
import { LoadingDots, OrbitSpinner } from "./States";
import {
  aqiInfo,
  clockLabel,
  dayLabel,
  fetchAirQuality,
  formatDuration,
  hourLabel,
  localDate,
  longDayLabel,
  speedLabel,
  toTemp,
  toWind,
  weatherInfo,
  windDirection,
} from "../lib/weather";

function useCountUp(value, duration = 750) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value ?? 0);

  useEffect(() => {
    if (value == null) return undefined;
    const from = fromRef.current;
    if (from === value) {
      setDisplay(value);
      return undefined;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const next = Math.round(
        from + (value - from) * (1 - (1 - progress) ** 3),
      );
      fromRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

function useAirQuality(location) {
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return undefined;
    const controller = new AbortController();
    setLoading(true);
    fetchAirQuality({ ...location, signal: controller.signal })
      .then((value) => {
        if (controller.signal.aborted) return;
        setAir(value);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setAir(null);
        setLoading(false);
      });
    return () => controller.abort();
  }, [location]);

  return { air, loading };
}

const fade = (delay) => ({ animationDelay: `${delay}ms` });

function buildSlots(hourly, unit) {
  return [
    ["Morning", 8],
    ["Afternoon", 14],
    ["Evening", 18],
    ["Night", 22],
  ].map(([label, hour]) => {
    const item =
      hourly.find((h) => Number(h.time.slice(11, 13)) >= hour) ||
      hourly[hourly.length - 1];
    return {
      label,
      temp: toTemp(item?.temp, unit),
      code: item?.code ?? 0,
      pop: item?.pop ?? 0,
      wind: item?.wind ?? null,
    };
  });
}

function conditionName(code, isDay) {
  const { label, category } = weatherInfo(code);
  if (category === "clear") return isDay ? "Sun" : "Clear night";
  if (category === "partly") return "Partly cloudy";
  if (category === "cloudy") return "Cloudy";
  return label;
}

function uvLabel(uv) {
  if (uv >= 11) return "Extreme";
  if (uv >= 8) return "Very high";
  if (uv >= 6) return "High";
  if (uv >= 3) return "Moderate";
  return "Low";
}

function aqiCategory(aqi) {
  if (aqi == null) return "—";
  if (aqi <= 50) return "Good";
  if (aqi <= 150) return "Standard";
  return "Hazardous";
}

/** Ink colors that keep a card's copy readable over its illustrated scene. */
function contrastInk(onDark) {
  return {
    heading: onDark ? "text-white" : "text-[#111111]",
    body: onDark ? "text-white/80" : "text-[#4A5568]",
    figure: onDark ? "text-white" : "text-brand-navy",
    glow: onDark ? "[text-shadow:0_3px_14px_rgba(8,14,30,0.5)]" : "",
  };
}

function daylight(isoA, isoB) {
  const minutes = (iso) => {
    const [h, m] = String(iso || "00:00")
      .slice(11, 16)
      .split(":")
      .map(Number);
    return h * 60 + m;
  };
  return formatDuration(Math.max(0, minutes(isoB) - minutes(isoA)));
}

function StatCard({ label, value, suffix, tone, icon }) {
  return (
    <div
      className={`min-h-[72px] min-w-0 flex flex-col items-center justify-center rounded-stat p-2.5 shadow-stat max-[760px]:px-2 max-[760px]:py-2.5 ${tone === "navy" ? "bg-brand-navy text-white" : tone === "lime" ? "bg-brand-lime text-brand-navy" : "border border-brand-navy/5 bg-white text-brand-navy"}`}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold opacity-80">
        <span className="grid h-[19px] w-[19px] flex-none place-items-center">
          {icon}
        </span>
        <span className="max-[350px]:hidden">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold leading-none tracking-[-0.05em] max-[760px]:text-[18px]">
        {value}
        {suffix && (
          <span className="ml-0.5 text-[10px] font-medium tracking-normal opacity-75">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function ControlButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-[14px] border border-transparent bg-[#f4f5f7] px-[11px] py-2.5 text-[11px] font-semibold text-brand-muted transition-all hover:bg-brand-orange hover:text-white max-[760px]:flex-1 max-[760px]:justify-center ${active ? "bg-brand-deep text-white shadow-[0_8px_18px_rgba(193,79,0,0.28)]" : ""}`}
    >
      {children}
      <span className="max-[350px]:hidden">{label}</span>
    </button>
  );
}

/* ── Main overview cards ─────────────────────────────────────────────────── */
function CurrentWeatherCard({ data, place, unit }) {
  const { current, daily, hourly } = data;
  const isDay = current.is_day !== 0;
  const info = weatherInfo(current.weather_code);
  const temp = useCountUp(toTemp(current.temperature_2m, unit));
  const pressure = Math.round(current.pressure_msl ?? 0);
  const visibility = hourly[0]?.visibility;
  const onDark = !isDay || info.category === "storm";
  const ink = contrastInk(onDark);

  return (
    <article
      className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden rounded-card p-[22px] shadow-card max-[760px]:min-h-[320px] max-[760px]:p-[18px] after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:content-[''] after:bg-[linear-gradient(90deg,var(--scrim-a)_0%,var(--scrim-b)_52%,transparent_100%)] animate-fade-up"
      style={{
        ...fade(50),
        "--scrim-a": onDark ? "rgba(8,14,30,0.62)" : "rgba(255,255,255,0.68)",
        "--scrim-b": onDark ? "rgba(8,14,30,0.26)" : "rgba(255,255,255,0.3)",
      }}
    >
      <CurrentWeatherScene category={info.category} isDay={isDay} />
      <div className="relative z-[2]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-white/80 text-brand-orange shadow-[0_6px_18px_rgba(28,43,69,0.1)]">
            <WeatherIcon code={current.weather_code} isDay={isDay} size={24} />
          </span>
          <div className="min-w-0">
            <p
              className={`text-base font-bold leading-[1.05] tracking-[-0.02em] ${ink.heading}`}
            >
              Weather
            </p>
            <p
              className={`mt-[2px] text-[11px] leading-[1.2] ${ink.body}`}
            >
              What&apos;s the weather.
            </p>
          </div>
          <span className="ml-auto max-w-[110px] flex-none truncate rounded-full bg-white/75 px-2.5 py-1.5 text-[10px] font-bold text-brand-navy max-[520px]:hidden">
            {String(place).split(",").slice(1).join(",").trim() || "Today"}
          </span>
        </div>

        <div className="mt-[30px] flex items-end gap-4 max-[760px]:mt-6">
          <div
            className={`text-[clamp(46px,4vw,62px)] font-bold leading-[0.86] tracking-[-0.065em] max-[520px]:text-[48px] ${ink.figure} ${ink.glow}`}
          >
            {temp ?? "--"}
            <span className="ml-0.5 text-[0.38em] tracking-[-0.02em]">
              °{unit}
            </span>
          </div>
          <div className="pb-0.5">
            <span className="inline-block rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-brand-navy shadow-[0_5px_14px_rgba(28,43,69,0.08)]">
              Low {toTemp(daily[0].min, unit)}°
            </span>
            <p className={`mt-2 text-sm font-bold ${ink.figure} ${ink.glow}`}>
              {info.label}
            </p>
            <p className={`mt-0.5 text-[10px] ${ink.body}`}>
              Feels like {toTemp(current.apparent_temperature, unit)}° · High{" "}
              {toTemp(daily[0].max, unit)}°
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-[2] mt-[18px] grid grid-cols-3 gap-2.5 max-[760px]:gap-[7px]">
        <StatCard
          label="Pressure"
          value={pressure || "--"}
          suffix="mb"
          tone="navy"
          icon={<Gauge size={16} strokeWidth={1.8} />}
        />
        <StatCard
          label="Visibility"
          value={visibility == null ? "--" : (visibility / 1000).toFixed(1)}
          suffix="km"
          tone="lime"
          icon={<Eye size={16} strokeWidth={1.8} />}
        />
        <StatCard
          label="Humidity"
          value={current.relative_humidity_2m ?? "--"}
          suffix="%"
          tone="white"
          icon={<Droplet size={16} strokeWidth={1.8} />}
        />
      </div>
    </article>
  );
}

const ZONES = [
  { label: "Good", color: "#34C759", max: 50 },
  { label: "Standard", color: "#FFB020", max: 150 },
  { label: "Hazardous", color: "#F04438", max: 300 },
];

// Maps an AQI value to a thumb position inside its own zone.
// Each zone takes 1/3 of the track so labels, segments and thumb always agree.
function getScale(aqi) {
  if (aqi == null) return { pos: 0, index: -1 };

  let prev = 0;
  for (let i = 0; i < ZONES.length; i++) {
    const { max } = ZONES[i];
    if (aqi <= max || i === ZONES.length - 1) {
      const frac = Math.min(Math.max((aqi - prev) / (max - prev), 0), 1);
      const raw = ((i + frac) / ZONES.length) * 100;
      return { pos: Math.min(Math.max(raw, 3), 97), index: i };
    }
    prev = max;
  }
  return { pos: 0, index: -1 };
}

function AirQualityCard({ air, loading, current, unit }) {
  const info = aqiInfo(air?.aqi);
  const category = aqiCategory(air?.aqi);
  const { pos, index } = getScale(air?.aqi);
  const activeZone = ZONES[index];
  const wind = toWind(current.wind_speed_10m, unit);
  // The sun bloom keeps this scene bright behind the copy in every AQI mood.
  const ink = contrastInk(false);

  return (
    <article
      className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden rounded-card p-[22px] shadow-card max-[760px]:min-h-[320px] max-[760px]:p-[18px] after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:content-[''] after:bg-[linear-gradient(180deg,rgba(28,43,69,0.08),transparent_52%,rgba(255,255,255,0.12))] animate-fade-up"
      style={fade(130)}
    >
      <AirQualityScene />

      <div className="relative z-[2]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-white/80 text-brand-sky shadow-[0_6px_18px_rgba(28,43,69,0.1)]">
            <Leaf size={22} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p
              className={`text-base font-bold leading-[1.05] tracking-[-0.02em] ${ink.heading}`}
            >
              Air Quality
            </p>
            <p className={`mt-[2px] text-[11px] leading-[1.2] ${ink.body}`}>
              Main pollutant: PM 2.5
            </p>
          </div>
          <span className="ml-auto max-w-[110px] flex-none truncate rounded-full bg-brand-lime px-2.5 py-1.5 text-[10px] font-bold text-brand-navy">
            {loading ? "Checking…" : category}
          </span>
        </div>

        <div className="mt-[30px] flex items-end gap-4 max-[760px]:mt-6">
          {loading ? (
            <>
              <OrbitSpinner className="h-[46px] w-[46px] flex-none text-brand-navy" />
              <div className={`flex flex-col gap-1 pb-1 text-[10px] ${ink.body}`}>
                <span className="text-[11px] font-bold tracking-[0.14em]">AQI</span>
                <span className="flex items-center gap-1.5">
                  Reading air quality <LoadingDots />
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                className={`text-[clamp(46px,4vw,62px)] font-bold leading-[0.86] tracking-[-0.065em] max-[520px]:text-[48px] ${ink.figure} [text-shadow:0_2px_10px_rgba(255,255,255,0.45)]`}
              >
                {air?.aqi ?? "--"}
              </div>
              <div className={`flex flex-col gap-0.5 pb-1 text-[10px] ${ink.body}`}>
                <span className="text-[11px] font-bold tracking-[0.14em]">AQI</span>
                <span>
                  {air?.pm25 != null
                    ? `${Math.round(air.pm25)} µg/m³ PM2.5`
                    : "Waiting for air quality data"}
                </span>
              </div>
            </>
          )}
        </div>

        <p
          className={`mt-3.5 flex max-w-[94%] items-center gap-1.5 text-[10px] max-[520px]:max-w-full ${ink.body}`}
        >
          <Wind size={16} strokeWidth={1.8} />
          {windDirection(current.wind_direction_10m)} wind · {wind ?? "--"}{" "}
          {speedLabel(unit)} · {info.note}
        </p>
      </div>

      <div className="relative z-[2] mt-3.5 rounded-[18px] bg-white p-3.5 shadow-[0_10px_24px_rgba(28,43,69,0.12)]">
        <div
          role="meter"
          aria-label="Air quality index"
          aria-valuemin={0}
          aria-valuemax={300}
          aria-valuenow={air?.aqi ?? undefined}
          aria-valuetext={category}
        >
          <div className="relative py-2">
            <div className="flex h-2 gap-1">
              {ZONES.map((z, i) => (
                <div
                  key={z.label}
                  className="h-full flex-1 transition-opacity duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    backgroundColor: z.color,
                    opacity: index === -1 ? 0.2 : i === index ? 1 : 0.35,
                  }}
                />
              ))}
            </div>

            {index !== -1 && (
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(28,43,69,0.35)] transition-[left,background-color] duration-[900ms] ease-out"
                style={{ left: `${pos}%`, backgroundColor: activeZone.color }}
              />
            )}
          </div>

          <div className="mt-1 grid grid-cols-3">
            {ZONES.map((z, i) => (
              <span
                key={z.label}
                className={`text-[10px] transition-colors ${
                  i === 0 ? "text-left" : i === 2 ? "text-right" : "text-center"
                } ${
                  i === index
                    ? "font-bold text-brand-navy"
                    : "font-medium text-brand-muted"
                }`}
              >
                {z.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Analytics ───────────────────────────────────────────────────────────── */
function TemperatureAnalytics({ hourly, unit }) {
  const [mode, setMode] = useState("temperature");
  const slots = useMemo(() => buildSlots(hourly, unit), [hourly, unit]);

  return (
    <section className="min-w-0 px-0.5 pt-1 animate-fade-up" style={fade(210)}>
      <div className="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
        <div>
          <h2 className="mt-1.5 text-[clamp(20px,2vw,27px)] font-bold leading-[1.15] tracking-[-0.045em]">
            How&apos;s the temperature today?
          </h2>
        </div>
        <div
          className="flex flex-none gap-[7px] max-[760px]:w-full"
          role="group"
          aria-label="Chart metric"
        >
          <ControlButton
            active={mode === "temperature"}
            label="Temperature"
            onClick={() => setMode("temperature")}
          >
            <Thermometer size={16} strokeWidth={1.8} />
          </ControlButton>
          <ControlButton
            active={mode === "rain"}
            label="Rain"
            onClick={() => setMode("rain")}
          >
            <CloudRain size={16} strokeWidth={1.8} />
          </ControlButton>
          <ControlButton
            active={mode === "wind"}
            label="Wind"
            onClick={() => setMode("wind")}
          >
            <Wind size={16} strokeWidth={1.8} />
          </ControlButton>
        </div>
      </div>
      <TemperatureChart slots={slots} mode={mode} unit={unit} />
    </section>
  );
}

function TomorrowCard({ daily, place, unit, onSelect }) {
  const tomorrow = daily[1] || daily[0];
  const info = weatherInfo(tomorrow.code);

  return (
    <article
      className="relative isolate min-h-[340px] overflow-hidden rounded-card bg-[linear-gradient(145deg,#f1f8c9,#e8f3b2)] p-[22px] shadow-card before:absolute before:inset-0 before:z-0 before:content-[''] before:bg-[repeating-linear-gradient(135deg,rgba(85,181,229,0.16)_0_2px,transparent_2px_21px)] max-[900px]:min-h-[280px] animate-fade-up"
      style={fade(270)}
    >
      <UmbrellaIllustration />
      <div className="relative z-[2] max-w-[64%] max-[520px]:max-w-[70%]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-text">
          Tomorrow
        </p>
        <h3 className="mt-2 text-[22px] font-bold leading-[1.1] tracking-[-0.045em]">
          {String(place).split(",")[0]},
          <br />
          forecast
        </h3>
        <p className="mt-3.5 text-[48px] font-bold leading-none tracking-[-0.065em]">
          {toTemp(tomorrow.max, unit)}°
        </p>
        <p className="mt-1.5 text-xs font-semibold">{info.label}</p>
        <p className="mt-0.5 text-[10px] text-brand-ink">
          Low {toTemp(tomorrow.min, unit)}° · {tomorrow.pop ?? 0}% rain
        </p>
        <button
          type="button"
          onClick={() => onSelect(1)}
          className="mt-4 inline-flex items-center gap-1.5 border-b border-brand-navy/25 pb-0.5 text-[11px] font-bold text-brand-navy"
        >
          View detailed forecast
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
      <span className="absolute bottom-4 left-[22px] z-[2] text-[10px] text-[#667253]">
        {longDayLabel(tomorrow.date)}
      </span>
    </article>
  );
}

/* ── Right information panel ─────────────────────────────────────────────── */
function InfoPanel({
  data,
  place,
  unit,
  utcOffsetSeconds,
  onSelect,
  onOpenFiveDay,
  onChangeLocation,
}) {
  const { current, daily } = data;
  const isDay = current.is_day !== 0;
  const uv = Math.round(daily[0].uv ?? 0);

  return (
    <aside
      className="grid w-full min-w-0 grid-cols-1 gap-4 rounded-2xl bg-brand-grey p-3 shadow-[inset_0_1px_0_#fff] animate-fade-up sm:rounded-[24px] sm:p-[18px] md:grid-cols-2 md:items-stretch lg:flex lg:flex-col lg:rounded-[28px]"
      style={fade(90)}
      aria-label="Current weather information"
    >
      {/* Left column */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {/* Location + temperature card */}
        <div className="flex w-full min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-white/65 p-3 shadow-[0_4px_14px_rgba(28,43,69,0.04)] sm:p-4">
          <div className="w-full min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-text">
              {conditionName(current.weather_code, isDay)}
            </p>

            <button
              type="button"
              className="mt-1.5 flex w-full min-w-0 items-center gap-1.5 text-left text-lg font-bold tracking-tight"
              onClick={onChangeLocation}
            >
              <span className="min-w-0 truncate">{place}</span>
              <ChevronDown size={15} strokeWidth={2} className="shrink-0" />
            </button>

            <p className="mt-1 text-[10px] text-brand-muted">
              {localDate(utcOffsetSeconds)}
            </p>
          </div>

          <div className="shrink-0 text-[clamp(30px,5vw,38px)] font-bold leading-none tracking-tight text-brand-text">
            {toTemp(current.temperature_2m, unit)}
            <span className="ml-px text-[0.44em]">°{unit}</span>
          </div>
        </div>

        {/* Sunrise + UV card */}
        <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl bg-white/65 p-3 shadow-[0_4px_14px_rgba(28,43,69,0.04)] sm:p-4 xl:bg-transparent xl:p-0 xl:shadow-none">
          <div className="w-full min-w-0 overflow-hidden">
            <div className="w-full min-w-0">
              <SunPath sunrise={daily[0].sunrise} sunset={daily[0].sunset} />
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-2xl bg-brand-navy p-3 text-white shadow-[0_12px_26px_rgba(28,43,69,0.2)] sm:p-4">
            <span className="row-span-2 grid h-12 w-12 shrink-0 place-items-center rounded-full text-brand-orange">
              <Sun size={40} strokeWidth={1.8} />
            </span>

            <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2">
              <strong className="text-xl font-bold leading-none">
                {uv} UVI
              </strong>

              <span className="whitespace-nowrap rounded-full bg-brand-lime px-2 py-1 text-[10px] font-bold text-brand-navy">
                {uvLabel(uv)}
              </span>
            </div>

            <p className="w-full min-w-0 text-[10px] text-white/65">
              {uv >= 6
                ? "Use SPF 50+ protection outdoors."
                : "Low to moderate UV exposure."}
            </p>
          </div>
        </div>
      </div>

      {/* Right column: 5-day forecast */}
      <div className="flex w-full min-w-0 flex-col rounded-2xl bg-white/65 p-3 shadow-[0_4px_14px_rgba(28,43,69,0.04)] sm:p-4 xl:bg-transparent xl:p-0 xl:shadow-none">
        <div className="mb-3 flex w-full min-w-0 items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Weather Prediction
            </h3>
            <p className="mt-0.5 text-[10px] text-brand-muted">
              Daily forecast
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-brand-grey px-2.5 py-1 text-[10px] font-semibold text-brand-muted">
            Next 5 days
          </span>
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
          {daily.slice(0, 5).map((day, i) => (
            <button
              type="button"
              key={day.date}
              onClick={() => onSelect(i)}
              className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-left shadow-[0_6px_18px_rgba(28,43,69,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(28,43,69,0.1)] sm:rounded-2xl sm:px-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#eaf7f5] to-[#eaf3fa] text-brand-sky">
                <WeatherIcon code={day.code} size={22} />
              </span>

              <span className="flex w-full min-w-0 flex-col gap-0.5">
                <strong className="text-xs font-bold">
                  {dayLabel(day.date)}
                </strong>

                <small className="truncate text-[10px] text-brand-muted">
                  {weatherInfo(day.code).label}
                </small>
              </span>

              <span className="flex shrink-0 flex-col items-end gap-0.5">
                <strong className="text-[13px] font-bold">
                  {toTemp(day.max, unit)}°
                </strong>

                <small className="text-[10px] text-brand-muted">
                  {toTemp(day.min, unit)}°
                </small>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenFiveDay}
          className="mt-3 flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-brand-deep p-2.5 text-xs font-bold text-white shadow-orange transition-transform hover:-translate-y-0.5"
        >
          <CalendarDays size={16} strokeWidth={1.8} />
          Next 5 Days
        </button>
      </div>
    </aside>
  );
}

/* ── Five day overview modal ─────────────────────────────────────────────── */
function FiveDayModal({ days, place, unit, onSelect, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-navy/45 p-3 backdrop-blur-[4px] animate-fade-in sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Next 5 days forecast"
        onClick={(event) => event.stopPropagation()}
        className="my-auto max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(28,43,69,0.25)] animate-scale-in sm:rounded-[28px] sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-text">
              {String(place).split(",")[0]}
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.045em] text-brand-navy sm:text-[28px]">
              Next 5 days
            </h2>
            <p className="mt-1 text-[11px] text-brand-muted">
              Pick a day for the full hourly forecast.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 5 day forecast"
            className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-grey text-brand-muted transition-all hover:bg-slate-100 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/40"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {days.map(({ day, index }) => (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(index)}
              className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-slate-100 bg-[#F7F9FA] p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-mint hover:bg-white hover:shadow-card sm:p-3"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#eaf7f5] to-[#eaf3fa] text-brand-sky">
                <WeatherIcon code={day.code} size={25} />
              </span>

              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-sm font-bold text-brand-navy">
                  {dayLabel(day.date)}
                  <span className="ml-1.5 text-[10px] font-medium text-brand-muted">
                    {longDayLabel(day.date).split(",")[1]?.trim() || ""}
                  </span>
                </strong>
                <small className="truncate text-[10px] text-brand-muted">
                  {weatherInfo(day.code).label} · {day.pop ?? 0}% rain
                </small>
              </span>

              <span className="flex shrink-0 items-center gap-2">
                <span className="text-right text-[13px] font-bold text-brand-navy">
                  {toTemp(day.max, unit)}°
                  <span className="ml-1 text-[10px] font-medium text-brand-muted">
                    {toTemp(day.min, unit)}°
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  strokeWidth={2}
                  className="shrink-0 text-brand-muted"
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Forecast detail modal ───────────────────────────────────────────────── */
function DayDetailModal({
  day,
  allHours,
  rollingHours,
  todayDate,
  unit,
  utcOffsetSeconds,
  onClose,
}) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isToday = day.date === todayDate;
  // Today rolls into tomorrow (e.g. 10pm still shows the next 24 hours);
  // future days show their complete calendar day.
  const hours =
    isToday && rollingHours.length
      ? rollingHours
      : allHours.filter((h) => h.time.slice(0, 10) === day.date);
  const details = [
    { label: "UV index", value: `${Math.round(day.uv ?? 0)}` },
    { label: "Rain chance", value: `${day.pop ?? 0}%` },
    {
      label: "Max wind",
      value: `${toWind(day.maxWind, unit) ?? "--"} ${speedLabel(unit)}`,
    },
    { label: "Daylight", value: daylight(day.sunrise, day.sunset) },
    { label: "Sunrise", value: clockLabel(day.sunrise) },
    { label: "Sunset", value: clockLabel(day.sunset) },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-navy/45 p-3 backdrop-blur-[4px] animate-fade-in sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${longDayLabel(day.date)}`}
        onClick={(event) => event.stopPropagation()}
        className="my-auto max-h-[90dvh] w-full max-w-[680px] overflow-y-auto rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(28,43,69,0.25)] animate-scale-in sm:rounded-[28px] sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-text">
              {longDayLabel(day.date)}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <WeatherIcon code={day.code} size={48} />

              <p className="text-[38px] font-bold leading-none tracking-[-0.065em] text-brand-navy min-[400px]:text-[42px]">
                {toTemp(day.max, unit)}°
                <span className="ml-1.5 text-xl font-medium tracking-tight text-brand-muted">
                  / {toTemp(day.min, unit)}°
                </span>
              </p>
            </div>

            <p className="mt-2 text-[13px] font-medium text-brand-muted">
              {weatherInfo(day.code).label}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-grey text-brand-muted transition-all hover:bg-slate-100 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text/40"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Hourly forecast */}
        {hours.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-brand-navy">
                Hourly forecast
              </h3>

              <span className="text-[10px] text-brand-muted max-[400px]:hidden">
                {isToday ? "Next 24 hours" : "Throughout the day"}
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto rounded-[18px] border border-slate-100 bg-[#F7F9FA] p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hours.map((hour) => (
                <div
                  key={hour.time}
                  className="flex w-14 flex-none flex-col items-center gap-2 rounded-xl py-2 transition-colors hover:bg-white"
                >
                  <span className="text-[9px] font-medium text-brand-muted">
                    {hourLabel(hour.time)}
                  </span>

                  <WeatherIcon
                    code={hour.code}
                    isDay={
                      hour.time.slice(11, 13) >= "06" &&
                      hour.time.slice(11, 13) < "19"
                    }
                    size={22}
                  />

                  <strong className="text-xs font-bold text-brand-navy">
                    {toTemp(hour.temp, unit)}°
                  </strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather details */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-brand-navy">
              Weather details
            </h3>

            <span className="text-[10px] text-brand-muted max-[400px]:hidden">
              Daily conditions
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="min-w-0 rounded-[15px] border border-slate-100 bg-[#F7F9FA] p-3 transition-colors hover:bg-white"
              >
                <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.09em] text-brand-muted">
                  {detail.label}
                </span>

                <strong className="mt-1.5 block truncate text-base font-bold tracking-tight text-brand-navy">
                  {detail.value}
                </strong>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-center text-[10px] text-brand-muted">
            Times shown in UTC
            {utcOffsetSeconds >= 0 ? "+" : ""}
            {(utcOffsetSeconds / 3600).toFixed(1)}h
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Assembled dashboard ─────────────────────────────────────────────────── */
export default function Dashboard({
  data,
  place,
  unit,
  utcOffsetSeconds,
  onChangeLocation,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [fiveDayOpen, setFiveDayOpen] = useState(false);
  const { air, loading: airLoading } = useAirQuality(data.location);
  const fiveDays = data.daily
    .slice(0, 5)
    .map((day, i) => ({ day, index: i }));

  useEffect(() => {
    setSelectedDay(null);
    setFiveDayOpen(false);
  }, [data]);

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,2.85fr)_minmax(0,1fr)] gap-[22px] rounded-[32px] border border-white bg-white p-[22px] shadow-panel max-[760px]:rounded-[26px] max-[760px]:p-3.5 animate-fade-in">
        <div className="min-w-0 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-[18px] max-[760px]:grid-cols-1">
            <CurrentWeatherCard data={data} place={place} unit={unit} />
            <AirQualityCard
              air={air}
              loading={airLoading}
              current={data.current}
              unit={unit}
            />
          </div>
          <div className="mt-[18px] grid grid-cols-[minmax(0,1.7fr)_minmax(250px,0.9fr)] items-stretch gap-[18px] max-[900px]:grid-cols-1">
            <TemperatureAnalytics hourly={data.hourly} unit={unit} />
            <TomorrowCard
              daily={data.daily}
              place={place}
              unit={unit}
              onSelect={setSelectedDay}
            />
          </div>
        </div>
        <InfoPanel
          data={data}
          place={place}
          unit={unit}
          utcOffsetSeconds={utcOffsetSeconds}
          onSelect={setSelectedDay}
          onOpenFiveDay={() => setFiveDayOpen(true)}
          onChangeLocation={onChangeLocation}
        />
      </div>

      {fiveDayOpen && (
        <FiveDayModal
          days={fiveDays}
          place={place}
          unit={unit}
          onSelect={(index) => {
            setFiveDayOpen(false);
            setSelectedDay(index);
          }}
          onClose={() => setFiveDayOpen(false)}
        />
      )}

      {selectedDay !== null && data.daily[selectedDay] && (
        <DayDetailModal
          day={data.daily[selectedDay]}
          allHours={data.allHours}
          rollingHours={data.hourly}
          todayDate={data.daily[0]?.date}
          unit={unit}
          utcOffsetSeconds={utcOffsetSeconds}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
