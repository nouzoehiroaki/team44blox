export interface FlyerEvent {
  id: string;
  date: string;
  title: string;
  images: {
    url: string;
    width?: number;
    height?: number;
  };
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
  events: FlyerEvent[];
}
