import { useEffect, useRef, useState } from "react";
import { fetchAirQuality, formatDuration, toTemp, weatherInfo } from "../../lib/weather";

export function useCountUp(value, duration = 750) {
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
      const next = Math.round(from + (value - from) * (1 - (1 - progress) ** 3));
      fromRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

export function useAirQuality(location) {
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null) return undefined;
    const controller = new AbortController();
    setLoading(true);
    fetchAirQuality({ latitude, longitude, signal: controller.signal })
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
  }, [latitude, longitude]);

  return { air, loading };
}

export const fade = (delay) => ({ animationDelay: `${delay}ms` });

const DAY_SLOTS = [
  ["Morning", 8],
  ["Afternoon", 14],
  ["Evening", 18],
  ["Night", 22],
];

export function buildSlots(hourly, unit) {
  return DAY_SLOTS.map(([label, hour]) => {
    const item =
      hourly.find((h) => Number(h.time.slice(11, 13)) >= hour) || hourly[hourly.length - 1];
    return {
      label,
      temp: toTemp(item?.temp, unit),
      code: item?.code ?? 0,
      pop: item?.pop ?? 0,
      wind: item?.wind ?? null,
    };
  });
}

export function conditionName(code, isDay) {
  const { label, category } = weatherInfo(code);
  if (category === "clear") return isDay ? "Sun" : "Clear night";
  if (category === "partly") return "Partly cloudy";
  if (category === "cloudy") return "Cloudy";
  return label;
}

export function uvLabel(uv) {
  if (uv >= 11) return "Extreme";
  if (uv >= 8) return "Very high";
  if (uv >= 6) return "High";
  if (uv >= 3) return "Moderate";
  return "Low";
}

export function aqiCategory(aqi) {
  if (aqi == null) return "-";
  if (aqi <= 50) return "Good";
  if (aqi <= 150) return "Standard";
  return "Hazardous";
}

export function contrastInk(onDark) {
  return {
    heading: onDark ? "text-white" : "text-[#111111]",
    body: onDark ? "text-white/80" : "text-[#4A5568]",
    figure: onDark ? "text-white" : "text-brand-navy",
    glow: onDark ? "[text-shadow:0_3px_14px_rgba(8,14,30,0.5)]" : "",
  };
}

export function daylight(isoA, isoB) {
  const minutes = (iso) => {
    const [h, m] = String(iso || "00:00")
      .slice(11, 16)
      .split(":")
      .map(Number);
    return h * 60 + m;
  };
  return formatDuration(Math.max(0, minutes(isoB) - minutes(isoA)));
}

export const ZONES = [
  { label: "Good", color: "#34C759", max: 50 },
  { label: "Standard", color: "#FFB020", max: 150 },
  { label: "Hazardous", color: "#F04438", max: 300 },
];

export function getScale(aqi) {
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
