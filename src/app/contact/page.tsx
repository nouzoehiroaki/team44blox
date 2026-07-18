import '../../styles/svg.css';
import '../../styles/styles.css';
import '@fontsource/dotgothic16';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'MESSAGE | TEAM44BLOX Official Website',
  description: 'TEAM44BLOXのアーティストへ応援メッセージを送れるフォーム。',
  alternates: { canonical: '/contact' },
  robots: { index: false }, // スパムbot流入抑制のため検索除外
};

export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: 'calc(100dvh - 140px)',
        padding: '110px 16px 60px',
        background: '#0b0a09',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: '#f5d442',
          letterSpacing: 4,
          fontSize: 26,
          marginBottom: 24,
        }}
      >
        MESSAGE
      </h1>
      <ContactForm variant="page" />
    </main>
  );
}
