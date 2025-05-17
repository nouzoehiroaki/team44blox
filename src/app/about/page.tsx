"use client";
import "../../styles/svg.css";
import "../../styles/styles.css"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/TypingText";

export default function About() {
  const profileText =
    `千葉、茨城近辺を中心に自然発生するCREATIVE集団。\n HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている`;
  const images = [
    "/44.jpg",
    "/44-2.jpg",
    "/bullcamp.jpg",
    "/dabongs.jpg",
    "/mikris2.jpg",
    "/deli.jpg",
    "/jbm.jpg",
    "/jbm2.jpg",
    "/mikris.jpg",
    "/mfin.jpg",
  ];

  const [done, setDone] = useState(false);
  const [showBg, setShowBg] = useState(false);

  const cardW = 250;
  const cardH = 250;
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

  return (
    <div>
      <section id="member" className="member fixed">
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
              style={{ backgroundImage: "url('/about-bg.jpg')" }}
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
      </section>
    </div>
  );
}