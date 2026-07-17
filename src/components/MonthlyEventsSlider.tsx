"use client";
import { useMemo } from "react";
import { EventsSlider } from "@/components/EventsSlider";
import type { FlyerEvent } from "@/types/events";

/** 今月1日以降のイベントのみに絞り込む（44SHOP レジのフライヤー表示用） */
export function filterEventsFromThisMonth(events: FlyerEvent[]): FlyerEvent[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return events
    .filter((e) => new Date(e.date) >= monthStart)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

type MonthlyEventsSliderProps = {
  events: FlyerEvent[];
};

/**
 * 月単位（今月以降）のイベントフライヤースライダー。
 * WeeklyEventsSlider の月版。イベントが無い場合は何も描画しない。
 */
export function MonthlyEventsSlider({ events }: MonthlyEventsSliderProps) {
  const monthly = useMemo(() => filterEventsFromThisMonth(events), [events]);

  if (monthly.length === 0) return null;

  return (
    <div style={{ width: "min(92%, 640px)", margin: "0 auto", textAlign: "center" }}>
      <EventsSlider
        title="UPCOMING EVENTS"
        events={monthly}
        options={{ arrows: true, interval: 4500 }}
        titleClassName="monthly-events-title"
        imageClassName="monthly-events-image"
      />
      {/* 44SHOPオーバーレイ内でのみ使用する簡易スタイル */}
      <style>{`
        .monthly-events-title {
          color: #f5d442;
          font-size: 20px;
          letter-spacing: 3px;
          margin-bottom: 12px;
        }
        .monthly-events-image {
          max-width: 100%;
          max-height: 62vh;
          object-fit: contain;
          margin: 0 auto;
          display: block;
        }
      `}</style>
    </div>
  );
}
