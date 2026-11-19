/* eslint-disable react/prop-types */
import { ForecastRow, Modal } from "../ui";

export default function FiveDayModal({ days, place, unit, onSelect, onClose }) {
  return (
    <Modal
      label="Next 5 days forecast"
      kicker={String(place).split(",")[0]}
      title="Next 5 days"
      subtitle="Pick a day for the full hourly forecast."
      closeLabel="Close 5 day forecast"
      size="five-day"
      onClose={onClose}
    >
      <div className="mt-5 flex flex-col gap-2">
        {days.map(({ day, index }) => (
          <ForecastRow
            key={day.date}
            day={day}
            unit={unit}
            variant="modal"
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </Modal>
  );
}
