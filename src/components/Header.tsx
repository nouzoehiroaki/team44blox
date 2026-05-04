"use client";
import { useEffect, useState } from "react";
import { HamburgerButton } from "@/components/HamburgerButton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useYouTubeModal } from "@/hooks/useYouTubeModal";
import { youtubeContents } from "@/data/youtubeContents";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useYouTubeModal(youtubeContents);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <div>
      <header>
        <HamburgerButton isOpen={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        <NavigationMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </div>
  );
}
