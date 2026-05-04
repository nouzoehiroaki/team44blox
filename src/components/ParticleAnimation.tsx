"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ParticleAnimationProps = {
  images: string[];
  isActive: boolean;
};

export function ParticleAnimation({ images, isActive }: ParticleAnimationProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [items, setItems] = useState<{ id: number; src: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cardW = windowWidth <= 767 ? 100 : 250;
  const cardH = windowWidth <= 767 ? 100 : 250;

  useEffect(() => {
    if (!isActive) return;
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
  }, [isActive, cardW, cardH, images]);

  return (
    <>
      <AnimatePresence>
        {isActive && (
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
    </>
  );
}
