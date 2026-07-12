'use client';
import dynamic from 'next/dynamic';

// Pixi(WebGL)はSSR不可のためクライアント側でのみ読み込む
const GameCanvas = dynamic(() => import('./GameCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: 'calc(100dvh - 140px)',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0a09',
        color: '#f5d442',
        fontSize: 20,
        letterSpacing: 2,
      }}
    >
      NOW LOADING...
    </div>
  ),
});

export default function ShopGameLoader() {
  return <GameCanvas />;
}
