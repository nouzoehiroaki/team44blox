"use client";
import { useState, useEffect } from 'react';
import { createClient } from 'microcms-js-sdk';
import type { FlyerEvent } from '@/types/events';
import { getOneMonthAgo } from '@/lib/dateUtils';

const client = createClient({
  serviceDomain: 'theam44blox',
  apiKey: process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
});

export function useFlyerEvents(): FlyerEvent[] {
  const [events, setEvents] = useState<FlyerEvent[]>([]);

  useEffect(() => {
    const oneMonthAgoISO = getOneMonthAgo().toISOString();
    client
      .getList({
        endpoint: 'calendar-fryer',
        queries: {
          limit: 30,
          filters: `date[greater_than]${oneMonthAgoISO}`,
        },
      })
      .then((res) => setEvents(res.contents as FlyerEvent[]))
      .catch((error) => console.error('イベントの取得に失敗しました:', error));
  }, []);

  return events;
}
