/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import AirQualityCard from "./dashboard/AirQualityCard";
import CurrentWeatherCard from "./dashboard/CurrentWeatherCard";
import DayDetailModal from "./dashboard/DayDetailModal";
import FiveDayModal from "./dashboard/FiveDayModal";
import InfoPanel from "./dashboard/InfoPanel";
import TomorrowCard from "./dashboard/TomorrowCard";
import TemperatureAnalytics from "./dashboard/TemperatureAnalytics";
import { useAirQuality } from "./dashboard/utils";

export default function Dashboard({ data, place, unit, utcOffsetSeconds, onChangeLocation }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [fiveDayOpen, setFiveDayOpen] = useState(false);
  const { air, loading: airLoading } = useAirQuality(data.location);
  const fiveDays = data.daily.slice(0, 5).map((day, index) => ({ day, index }));

  useEffect(() => {
    setSelectedDay(null);
    setFiveDayOpen(false);
  }, [data]);

  return (
    <>
      <div className="animate-fade-in shadow-panel grid gap-5.5 rounded-4xl border border-white bg-white p-5.5 max-[760px]:rounded-[26px] max-[760px]:p-3.5 lg:grid-cols-[minmax(0,2.85fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col justify-between">
          <div className="grid grid-cols-2 gap-4.5 max-[760px]:grid-cols-1">
            <CurrentWeatherCard data={data} place={place} unit={unit} />
            <AirQualityCard air={air} loading={airLoading} current={data.current} unit={unit} />
          </div>
          <div className="mt-4.5 grid grid-cols-[minmax(0,1.7fr)_minmax(250px,0.9fr)] items-stretch gap-4.5 max-[900px]:grid-cols-1">
            <TemperatureAnalytics hourly={data.hourly} unit={unit} />
            <TomorrowCard daily={data.daily} unit={unit} onSelect={setSelectedDay} />
          </div>
        </div>

        <InfoPanel
          data={data}
          place={place}
          unit={unit}
          utcOffsetSeconds={utcOffsetSeconds}
          onSelect={setSelectedDay}
          onOpenFiveDay={() => setFiveDayOpen(true)}
          onChangeLocation={onChangeLocation}
        />
      </div>

      {fiveDayOpen && (
        <FiveDayModal
          days={fiveDays}
          place={place}
          unit={unit}
          onSelect={(index) => {
            setFiveDayOpen(false);
            setSelectedDay(index);
          }}
          onClose={() => setFiveDayOpen(false)}
        />
      )}

      {selectedDay !== null && data.daily[selectedDay] && (
        <DayDetailModal
          day={data.daily[selectedDay]}
          allHours={data.allHours}
          rollingHours={data.hourly}
          todayDate={data.daily[0]?.date}
          unit={unit}
          utcOffsetSeconds={utcOffsetSeconds}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
