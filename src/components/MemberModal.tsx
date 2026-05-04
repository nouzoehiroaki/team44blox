"use client";
import { motion } from "framer-motion";
import Link from "next/link";

type MemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const members = [
  { href: "https://www.instagram.com/bass_dabongz/", label: "BASS DA BONGZ", external: true },
  { href: "https://www.instagram.com/fudatzkee/", label: "DABO", external: true },
  { href: "https://www.instagram.com/dondeli/", label: "DELI", external: true },
  { href: "/", label: "DJ TOMIKEN", external: true },
  { href: "https://www.instagram.com/mailman44/", label: "DJ MAILMAN", external: true },
  { href: "https://www.instagram.com/gocci_funkhawk/", label: "GOCCI", external: true },
  { href: "https://www.instagram.com/Jahgod/", label: "JAH-GOD", external: true },
  { href: "https://www.instagram.com/jbmkong/", label: "JBM", external: true },
  { href: "https://www.instagram.com/kgetheshadowmen/", label: "KGE THE SHADOWMEN", external: true },
  { href: "https://www.instagram.com/marsmanie/", label: "MARS MANIE", external: true },
  { href: "https://www.instagram.com/madmikris/", label: "MIKRIS", external: true },
  { href: "https://www.instagram.com/margeolochi/", label: "大蛇", external: true },
  { href: "/sesame", label: "SESAME", external: false },
  { href: "https://www.instagram.com/smithcnrrr/", label: "SMITH-C.N", external: true },
  { href: "https://www.instagram.com/sna_channel_high_cheese/", label: "SNIPE", external: true },
  { href: "https://www.instagram.com/mangkang_bm/", label: "T.MANGKANG", external: true },
  { href: "/", label: "YAKKO", external: true },
];

export function MemberModal({ isOpen, onClose }: MemberModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-body"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="link-row">
          {members.map(({ href, label, external }) =>
            external ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ) : (
              <Link key={label} href={href}>{label}</Link>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
