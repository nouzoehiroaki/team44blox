'use client';
import { useEffect, useRef } from 'react';

/**
 * Pixi ゲームのマウントポイント。
 * React StrictMode の二重実行・アンマウントに対応。
 */
export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

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
  );
}
