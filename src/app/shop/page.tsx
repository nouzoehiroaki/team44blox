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

  return (
    <div>
      <section className="shop fixed">
        <div className="lantern">
          <picture>
            <source srcSet="/lantern.webp" type="image/webp" />
            <Image src="/lantern.png" className="" alt="Team 44 Blox" width={400} height={400} />
          </picture>
        </div>
        <Carousel ariaLabel="Shop items" options={{ arrows: true, gap: '1.5rem' }}>
          <CarouselSlide>
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
                <source srcSet="/lb-shop.webp" type="image/webp" />
                <Image src="/lb-shop.jpg" className="jahgod" alt="LB ONLINE" width={500} height={443} />
              </picture>
              <div className='position'>
                <a href="https://shop.lb-2.com/" className="btn btn-flat fc" target="_blank" rel="noopener"><span>shop.lb-2.com</span></a>
              </div>
            </div>
          </CarouselSlide>
          <CarouselSlide>
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
                <source srcSet="/mikris-shop.webp" type="image/webp" />
                <Image src="/mikris-shop.jpg" className="madskill" alt="THE DOG HOUSE MUSIC STORE" width={400} height={400} />
              </picture>
              <div className='position'>
                <a href="https://thedoghousemusic.stores.jp/" className="btn btn-flat tdhm" target="_blank" rel="noopener"><span>thedoghousemusic.stores.jp</span></a>
              </div>
            </div>
          </CarouselSlide>
          <CarouselSlide>
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
                <source srcSet="/kge-shop.webp" type="image/webp" />
                <Image src="/kge-shop.jpg" className="madskill" alt="シャドメンのサイン付きCD屋さん" width={400} height={400} />
              </picture>
              <div className='position'>
                <a href="https://pylorhythm.official.ec/" className="btn btn-flat pylo" target="_blank" rel="noopener"><span>pylorhythm.official.ec</span></a>
              </div>
            </div>
          </CarouselSlide>
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
