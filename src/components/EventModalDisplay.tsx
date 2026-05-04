"use client";
import { Modal } from "@/components/ui/Modal";
import type { FlyerEvent } from "@/types/events";

type EventModalDisplayProps = {
  isOpen: boolean;
  onClose: () => void;
  events: FlyerEvent[];
};

export function EventModalDisplay({ isOpen, onClose, events }: EventModalDisplayProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flyer-gallery">
        {events.map((event) => (
          <div key={event.id} className="event-group">
            {event.images?.url && (
              <img src={event.images.url} alt={event.title} className="flyer-image" />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
