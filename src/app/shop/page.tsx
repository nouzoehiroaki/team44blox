'use client';
import '@splidejs/splide/dist/css/splide.min.css';
import "../../styles/svg.css";
import "../../styles/styles.css"
//import { useEffect } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import type { SplideProps } from '@splidejs/react-splide';
import Image from 'next/image'

export default function Shop() {
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
        <Splide aria-label="Shop items" options={options}>
          <SplideSlide>
            <div className="box">
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
      </section>
    </div>
  );
}
