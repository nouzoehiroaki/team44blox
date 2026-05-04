export type PickupItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

export type PickupResponse = {
  contents: PickupItem[];
  totalCount: number;
  offset: number;
  limit: number;
};
