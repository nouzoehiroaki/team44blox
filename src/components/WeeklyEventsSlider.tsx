"use client";
import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { EventsSlider } from "@/components/EventsSlider";
import type { FlyerEvent } from "@/types/events";

type WeeklyEventsSliderProps = {
  events: FlyerEvent[];
};

export function WeeklyEventsSlider({ events }: WeeklyEventsSliderProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (events.length === 0) return null;

  return (
    <>
      <EventsSlider
        title="This Week's Events"
        events={events}
        containerClassName="weekly-events"
        titleClassName="weekly-events-title"
        imageClassName="weekly-events-image"
        onImageClick={setModalImage}
      />

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
