/* eslint-disable react/prop-types */
import { Leaf, Wind } from "lucide-react";
import { aqiInfo, speedLabel, toWind, windDirection } from "../../lib/weather";
import { AirQualityScene } from "../Illustrations";
import { LoadingDots, OrbitSpinner } from "../States";
import { CardHeader, MetricRow, Pill, SceneCard } from "../ui";
import { aqiCategory, contrastInk, fade, getScale, ZONES } from "./utils";

export default function AirQualityCard({ air, loading, current, unit }) {
  const info = aqiInfo(air?.aqi);
  const category = aqiCategory(air?.aqi);
  const { pos, index } = getScale(air?.aqi);
  const activeZone = ZONES[index];
  const wind = toWind(current.wind_speed_10m, unit);
  // The sun bloom keeps this scene bright behind the copy in every AQI mood.
  const ink = contrastInk(false);

  return (
    <SceneCard style={fade(130)}>
      <AirQualityScene />

      <div className="relative z-2">
        <CardHeader
          icon={<Leaf size={22} strokeWidth={1.8} />}
          title="Air Quality"
          subtitle="Main pollutant: PM 2.5"
          tone="sky"
          ink={ink}
          badge={<Pill tone="lime">{loading ? "Checking…" : category}</Pill>}
        />

        <MetricRow>
          {loading ? (
            <>
              <OrbitSpinner className="text-brand-navy h-11.5 w-11.5 flex-none" />
              <div className={`text-10px flex flex-col gap-1 pb-1 ${ink.body}`}>
                <span className="text-11px font-bold tracking-[0.14em]">AQI</span>
                <span className="flex items-center gap-1.5">
                  Reading air quality <LoadingDots />
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                className={`text-[clamp(46px,4vw,62px)] leading-[0.86] font-bold tracking-[-0.065em] max-[520px]:text-[48px] ${ink.figure} [text-shadow:0_2px_10px_rgba(255,255,255,0.45)]`}
              >
                {air?.aqi ?? "--"}
              </div>
              <div className={`text-10px flex flex-col gap-0.5 pb-1 ${ink.body}`}>
                <span className="text-11px font-bold tracking-[0.14em]">AQI</span>
                <span>
                  {air?.pm25 != null
                    ? `${Math.round(air.pm25)} µg/m³ PM2.5`
                    : "Waiting for air quality data"}
                </span>
              </div>
            </>
          )}
        </MetricRow>

        <p
          className={`text-10px mt-3.5 flex max-w-[94%] items-center gap-1.5 max-[520px]:max-w-full ${ink.body}`}
        >
          <Wind size={16} strokeWidth={1.8} />
          {windDirection(current.wind_direction_10m)} wind · {wind ?? "--"} {speedLabel(unit)} ·{" "}
          {info.note}
        </p>
      </div>

      <div className="rounded-forecast relative z-2 mt-3.5 bg-white p-3.5 shadow-[0_10px_24px_rgba(28,43,69,0.12)]">
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
              {ZONES.map((zone, i) => (
                <div
                  key={zone.label}
                  className="h-full flex-1 transition-opacity duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    backgroundColor: zone.color,
                    opacity: index === -1 ? 0.2 : i === index ? 1 : 0.35,
                  }}
                />
              ))}
            </div>

            {index !== -1 && (
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(28,43,69,0.35)] transition-[left,background-color] duration-900 ease-out"
                style={{ left: `${pos}%`, backgroundColor: activeZone.color }}
              />
            )}
          </div>

          <div className="mt-1 grid grid-cols-3">
            {ZONES.map((zone, i) => (
              <span
                key={zone.label}
                className={`text-10px transition-colors ${
                  i === 0 ? "text-left" : i === 2 ? "text-right" : "text-center"
                } ${i === index ? "text-brand-navy font-bold" : "text-brand-muted font-medium"}`}
              >
                {zone.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SceneCard>
  );
}
