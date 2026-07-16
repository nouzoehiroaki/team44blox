"use client";
import { Carousel, CarouselSlide } from "@/components/ui/Carousel";
import type { SplideProps } from "@splidejs/react-splide";
import type { FlyerEvent } from "@/types/events";

export type EventsSliderProps = {
  title: string;
  events: FlyerEvent[];
  options?: SplideProps["options"];
  containerClassName?: string;
  titleClassName?: string;
  imageClassName?: string;
  onImageClick?: (url: string) => void;
};

/**
 * フライヤーイベントの汎用スライダー。
 * 期間フィルタは呼び出し側（Weekly / Monthly 等のラッパー）が担当する。
 */
export function EventsSlider({
  title,
  events,
  options,
  containerClassName,
  titleClassName,
  imageClassName,
  onImageClick,
}: EventsSliderProps) {
  if (events.length === 0) return null;

  return (
    <div className={containerClassName}>
      <h3 className={titleClassName}>{title}</h3>
      <Carousel ariaLabel={title} options={{ interval: 4000, ...options }}>
        {events.map((event) => (
          <CarouselSlide key={event.id}>
            {event.images?.url && (
              <img
                src={event.images.url}
                alt={event.title}
                className={imageClassName}
                onClick={() => onImageClick?.(event.images.url)}
              />
            )}
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  );
}
