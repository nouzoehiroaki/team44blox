'use client';
import "../../styles/svg.css";
import "../../styles/styles.css"
import { Carousel, CarouselSlide } from "@/components/ui/Carousel";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/TypingText";
import Image from 'next/image'
import { useState } from 'react';

export default function Shop() {
  const profileTexts = [
    `どうも。DJ TOMIKENです`,
    `となりにいるのはメル山メルオ`,
    `夢に向かうのが任務です`,
    `いらっしゃいませ`,
    `祭りだよーー`,
    `いいのあるよーーーー`,
    `みるだけタダよーーーーー`,
    `アドレス押しちゃっていいよーーーーーー`,
    `キターーーーーーーーーーーーーーーー`,
    `SESAMEーーーーーーーーーーーー`,
    `ぽぽぽっぽーーーーーーーーーーい`,
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

  const shopItems = [
    {
      imageWebp: '/lb-shop.webp',
      imageSrc: '/lb-shop.jpg',
      imageClass: 'jahgod',
      imageAlt: 'LB ONLINE',
      imageWidth: 500,
      imageHeight: 443,
      linkHref: 'https://shop.lb-2.com/',
      linkClass: 'btn btn-flat fc',
      linkText: 'shop.lb-2.com',
    },
    {
      imageWebp: '/mikris-shop.webp',
      imageSrc: '/mikris-shop.jpg',
      imageClass: 'madskill',
      imageAlt: 'THE DOG HOUSE MUSIC STORE',
      imageWidth: 400,
      imageHeight: 400,
      linkHref: 'https://thedoghousemusic.stores.jp/',
      linkClass: 'btn btn-flat tdhm',
      linkText: 'thedoghousemusic.stores.jp',
    },
    {
      imageWebp: '/kge-shop.webp',
      imageSrc: '/kge-shop.jpg',
      imageClass: 'madskill',
      imageAlt: 'シャドメンのサイン付きCD屋さん',
      imageWidth: 400,
      imageHeight: 400,
      linkHref: 'https://pylorhythm.official.ec/',
      linkClass: 'btn btn-flat pylo',
      linkText: 'pylorhythm.official.ec',
    },
  ];

  return (
    <div>
      <section className="shop fixed">
        <div className="lantern">
          <picture>
            <source srcSet="/lantern.webp" type="image/webp" />
            <Image src="/lantern.png" className="" alt="TEAM44BLOX" width={400} height={400} />
          </picture>
        </div>
        <Carousel ariaLabel="Shop items" options={{ arrows: true, gap: '1.5rem' }}>
          {shopItems.map((item) => (
            <CarouselSlide key={item.linkHref}>
              <div className="box">
                <div className="tomiken">
                  <picture>
                    <source srcSet="/tomiken.webp" type="image/webp" />
                    <Image src="/tomiken.png" className="" alt="DJ TOMIKEN" width={400} height={400} />
                  </picture>
                </div>
                <div className="mailman">
                  <picture>
                    <source srcSet="/mailman.webp" type="image/webp" />
                    <Image src="/mailman.png" className="" alt="DJ MAILMAN" width={400} height={400} />
                  </picture>
                </div>
                <picture>
                  <source srcSet={item.imageWebp} type="image/webp" />
                  <Image src={item.imageSrc} className={item.imageClass} alt={item.imageAlt} width={item.imageWidth} height={item.imageHeight} />
                </picture>
                <div className='position'>
                  <a href={item.linkHref} className={item.linkClass} target="_blank" rel="noopener"><span>{item.linkText}</span></a>
                </div>
              </div>
            </CarouselSlide>
          ))}
        </Carousel>
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
