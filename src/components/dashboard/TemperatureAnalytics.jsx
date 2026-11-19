/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { CloudRain, Thermometer, Wind } from "lucide-react";
import { TemperatureChart } from "../Charts";
import { ControlButton } from "../ui";
import { buildSlots, fade } from "./utils";

const MODES = [
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "wind", label: "Wind", icon: Wind },
];

export default function TemperatureAnalytics({ hourly, unit }) {
  const [mode, setMode] = useState("temperature");
  const slots = useMemo(() => buildSlots(hourly, unit), [hourly, unit]);

  return (
    <section className="animate-fade-up min-w-0 px-0.5 pt-1" style={fade(210)}>
      <div className="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
        <h2 className="mt-1.5 text-[clamp(20px,2vw,27px)] leading-[1.15] font-bold tracking-[-0.045em]">
          How&apos;s the temperature today?
        </h2>
        <div
          className="flex flex-none gap-2 max-[760px]:w-full"
          role="group"
          aria-label="Chart metric"
        >
          {MODES.map(({ id, label, icon: Icon }) => (
            <ControlButton key={id} active={mode === id} label={label} onClick={() => setMode(id)}>
              <Icon size={16} strokeWidth={1.8} />
            </ControlButton>
          ))}
        </div>
      </div>
      <TemperatureChart slots={slots} mode={mode} unit={unit} />
    </section>
  );
}
