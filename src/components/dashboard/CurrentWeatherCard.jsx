/* eslint-disable react/prop-types */
import { Droplet, Eye, Gauge } from "lucide-react";
import { toTemp, weatherInfo } from "../../lib/weather";
import { CurrentWeatherScene } from "../Illustrations";
import WeatherIcon from "../WeatherIcon";
import { CardHeader, MetricRow, Pill, SceneCard, StatCard } from "../ui";
import { contrastInk, fade, useCountUp } from "./utils";

export default function CurrentWeatherCard({ data, place, unit }) {
  const { current, daily, hourly } = data;
  const isDay = current.is_day !== 0;
  const info = weatherInfo(current.weather_code);
  const temp = useCountUp(toTemp(current.temperature_2m, unit));
  const visibility = hourly[0]?.visibility;
  const onDark = !isDay || info.category === "storm";
  const ink = contrastInk(onDark);
  const scrim = onDark
    ? "linear-gradient(90deg, rgba(8,14,30,0.62) 0%, rgba(8,14,30,0.26) 52%, transparent 100%)"
    : "linear-gradient(90deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.3) 52%, transparent 100%)";

  const stats = [
    {
      label: "Pressure",
      value: Math.round(current.pressure_msl ?? 0) || "--",
      suffix: "mb",
      tone: "navy",
      icon: <Gauge size={16} strokeWidth={1.8} />,
    },
    {
      label: "Visibility",
      value: visibility == null ? "--" : (visibility / 1000).toFixed(1),
      suffix: "km",
      tone: "lime",
      icon: <Eye size={16} strokeWidth={1.8} />,
    },
    {
      label: "Humidity",
      value: current.relative_humidity_2m ?? "--",
      suffix: "%",
      tone: "white",
      icon: <Droplet size={16} strokeWidth={1.8} />,
    },
  ];

  return (
    <SceneCard weather scrim={scrim} style={fade(50)}>
      <CurrentWeatherScene category={info.category} isDay={isDay} />

      <div className="relative z-2">
        <CardHeader
          icon={<WeatherIcon code={current.weather_code} isDay={isDay} size={24} />}
          title="Weather"
          ink={ink}
          badge={
            <Pill className="max-[520px]:hidden">
              {String(place).split(",").slice(1).join(",").trim() || "Today"}
            </Pill>
          }
        />

        <MetricRow>
          <div
            className={`text-[clamp(46px,4vw,62px)] leading-[0.86] font-bold tracking-[-0.065em] max-[520px]:text-[48px] ${ink.figure} ${ink.glow}`}
          >
            {temp ?? "--"}
            <span className="ml-0.5 text-[0.38em] tracking-[-0.02em]">°{unit}</span>
          </div>
          <div className="pb-0.5">
            <span className="text-10px text-brand-navy inline-block rounded-full bg-white px-2.5 py-1.5 font-bold shadow-[0_5px_14px_rgba(28,43,69,0.08)]">
              Low {toTemp(daily[0].min, unit)}°
            </span>
            <p className={`mt-2 text-sm font-bold ${ink.figure} ${ink.glow}`}>{info.label}</p>
            <p className={`text-10px mt-0.5 ${ink.body}`}>
              Feels like {toTemp(current.apparent_temperature, unit)}° · High{" "}
              {toTemp(daily[0].max, unit)}°
            </p>
          </div>
        </MetricRow>
      </div>

      <div className="relative z-2 mt-4.5 grid grid-cols-3 gap-2.5 max-[760px]:gap-2">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </SceneCard>
  );
}
