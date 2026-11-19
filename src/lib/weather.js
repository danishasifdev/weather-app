// Weather codes, formatting helpers and API access for Open-Meteo.

const WMO = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"],
  48: ["Icy fog", "fog"],
  51: ["Light drizzle", "rain"],
  53: ["Drizzle", "rain"],
  55: ["Heavy drizzle", "rain"],
  56: ["Freezing drizzle", "rain"],
  57: ["Heavy freezing drizzle", "rain"],
  61: ["Light rain", "rain"],
  63: ["Rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"],
  67: ["Heavy freezing rain", "rain"],
  71: ["Light snow", "snow"],
  73: ["Snow", "snow"],
  75: ["Heavy snow", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Light showers", "rain"],
  81: ["Showers", "rain"],
  82: ["Heavy showers", "rain"],
  85: ["Snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm with hail", "storm"],
  99: ["Severe thunderstorm", "storm"],
};

export function weatherInfo(code) {
  const [label, category] = WMO[code] || ["Unknown", "clear"];
  return { label, category };
}

export function dayLabel(iso) {
  if (new Date(iso).toDateString() === new Date().toDateString())
    return "Today";
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
    new Date(iso),
  );
}

export function longDayLabel(iso) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function hourLabel(iso) {
  const h = Number(String(iso).slice(11, 13));
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function shortHourLabel(iso) {
  const h = Number(String(iso).slice(11, 13));
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

export function clockLabel(iso) {
  if (!iso) return "—";
  const [h, m] = String(iso).slice(11, 16).split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${suffix}`;
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function localTime(offsetSeconds = 0) {
  return new Date(Date.now() + offsetSeconds * 1000);
}

export function localClock(offsetSeconds = 0) {
  const d = localTime(offsetSeconds);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${suffix}`;
}

export function localDate(offsetSeconds = 0) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(localTime(offsetSeconds));
}

export function timeUntil(date, offsetSeconds = 0) {
  const diff = date - localTime(offsetSeconds);
  if (diff <= 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "moments ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function windDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((deg || 0) / 45) % 8];
}

export function toTemp(celsius, unit) {
  if (celsius == null || Number.isNaN(celsius)) return null;
  return Math.round(unit === "F" ? celsius * 1.8 + 32 : celsius);
}

export function toWind(kmh, unit) {
  if (kmh == null || Number.isNaN(kmh)) return null;
  return Math.round(unit === "F" ? kmh * 0.621371 : kmh);
}

export const unitLabel = (unit) => (unit === "F" ? "°F" : "°C");
export const speedLabel = (unit) => (unit === "F" ? "mph" : "km/h");

export const DEFAULT_LOCATION = {
  name: "Islamabad",
  country: "Pakistan",
  admin1: "",
  latitude: 33.6844,
  longitude: 73.0479,
  timezone: "Asia/Karachi",
};

export function locationLabel(loc) {
  if (!loc) return "";
  return [
    loc.name,
    loc.admin1 && loc.admin1 !== loc.name ? loc.admin1 : null,
    loc.country,
  ]
    .filter(Boolean)
    .join(", ");
}

async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Service unavailable (${res.status}).`);
  return res.json();
}

export async function searchLocations(name, signal) {
  const params = new URLSearchParams({
    name,
    count: "6",
    language: "en",
    format: "json",
  });
  const data = await getJSON(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    signal,
  );
  return (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1 || "",
    country: r.country || "",
    countryCode: r.country_code || "",
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || "auto",
  }));
}

export async function fetchForecast({ latitude, longitude, signal }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
    hourly:
      "temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,visibility,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const data = await getJSON(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );

  if (!data.current || !data.daily?.time?.length) {
    throw new Error("The weather service returned an incomplete response.");
  }

  const hourly = data.hourly || {};
  const currentHour = `${String(data.current.time).slice(0, 13)}:00`;
  const times = hourly.time || [];
  const start = Math.max(0, times.indexOf(currentHour));

  // Full hourly series (per calendar day) plus a rolling 24h window for the chart.
  // Keeping both means a day popup shows all 24 hours even late at night.
  const allHours = times.map((time, i) => ({
    time,
    temp: hourly.temperature_2m?.[i] ?? null,
    code: hourly.weather_code?.[i] ?? 0,
    pop: hourly.precipitation_probability?.[i] ?? 0,
    humidity: hourly.relative_humidity_2m?.[i] ?? null,
    visibility: hourly.visibility?.[i] ?? null,
    wind: hourly.wind_speed_10m?.[i] ?? null,
  }));

  return {
    location: {
      latitude,
      longitude,
      timezone: data.timezone || "auto",
    },
    utcOffsetSeconds: data.utc_offset_seconds || 0,
    current: data.current,
    hourly: allHours.slice(start, start + 24),
    allHours,
    daily: data.daily.time.map((date, i) => ({
      date,
      code: data.daily.weather_code?.[i] ?? 0,
      max: data.daily.temperature_2m_max?.[i] ?? 0,
      min: data.daily.temperature_2m_min?.[i] ?? 0,
      maxWind: data.daily.wind_speed_10m_max?.[i] ?? 0,
      pop: data.daily.precipitation_probability_max?.[i] ?? 0,
      uv: data.daily.uv_index_max?.[i] ?? 0,
      sunrise: data.daily.sunrise?.[i],
      sunset: data.daily.sunset?.[i],
    })),
  };
}

export function aqiInfo(aqi) {
  if (aqi == null) return { label: "Unavailable", tone: "#94a3b8", note: "Air quality data is not available." };
  if (aqi <= 50) return { label: "Good", tone: "#86c98f", note: "Air quality is satisfactory." };
  if (aqi <= 100) return { label: "Standard", tone: "#d4cf62", note: "Acceptable for most people." };
  if (aqi <= 150) return { label: "Sensitive", tone: "#e0a34b", note: "Sensitive groups should take care." };
  if (aqi <= 200) return { label: "Poor", tone: "#e0795c", note: "Consider limiting outdoor activity." };
  return { label: "Hazardous", tone: "#c25a72", note: "Avoid prolonged outdoor activity." };
}

export async function fetchAirQuality({ latitude, longitude, signal }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "us_aqi,pm2_5",
    timezone: "auto",
  });
  const data = await getJSON(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    signal,
  );
  const current = data.current || {};
  return {
    aqi: current.us_aqi ?? null,
    pm25: current.pm2_5 ?? null,
  };
}
