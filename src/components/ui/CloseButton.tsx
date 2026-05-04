"use client";

type CloseButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

export function CloseButton({ onClick, className = "modal-close", label = "✕" }: CloseButtonProps) {
  return (
    <button className={className} onClick={onClick} aria-label="閉じる">
      {label}
    </button>
  );
}
