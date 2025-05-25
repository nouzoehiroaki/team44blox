"use client";
import "../../styles/svg.css";
import "../../styles/styles.css"
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { TypingText } from "@/components/TypingText";

export default function About() {
  const profileText =
    `千葉、茨城近辺を中心に自然発生するCREATIVE集団。\n HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている`;
  const images = [
    "/44.webp",
    "/44-2.webp",
    "/apogee.webp",
    "/aquarius.webp",
    "/bangblacks.webp",
    "/bullcamp.webp",
    "/dabongs.webp",
    "/dabo.webp",
    "/deli.webp",
    "/deli02.webp",
    "/jbm.webp",
    "/jobandope.webp",
    "/kge.webp",
    "/kge02.webp",
    "/kge03.webp",
    "/marsmanie.webp",
    "/mikris.webp",
    "/mikris3.webp",
    "/mikris4.webp",
    "/mikris5.webp",
    "/mfin.webp",
    "/sesame.webp",
    "/smithcn.webp",
    "/smithcn02.webp",
    "/snipe.webp",
    "/snipe02.webp",
    "/yakko.webp",
  ];

  const [done, setDone] = useState(false);
  const [showBg, setShowBg] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);


  const cardW = windowWidth <= 767 ? 100 : 250;
  const cardH = windowWidth <= 767 ? 100 : 250;

  const [items, setItems] = useState<
    { id: number; src: string; x: number; y: number }[]
  >([]);

  useEffect(() => {
    if (!showBg) return;
    const interval = setInterval(() => {
      const id = Date.now();
      const src = images[Math.floor(Math.random() * images.length)];
      const x = Math.random() * (window.innerWidth - cardW);
      const y = Math.random() * (window.innerHeight - cardH);
      setItems((prev) => [...prev, { id, src, x, y }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 2000);
    }, 1000);

    return () => clearInterval(interval);
  }, [showBg]);

  const cursorX = useMotionValue(-100);// 初期値は画面外
  const cursorY = useMotionValue(-100);
  /** pointer: fine (= マウスがある端末) かどうか  ----------------------- */

  useEffect(() => {
    // キャンセル早期
    const moveCursor = (e: { clientX: number; clientY: number; }) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  const [showModal, setShowModal] = useState(false);
  // クリックハンドラ（5 回目でモーダルを開く）
  const handleClick = () => {
    if (!showModal) setShowModal(true);
  };

  return (
    <div>
      <section id="member" className="member fixed" onClick={handleClick}>
        {/* -------- TypingText -------- */}
        <AnimatePresence
          onExitComplete={() => setShowBg(true)}
        >
          {!done && (
            <motion.div
              key="typing"
              className=""
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <TypingText
                text={profileText}
                speed={50}
                className="profile whitespace-pre-line"
                onComplete={() => setDone(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBg && (
            <motion.div
              key="bg"
              className="about-bg"
              style={{ backgroundImage: "url('/about-bg.webp')" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.1 }}
            />
          )}
        </AnimatePresence>
        {items.map((item) => (
          <AnimatePresence key={item.id}>
            <motion.div
              className="cd-jake"
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: `${cardW}px`,
                height: `${cardH}px`,
                backgroundImage: `url('${item.src}')`,
                backgroundSize: "cover",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            />
          </AnimatePresence>
        ))}
        {/* -------- modal -------- */}
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowModal(false)}  // オーバーレイをクリックで閉じる
          >
            <motion.div
              className="modal-body"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={(e) => e.stopPropagation()} // 中身クリックでバブリング抑止
            >
              <div className="link-row">
                <a href="https://www.instagram.com/bass_dabongz/" target="_blank" rel="noopener">BASS DA BONGZ</a>
                <a href="https://www.instagram.com/fudatzkee/" target="_blank" rel="noopener">DABO</a>
                <a href="https://www.instagram.com/dondeli/" target="_blank" rel="noopener">DELI</a>
                <a href="/" target="_blank" rel="noopener">DJ TOMIKEN</a>
                <a href="https://www.instagram.com/mailman44/" target="_blank" rel="noopener">DJ MAILMAN</a>
                <a href="https://www.instagram.com/gocci_funkhawk/" target="_blank" rel="noopener">GOCCI</a>
                <a href="https://www.instagram.com/Jahgod/" target="_blank" rel="noopener">JAH-GOD</a>
                <a href="https://www.instagram.com/jbmkong/" target="_blank" rel="noopener noreferrer">JBM</a>
                <a href="https://www.instagram.com/kgetheshadowmen/" target="_blank" rel="noopener">KGE THE SHADOWMEN</a>
                <a href="https://www.instagram.com/marsmanie/" target="_blank" rel="noopener noreferrer">MARS MANIE</a>
                <a href="https://www.instagram.com/madmikris/" target="_blank" rel="noopener noreferrer">MIKRIS</a>
                <a href="https://www.instagram.com/margeolochi/" target="_blank" rel="noopener">大蛇</a>
                <a href="/sesame/">SESAME</a>
                <a href="https://www.instagram.com/smithcnrrr/" target="_blank" rel="noopener">SMITH-C.N</a>
                <a href="https://www.instagram.com/sna_channel_high_cheese/" target="_blank" rel="noopener">SNIPE</a>
                <a href="https://www.instagram.com/mangkang_bm/" target="_blank" rel="noopener">T.MANGKANG</a>
                <a href="/" target="_blank" rel="noopener">YAKKO</a>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* --- custom cursor --- */}
        <motion.div
          className="custom-cursor"
          style={{
            translateX: cursorX,
            translateY: cursorY,
          }}
        />
      </section>
    </div>
  );
}