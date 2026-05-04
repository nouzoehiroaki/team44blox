"use client";
import { useState } from "react";
import Link from "next/link";
import { Carousel, CarouselSlide } from "@/components/ui/Carousel";
import { Modal } from "@/components/ui/Modal";
import type { FlyerEvent } from "@/types/events";

type WeeklyEventsSliderProps = {
  events: FlyerEvent[];
};

export function WeeklyEventsSlider({ events }: WeeklyEventsSliderProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (events.length === 0) return null;

  return (
    <>
      <div className="weekly-events">
        <h3 className="weekly-events-title">This Week's Events</h3>
        <Carousel ariaLabel="This Week's Events" options={{ interval: 4000 }}>
          {events.map((event) => (
            <CarouselSlide key={event.id}>
              {event.images?.url && (
                <img
                  src={event.images.url}
                  alt={event.title}
                  className="weekly-events-image"
                  onClick={() => setModalImage(event.images.url)}
                />
              )}
            </CarouselSlide>
          ))}
        </Carousel>
      </div>

      <Modal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        overlayClassName="weekly-events-modal"
        contentClassName="weekly-events-modal-content"
        closeClassName="weekly-events-modal-close"
        closeLabel="×"
      >
        <img src={modalImage ?? ""} alt="Event Flyer" className="weekly-events-modal-image" />
        <Link href="/schedule" className="weekly-events-modal-link">
          SCHEDULE
        </Link>
      </Modal>
    </>
  );
}
