"use client";

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

type CalendarHeaderProps = {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
};

export function CalendarHeader({ currentDate, onPrev, onNext }: CalendarHeaderProps) {
  return (
    <div className="calendar-header">
      <button onClick={onPrev} className="nav-btn">‹</button>
      <h2 className="current-month">
        {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
      </h2>
      <button onClick={onNext} className="nav-btn">›</button>
    </div>
  );
}
