/* eslint-disable react/prop-types */
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import { weatherInfo } from "../lib/weather";

/** Ordered lookup rules: first matching condition wins. */
const ICON_RULES = [
  ["clear", (day) => (day ? Sun : Moon)],
  ["partly", (day) => (day ? CloudSun : CloudMoon)],
  ["cloudy", () => Cloud],
  ["fog", () => CloudFog],
  ["rain", () => CloudRain],
  ["snow", () => CloudSnow],
  ["storm", () => CloudLightning],
];

/** Weather condition glyphs backed by lucide-react. */
export default function WeatherIcon({
  code,
  isDay = true,
  size = 28,
  className = "",
  strokeWidth = 1.8,
}) {
  const { category } = weatherInfo(code);
  const Icon = ICON_RULES.find(([key]) => key === category)?.[1](isDay) || Cloud;

  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
