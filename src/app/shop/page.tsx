'use client';
import '@splidejs/splide/dist/css/splide.min.css';
import "../../styles/svg.css";
import "../../styles/styles.css"
//import { useEffect } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import type { SplideProps } from '@splidejs/react-splide';
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { TypingText } from "@/components/TypingText";
import Image from 'next/image'
import { useState } from 'react';

export default function Shop() {
  const profileTexts = [
    `なんだツィミは`,
    `なんだツィミってか`,
    `そうです。ワタスがトミケンです`,
    `となりにいるのはメル山メルオ`,
    `夢に向かうのが任務です`,
    `いらっしゃいませ`,
    `祭りだよーー`,
    `いいのあるよーーー`,
    `みるだけタダよーーーー`,
    `アドレス押しちゃっていいよーーーーー`,
    `キターーーーーーーーーーーーーーー`,
    `SESAMEーーーーーーーーーーーー`,
    `まーーたくーるよーーー`
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const handleTextComplete = () => {
    if (currentTextIndex < profileTexts.length - 1) {
      setTimeout(() => {
        setCurrentTextIndex(currentTextIndex + 1);
      }, 1900); // 1.9秒待ってから次のテキストを表示
    } else {
      // 最後のテキストが完了したら、少し待ってから最初に戻る
      setTimeout(() => {
        setCurrentTextIndex(0); // 最初のテキストに戻る
      }, 2500); // 2.5秒待ってからループ開始
    }
  };

  // Splide の基本オプション
  const options: SplideProps['options'] = {
    type: 'fade',      // ループ
    perPage: 1,        // 1枚ずつ表示
    autoplay: true,    // 自動再生
    interval: 3500,    // ミリ秒
    speed: 800,        // アニメーション速度
    gap: '1.5rem',     // スライド間余白
    arrows: true,
    pagination: false,
  };
  return (
    <div>
      <section className="shop fixed">
        <div className="lantern">
          <picture>
            <source srcSet="/lantern.webp" type="image/webp" />
            <Image src="/lantern.png" className="" alt="Mad Skill" width={400} height={400} />
          </picture>
        </div>
        <Splide aria-label="Shop items" options={options}>
          <SplideSlide>
            <div className="box">
              <div className="tomiken">
                <picture>
                  <source srcSet="/tomiken.webp" type="image/webp" />
                  <Image src="/tomiken.png" className="" alt="Mad Skill" width={400} height={400} />
                </picture>
              </div>
              <div className="mailman">
                <picture>
                  <source srcSet="/mailman.webp" type="image/webp" />
                  <Image src="/mailman.png" className="" alt="Mad Skill" width={400} height={400} />
                </picture>
              </div>
              <picture>
                <source srcSet="/lb-shop.webp" type="image/webp" />
                <Image src="/lb-shop.jpg" className="jahgod" alt="Jah God" width={500} height={443} />
              </picture>
              <div className='position'>
                <a href="https://shop.lb-2.com/" className="btn btn-flat fc" target="_blank" rel="noopener"><span>shop.lb-2.com</span></a>
              </div>
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className="box">
              <div className="tomiken">
                <picture>
                  <source srcSet="/tomiken.webp" type="image/webp" />
                  <Image src="/tomiken.png" className="" alt="Mad Skill" width={400} height={400} />
                </picture>
              </div>
              <div className="mailman">
                <picture>
                  <source srcSet="/mailman.webp" type="image/webp" />
                  <Image src="/mailman.png" className="" alt="Mad Skill" width={400} height={400} />
                </picture>
              </div>
              <picture>
                <source srcSet="/mikris-shop.webp" type="image/webp" />
                <Image src="/mikris-shop.jpg" className="madskill" alt="Mad Skill" width={400} height={400} />
              </picture>
              <div className='position'>
                <a href="https://thedoghousemusic.stores.jp/" className="btn btn-flat tdhm" target="_blank" rel="noopener"><span>thedoghousemusic.stores.jp</span></a>
              </div>
            </div>
          </SplideSlide>
        </Splide>
        <div className='coment'>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTextIndex}
              className=""
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TypingText
                text={profileTexts[currentTextIndex]}
                speed={100}
                className="profile whitespace-pre-line"
                onComplete={handleTextComplete}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
