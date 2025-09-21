"use client";
import { useState, useEffect } from 'react';
import { createClient } from 'microcms-js-sdk';

//import { client } from "../../../libs/client";
import './schedule.css';
import "../../styles/styles.css"

// interface FlyerEvent {
//   id: string;
//   date: string;
//   images: {
//     url: string;
//     width?: number;
//     height?: number;
//   }[] | {
//     url: string;
//     width?: number;
//     height?: number;
//   };
// }

interface FlyerEvent {
  id: string;
  date: string;
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
      //console.log('取得したイベントデータ:', response.contents);
      // 各イベントの日付形式を確認
      // response.contents.forEach((event: any, index: number) => {
      //   console.log(`イベント ${index + 1}:`, {
      //     id: event.id,
      //     date: event.date,
      //     dateType: typeof event.date,
      //     images: event.images
      //   });
      // });
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
    //console.log('カレンダー生成中...');
    //console.log('利用可能なイベント:', events);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      //const dayEvents = events.filter(event => event.date === dateStr);
      const dayEvents = events.filter(event => {
        const eventDateNormalized = normalizeDate(event.date);
        const isMatch = eventDateNormalized === dateStr;

        // デバッグ用ログ（6月30日付近のみ）
        // if (dateStr.includes('2024-06-30') || eventDateNormalized.includes('2024-06-30')) {
        //   console.log('日付比較:', {
        //     カレンダー日付: dateStr,
        //     イベント日付: event.date,
        //     正規化後: eventDateNormalized,
        //     マッチ: isMatch
        //   });
        // }

        return isMatch;
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        hasEvents: dayEvents.length > 0,
        events: dayEvents
      });

      // 6月30日の情報をログ出力
      // if (dateStr === '2024-06-30') {
      //   console.log('6月30日の詳細:', {
      //     date: dateStr,
      //     hasEvents: dayEvents.length > 0,
      //     eventsCount: dayEvents.length,
      //     events: dayEvents
      //   });
      // }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const handleDateClick = (day: CalendarDay) => {
    // console.log('クリックされた日:', {
    //   date: day.date.toISOString().split('T')[0],
    //   hasEvents: day.hasEvents,
    //   eventsCount: day.events.length,
    //   events: day.events
    // });
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
      {/* <div style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
        <strong>デバッグ情報:</strong>
        <br />
        取得したイベント数: {events.length}
        <br />
        {events.length > 0 && (
          <>
            最初のイベントの日付: {events[0]?.date} (型: {typeof events[0]?.date})
          </>
        )}
      </div> */}
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
                  {/* デバッグ情報を表示 */}
                  {/* <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
                    <strong>イベントデータ構造:</strong>
                    <pre>{JSON.stringify(event, null, 2)}</pre>
                  </div> */}
                  {/* {event.images.map((image: { url: string | Blob | undefined; }, imageIndex: number) => (
                    <img
                      key={`${event.id}-${imageIndex}`}
                      src={image.url}
                      alt={`フライヤー ${eventIndex + 1}-${imageIndex + 1}`}
                      className="flyer-image"
                    />
                  ))} */}
                  {/* images が配列かどうかをチェック */}

                  {/* {Array.isArray(event.images) ? (
                    event.images.map((image, imageIndex) => (
                      <img
                        key={`${event.id}-${imageIndex}`}
                        src={image.url}
                        alt={`フライヤー ${eventIndex + 1}-${imageIndex + 1}`}
                        className="flyer-image"
                      />
                    ))
                  ) : (
                    <div>
                      <p>images が配列ではありません:</p>
                      <pre>{JSON.stringify(event.images, null, 2)}</pre>
                      {event.images && event.images.url && (
                        <img
                          src={event.images.url}
                          alt={`フライヤー ${eventIndex + 1}`}
                          className="flyer-image"
                        />
                      )}
                    </div>
                  )} */}

                  {event.images && event.images.url && (
                    <img
                      src={event.images.url}
                      alt={`フライヤー ${eventIndex + 1}`}
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