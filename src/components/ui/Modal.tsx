"use client";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  closeClassName?: string;
  closeLabel?: string;
};

export function Modal({
  isOpen,
  onClose,
  children,
  overlayClassName = "modal-overlay",
  contentClassName = "modal-content",
  closeClassName = "modal-close",
  closeLabel = "✕",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        <button className={closeClassName} onClick={onClose}>{closeLabel}</button>
        {children}
      </div>
    </div>
  );
}
