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
      <section className="shop fixed sesame">
        <Splide aria-label="Shop items" options={options}>
          <SplideSlide>
            <div className="box">
              <picture>
                <source srcSet="/sesame01.webp" type="image/webp" />
                <Image src="/sesame01.jpg" className="sesame" alt="Jah God" width={500} height={443} />
              </picture>
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className="box">
              <picture>
                <source srcSet="/sesame02.webp" type="image/webp" />
                <Image src="/sesame02.jpg" className="sesame" alt="Mad Skill" width={400} height={400} />
              </picture>
            </div>
          </SplideSlide>
        </Splide>
        <h2>WHERE YOU AT !!!</h2>
      </section>
    </div>
  );
}
