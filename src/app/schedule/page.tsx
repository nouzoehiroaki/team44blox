"use client";
import { useState, useEffect } from 'react';
import './schedule.css';
import "../../styles/styles.css"
import type { FlyerEvent, CalendarDay } from "@/types/events";
import { Modal } from "@/components/ui/Modal";
import { useFlyerEvents } from "@/hooks/useFlyerEvents";
import { toLocalDateString, normalizeDate } from "@/lib/dateUtils";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<FlyerEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const events = useFlyerEvents();

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    const todayStr = toLocalDateString(today);

    for (let i = 0; i < 42; i++) {
      const dateStr = toLocalDateString(currentDate);
      const dayEvents = events.filter(event => {
        const eventDateNormalized = normalizeDate(event.date);
        const isMatch = eventDateNormalized === dateStr;
        return isMatch;
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: dateStr === todayStr,
        hasEvents: dayEvents.length > 0,
        events: dayEvents
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarDays(days);
  };

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

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    generateCalendar(currentDate);
  }, [currentDate, events]);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">SCHEDULE</h1>
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-btn">‹</button>
          <h2 className="current-month">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          <button onClick={nextMonth} className="nav-btn">›</button>
        </div>

        <div className="calendar-grid">
          <div className="day-names">
            {dayNames.map(day => (
              <div key={day} className="day-name">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.hasEvents ? 'has-events' : ''} ${day.isToday ? 'is-today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <span className="day-number">{day.date.getDate()}</span>
                {day.hasEvents && <div className="event-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={closeModal}>
        <div className="flyer-gallery">
          {selectedEvents.map((event) => (
            <div key={event.id} className="event-group">
              {event.images && event.images.url && (
                <img
                  src={event.images.url}
                  alt={event.title}
                  className="flyer-image"
                />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}