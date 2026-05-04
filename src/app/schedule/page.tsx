"use client";
import { useState, useEffect } from 'react';
import './schedule.css';
import "../../styles/styles.css"
import type { FlyerEvent, CalendarDay } from "@/types/events";
import { useFlyerEvents } from "@/hooks/useFlyerEvents";
import { toLocalDateString, normalizeDate } from "@/lib/dateUtils";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventModalDisplay } from "@/components/EventModalDisplay";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<FlyerEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const events = useFlyerEvents();

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const todayStr = toLocalDateString(new Date());
    const days: CalendarDay[] = [];
    const cursor = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = toLocalDateString(cursor);
      const dayEvents = events.filter((event) => normalizeDate(event.date) === dateStr);
      days.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        isToday: dateStr === todayStr,
        hasEvents: dayEvents.length > 0,
        events: dayEvents,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    setCalendarDays(days);
  }, [currentDate, events]);

  const handleDateClick = (day: CalendarDay) => {
    if (day.hasEvents) {
      setSelectedEvents(day.events);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvents([]);
  };

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">SCHEDULE</h1>
      <div className="calendar">
        <CalendarHeader
          currentDate={currentDate}
          onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
        />
        <CalendarGrid calendarDays={calendarDays} onDateClick={handleDateClick} />
      </div>
      <EventModalDisplay isOpen={showModal} onClose={closeModal} events={selectedEvents} />
    </div>
  );
}
