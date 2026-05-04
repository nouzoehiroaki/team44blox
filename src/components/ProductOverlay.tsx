"use client";

type ProductOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProductOverlay({ isOpen, onClose }: ProductOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="product-overlay">
      <div className="product-overlay-content">
        <button className="product-overlay-close" onClick={onClose}>×</button>
        <div className="product-overlay-inner">
          <div className="product-overlay-image">
            <div className="product-placeholder">
              <img src="/towel.jpg" alt="" />
            </div>
          </div>
          <div className="product-overlay-info">
            <h3 className="product-overlay-title">NEW ITEM</h3>
            <p className="product-overlay-description">TEAM44BLOX FACETOWEL</p>
            <a
              href="https://shop.lb-2.com/items/142339254"
              className="product-overlay-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW DETAILS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
