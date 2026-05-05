"use client";
import { CloseButton } from "@/components/ui/CloseButton";
import { Carousel, CarouselSlide } from "@/components/ui/Carousel";

type Product = {
  image: string;
  alt: string;
  description: string;
  href: string;
};

const products: Product[] = [
  {
    image: '/44-towel.webp',
    alt: 'TEAM44BLOX FACETOWEL',
    description: 'TEAM44BLOX FACETOWEL',
    href: 'https://shop.lb-2.com/items/142339254',
  },
  {
    image: '/mikris-towel.webp',
    alt: 'TDHM LOGO 手拭い',
    description: 'TDHM LOGO 手拭い',
    href: 'https://thedoghousemusic.stores.jp/items/69eb606873db3d3c9d21b4d2',
  },
];

type ProductOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProductOverlay({ isOpen, onClose }: ProductOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="product-overlay">
      <div className="product-overlay-content">
        <CloseButton onClick={onClose} className="product-overlay-close" label="×" />
        <Carousel
          ariaLabel="New items"
          options={{ arrows: products.length > 1 }}
        >
          {products.map((product, index) => (
            <CarouselSlide key={index}>
              <div className="product-overlay-inner">
                <div className="product-overlay-image">
                  <div className="product-placeholder">
                    <img src={product.image} alt={product.alt} />
                  </div>
                </div>
                <div className="product-overlay-info">
                  <h3 className="product-overlay-title">NEW ITEM</h3>
                  <p className="product-overlay-description">{product.description}</p>
                  <a
                    href={product.href}
                    className="product-overlay-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    VIEW DETAILS
                  </a>
                </div>
              </div>
            </CarouselSlide>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
