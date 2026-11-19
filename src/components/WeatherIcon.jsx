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

/** Weather condition glyphs backed by lucide-react. */
export default function WeatherIcon({
  code,
  isDay = true,
  size = 28,
  className = "",
  strokeWidth = 1.8,
}) {
  const { category } = weatherInfo(code);

  let Icon = Cloud;
  if (category === "clear") Icon = isDay ? Sun : Moon;
  else if (category === "partly") Icon = isDay ? CloudSun : CloudMoon;
  else if (category === "cloudy") Icon = Cloud;
  else if (category === "fog") Icon = CloudFog;
  else if (category === "rain") Icon = CloudRain;
  else if (category === "snow") Icon = CloudSnow;
  else if (category === "storm") Icon = CloudLightning;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
