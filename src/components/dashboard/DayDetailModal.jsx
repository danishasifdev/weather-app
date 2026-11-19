/* eslint-disable react/prop-types */
import {
  clockLabel,
  longDayLabel,
  speedLabel,
  toTemp,
  toWind,
  weatherInfo,
} from "../../lib/weather";
import WeatherIcon from "../WeatherIcon";
import { DetailTile, HourChip, Modal, SectionHeader } from "../ui";
import { daylight } from "./utils";

export default function DayDetailModal({
  day,
  allHours,
  rollingHours,
  todayDate,
  unit,
  utcOffsetSeconds,
  onClose,
}) {
  const isToday = day.date === todayDate;
  // Today rolls into tomorrow; future days show their complete calendar day.
  const hours =
    isToday && rollingHours.length
      ? rollingHours
      : allHours.filter((hour) => hour.time.slice(0, 10) === day.date);

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
    <Modal
      label={`Details for ${longDayLabel(day.date)}`}
      kicker={longDayLabel(day.date)}
      closeLabel="Close details"
      size="day"
      onClose={onClose}
    >
      <div className="mt-3 flex items-center gap-3">
        <WeatherIcon code={day.code} size={48} />
        <p className="text-brand-navy text-[38px] leading-none font-bold tracking-[-0.065em] min-[400px]:text-[42px]">
          {toTemp(day.max, unit)}°
          <span className="text-brand-muted ml-1.5 text-xl font-medium tracking-tight">
            / {toTemp(day.min, unit)}°
          </span>
        </p>
      </div>
      <p className="text-13px text-brand-muted mt-2 font-medium">{weatherInfo(day.code).label}</p>

      {hours.length > 0 && (
        <section className="mt-6">
          <SectionHeader
            title="Hourly forecast"
            hint={isToday ? "Next 24 hours" : "Throughout the day"}
          />
          <div className="rounded-forecast flex scrollbar-none gap-1.5 overflow-x-auto border border-slate-100 bg-[#F7F9FA] p-2.5 [&::-webkit-scrollbar]:hidden">
            {hours.map((hour) => (
              <HourChip key={hour.time} hour={hour} unit={unit} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-5">
        <SectionHeader title="Weather details" hint="Daily conditions" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {details.map((detail) => (
            <DetailTile key={detail.label} {...detail} />
          ))}
        </div>
      </section>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-10px text-brand-muted text-center">
          Times shown in UTC
          {utcOffsetSeconds >= 0 ? "+" : ""}
          {(utcOffsetSeconds / 3600).toFixed(1)}h
        </p>
      </div>
    </Modal>
  );
}
