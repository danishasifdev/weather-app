/* eslint-disable react/prop-types */
import { CalendarDays, ChevronDown, Sun } from "lucide-react";
import { localDate, toTemp } from "../../lib/weather";
import { SunPath } from "../Charts";
import { Button, ForecastRow, Kicker, Pill } from "../ui";
import { conditionName, fade, uvLabel } from "./utils";

const INFO_PANEL =
  "bg-brand-grey animate-fade-up grid w-full min-w-0 grid-cols-1 gap-4 rounded-2xl p-3 shadow-[inset_0_1px_0_#fff] sm:rounded-[24px] sm:p-4.5 md:grid-cols-2 md:items-stretch lg:flex lg:flex-col lg:rounded-[28px]";
const INFO_STACK =
  "flex w-full min-w-0 flex-col gap-3 rounded-2xl bg-white/65 p-3 shadow-[0_4px_14px_rgba(28,43,69,0.04)] sm:p-4 xl:bg-transparent xl:p-0 xl:shadow-none";

export default function InfoPanel({
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
    <aside className={INFO_PANEL} style={fade(90)} aria-label="Current weather information">
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="flex w-full min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-white/65 p-3 shadow-[0_4px_14px_rgba(28,43,69,0.04)] sm:p-4">
          <div className="w-full min-w-0">
            <Kicker>{conditionName(current.weather_code, isDay)}</Kicker>
            <button
              type="button"
              className="mt-1.5 flex w-full min-w-0 items-center gap-1.5 text-left text-lg font-bold tracking-tight"
              onClick={onChangeLocation}
            >
              <span className="min-w-0 truncate">{place}</span>
              <ChevronDown size={15} strokeWidth={2} className="shrink-0" />
            </button>
            <p className="text-10px text-brand-muted mt-1">{localDate(utcOffsetSeconds)}</p>
          </div>
          <div className="text-brand-text shrink-0 text-[clamp(30px,5vw,38px)] leading-none font-bold tracking-tight">
            {toTemp(current.temperature_2m, unit)}
            <span className="ml-px text-[0.44em]">°{unit}</span>
          </div>
        </div>

        <div className={INFO_STACK}>
          <SunPath sunrise={daily[0].sunrise} sunset={daily[0].sunset} />

          <div className="bg-brand-navy grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-2xl p-3 text-white shadow-[0_12px_26px_rgba(28,43,69,0.2)] sm:p-4">
            <span className="text-brand-orange row-span-2 grid h-12 w-12 shrink-0 place-items-center rounded-full">
              <Sun size={40} strokeWidth={1.8} />
            </span>
            <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2">
              <strong className="text-xl leading-none font-bold">{uv} UVI</strong>
              <Pill tone="lime">{uvLabel(uv)}</Pill>
            </div>
            <p className="text-10px w-full min-w-0 text-white/65">
              {uv >= 6 ? "Use SPF 50+ protection outdoors." : "Low to moderate UV exposure."}
            </p>
          </div>
        </div>
      </div>

      <div className={INFO_STACK}>
        <div className="mb-3 flex w-full min-w-0 items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-bold tracking-tight">Weather Prediction</h3>
            <p className="text-10px text-brand-muted mt-0.5">Daily forecast</p>
          </div>
          <Pill tone="grey">Next 5 days</Pill>
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
          {daily.slice(0, 4).map((day, index) => (
            <ForecastRow key={day.date} day={day} unit={unit} onSelect={() => onSelect(index)} />
          ))}
        </div>

        <Button wide onClick={onOpenFiveDay}>
          <CalendarDays size={16} strokeWidth={1.8} />
          Next 5 Days
        </Button>
      </div>
    </aside>
  );
}
