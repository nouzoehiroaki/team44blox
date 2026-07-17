'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFlyerEvents } from '@/hooks/useFlyerEvents';
import { MonthlyEventsSlider, filterEventsFromThisMonth } from '@/components/MonthlyEventsSlider';
import { flyerBridge } from './game/flyerBridge';

/**
 * Pixi ゲームのマウントポイント。
 * - React StrictMode の二重実行・アンマウントに対応
 * - レジ会話から開くフライヤー（今月以降のイベント）オーバーレイを内包
 */
export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [showFlyers, setShowFlyers] = useState(false);

  const allEvents = useFlyerEvents();
  const upcoming = useMemo(() => filterEventsFromThisMonth(allEvents), [allEvents]);

  // ブリッジ接続（ゲーム側から参照される）
  useEffect(() => {
    flyerBridge.hasEvents = upcoming.length > 0;
  }, [upcoming]);
  useEffect(() => {
    flyerBridge.open = () => setShowFlyers(true);
    return () => {
      flyerBridge.open = () => {};
      flyerBridge.hasEvents = false;
      flyerBridge.isOpen = false;
    };
  }, []);
  useEffect(() => {
    flyerBridge.isOpen = showFlyers;
  }, [showFlyers]);

  useEffect(() => {
    let disposed = false;
    let dispose: (() => void) | undefined;

    (async () => {
      const { createGame } = await import('./game/createGame');
      if (disposed || !hostRef.current) return;
      const d = await createGame(hostRef.current);
      if (disposed) d();
      else dispose = d;
    })();

    return () => {
      disposed = true;
      dispose?.();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={hostRef}
        style={{
          width: '100%',
          height: 'calc(100dvh - 140px)',
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0a09',
          overflow: 'hidden',
        }}
      />
      {showFlyers && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            padding: 16,
          }}
        >
          <MonthlyEventsSlider events={allEvents} />
          <button
            onClick={() => setShowFlyers(false)}
            style={{
              background: '#111',
              color: '#fff',
              border: '3px solid #fff',
              padding: '10px 36px',
              fontSize: 18,
              letterSpacing: 2,
              cursor: 'pointer',
              fontFamily: '"DotGothic16", sans-serif',
            }}
          >
            ◀ もどる
          </button>
        </div>
      )}
    </div>
  );
}
