"use client";
import "../../styles/svg.css";
import "../../styles/styles.css"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/TypingText";
import { MemberModal } from "@/components/MemberModal";
import { ParticleAnimation } from "@/components/ParticleAnimation";
import { CustomCursor } from "@/components/CustomCursor";

const profileText = `千葉、茨城など常磐線沿線を中心に結成されたHIPHOP SQUAD。\n TEAM44BLOXのメンバー紹介ページ。`;

const memberImages = [
  "/about/44.webp", "/about/44-2.webp", "/about/apogee.webp", "/about/aquarius.webp", "/about/bangblacks.webp",
  "/about/bullcamp.webp", "/about/dabongs.webp", "/about/dabo.webp", "/about/deli.webp", "/about/deli02.webp",
  "/about/jbm.webp", "/about/jobandope.webp", "/about/kge.webp", "/about/kge02.webp", "/about/kge03.webp",
  "/about/marsmanie.webp", "/about/mikris.webp", "/about/mikris3.webp", "/about/mikris4.webp", "/about/mikris5.webp",
  "/about/mfin.webp", "/about/sesame.webp", "/about/smithcn.webp", "/about/smithcn02.webp", "/about/smithcn03.webp",
  "/about/snipe.webp", "/about/snipe02.webp", "/about/yakko.webp",
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
