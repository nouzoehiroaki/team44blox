import '../../styles/svg.css';
import '../../styles/styles.css';
import '@fontsource/dotgothic16';
import type { Metadata } from 'next';
import ShopGameLoader from '@/components/44shop/ShopGameLoader';

export const metadata: Metadata = {
  title: '44SHOP | TEAM44BLOX Official Website',
  description:
    'TEAM44BLOXの44SHOP。キャラクターを操作してショップを探索し、グッズやCDをチェックできるインタラクティブページ。',
  alternates: { canonical: '/44shop' },
};

export default function Shop44Page() {
  return (
    <main>
      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        44SHOP
      </h1>
      <ShopGameLoader />
    </main>
  );
}
