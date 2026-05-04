"use client";
import "../../styles/svg.css";
import "../../styles/styles.css"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/TypingText";
import { MemberModal } from "@/components/MemberModal";
import { ParticleAnimation } from "@/components/ParticleAnimation";
import { CustomCursor } from "@/components/CustomCursor";

const profileText = `千葉、茨城など常磐線沿線を中心に結成されたHIPHOP SQUAD。\n TEAM 44 BLOXのメンバー紹介ページ。`;

const memberImages = [
  "/44.webp", "/44-2.webp", "/apogee.webp", "/aquarius.webp", "/bangblacks.webp",
  "/bullcamp.webp", "/dabongs.webp", "/dabo.webp", "/deli.webp", "/deli02.webp",
  "/jbm.webp", "/jobandope.webp", "/kge.webp", "/kge02.webp", "/kge03.webp",
  "/marsmanie.webp", "/mikris.webp", "/mikris3.webp", "/mikris4.webp", "/mikris5.webp",
  "/mfin.webp", "/sesame.webp", "/smithcn.webp", "/smithcn02.webp", "/smithcn03.webp",
  "/snipe.webp", "/snipe02.webp", "/yakko.webp",
];

export default function About() {
  const [done, setDone] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <section id="member" className="member fixed" onClick={() => { if (!showModal) setShowModal(true); }}>
        <AnimatePresence onExitComplete={() => setShowBg(true)}>
          {!done && (
            <motion.div
              key="typing"
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

        <ParticleAnimation images={memberImages} isActive={showBg} />
        <MemberModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <CustomCursor />
      </section>
    </div>
  );
}
