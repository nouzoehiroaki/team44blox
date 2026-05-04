"use client";
import Link from "next/link";

type NavigationMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  return (
    <nav className={isOpen ? "show" : ""}>
      <ul>
        <li><Link href="/" onClick={onClose}>TOP</Link></li>
        <li><a href="#" className="modal-youtube">MUSIC</a></li>
        <li><Link href="/about" onClick={onClose}>ABOUT</Link></li>
        <li><Link href="/shop" onClick={onClose}>SHOP</Link></li>
        <li><Link href="/pickup" onClick={onClose}>FAV CLIPS</Link></li>
        <li><Link href="/news" onClick={onClose}>NEWS</Link></li>
        <li><Link href="/schedule" onClick={onClose}>SCHEDULE</Link></li>
      </ul>
    </nav>
  );
}
