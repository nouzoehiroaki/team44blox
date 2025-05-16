"use client";
import "../../styles/svg.css";
import "../../styles/styles.css"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/TypingText";

export default function About() {
  const profileText =
    `千葉、茨城近辺を中心に自然発生するCREATIVE集団。\n HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている`;
  const [done, setDone] = useState(false);
  const [showBg, setShowBg] = useState(false);
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
              transition={{ duration: 1, delay: 1 }}   // フェードアウト 1s
            >
              <TypingText
                text={profileText}
                speed={50}
                className="profile whitespace-pre-line" // 改行用に whitespace-pre-line
                onComplete={() => setDone(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBg && (
            <motion.div
              key="bg"
              className="use-about"
              style={{ backgroundImage: "url('/use-about.jpg')" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.1 }} // フェードイン
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
