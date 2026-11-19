/* eslint-disable react/prop-types */
import { ChevronRight } from "lucide-react";
import { longDayLabel, toTemp, weatherInfo } from "../../lib/weather";
import { UmbrellaIllustration } from "../Illustrations";
import { Kicker } from "../ui";
import { fade } from "./utils";

export default function TomorrowCard({ daily, unit, onSelect }) {
  const tomorrow = daily[1] || daily[0];
  const info = weatherInfo(tomorrow.code);

  return (
    <article
      className="rounded-card shadow-card animate-fade-up relative isolate min-h-85 overflow-hidden bg-[linear-gradient(145deg,#f1f8c9,#e8f3b2)] p-5.5 max-[900px]:min-h-70"
      style={fade(270)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[repeating-linear-gradient(135deg,rgba(85,181,229,0.16)_0_2px,transparent_2px_21px)]"
      />
      <UmbrellaIllustration />
      <div className="relative z-2 max-w-[64%] max-[520px]:max-w-[70%]">
        <Kicker tone="orange">Tomorrow</Kicker>
        <p className="mt-3.5 text-[48px] leading-none font-bold tracking-[-0.065em]">
          {toTemp(tomorrow.max, unit)}°
        </p>
        <p className="mt-1.5 text-xs font-semibold">{info.label}</p>
        <p className="text-10px text-brand-ink mt-0.5">
          Low {toTemp(tomorrow.min, unit)}° · {tomorrow.pop ?? 0}% rain
        </p>
        <button
          type="button"
          onClick={() => onSelect(1)}
          className="border-brand-navy/25 text-11px text-brand-navy mt-4 inline-flex items-center gap-1.5 border-b pb-0.5 font-bold"
        >
          View detailed forecast
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
      <span className="text-10px absolute bottom-4 left-5.5 z-2 text-[#667253]">
        {longDayLabel(tomorrow.date)}
      </span>
    </article>
  );
}
