"use client";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import type { SplideProps } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';

export { SplideSlide as CarouselSlide };

type CarouselProps = {
  options?: SplideProps['options'];
  ariaLabel?: string;
  children: React.ReactNode;
};

const defaultOptions: SplideProps['options'] = {
  type: 'fade',
  perPage: 1,
  autoplay: true,
  interval: 3500,
  speed: 800,
  arrows: false,
  pagination: false,
  rewind: true,
};

export function Carousel({ options, ariaLabel, children }: CarouselProps) {
  return (
    <Splide aria-label={ariaLabel} options={{ ...defaultOptions, ...options }}>
      {children}
    </Splide>
  );
}
