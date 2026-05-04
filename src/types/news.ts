export type Tag = {
  id: string;
  name: string;
  icon?: {
    url: string;
    width: number;
    height: number;
  };
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  category?: Category;
  content?: string;
  tag?: Tag[] | string[];
  publishedAt?: string;
};

export type ExternalLink = {
  title: string;
  url: string;
  artistIcons: string[];
};

export type NewsResponse = {
  contents: NewsItem[];
  totalCount: number;
};

export type CategoryResponse = {
  contents: Category[];
};
