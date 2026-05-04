"use client";
import type { CalendarDay } from "@/types/events";

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

type CalendarGridProps = {
  calendarDays: CalendarDay[];
  onDateClick: (day: CalendarDay) => void;
};

export function CalendarGrid({ calendarDays, onDateClick }: CalendarGridProps) {
  return (
    <div className="calendar-grid">
      <div className="day-names">
        {dayNames.map((day) => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.hasEvents ? 'has-events' : ''} ${day.isToday ? 'is-today' : ''}`}
            onClick={() => onDateClick(day)}
          >
            <span className="day-number">{day.date.getDate()}</span>
            {day.hasEvents && <div className="event-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
