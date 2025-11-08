"use client";
import { useState, useEffect } from 'react';
import { createClient } from 'microcms-js-sdk';
import './schedule.css';
import "../../styles/styles.css"

interface FlyerEvent {
  id: string;
  date: string;
  title: string;
  images: {
    url: string;
    width?: number;
    height?: number;
  };
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  events: FlyerEvent[];
}

const client = createClient({
  serviceDomain: 'theam44blox',
  apiKey: process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
});

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<FlyerEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<FlyerEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const response = await client.getList({
        endpoint: 'calendar-fryer',
        queries: {
          limit: 30  // 取得件数を30件に指定
        }
      });
      setEvents(response.contents as FlyerEvent[]);
    } catch (error) {
      console.error('イベントの取得に失敗しました:', error);
    }
  };

  const normalizeDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvents = events.filter(event => {
        const eventDateNormalized = normalizeDate(event.date);
        const isMatch = eventDateNormalized === dateStr;
        return isMatch;
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
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
    fetchEvents();
  }, []);

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
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.hasEvents ? 'has-events' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <span className="day-number">{day.date.getDate()}</span>
                {day.hasEvents && <div className="event-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="flyer-gallery">
              {selectedEvents.map((event, eventIndex) => (
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
          </div>
        </div>
      )}
    </div>
  );
}