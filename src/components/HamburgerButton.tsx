"use client";

type HamburgerButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      id="btn03"
      className={`btnTrigger ${isOpen ? "active" : ""}`}
      onClick={onClick}
      aria-label="メニューを開閉"
      aria-expanded={isOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
