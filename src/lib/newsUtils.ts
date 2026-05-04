import type { Tag } from "@/types/news";

export function normalizeTag(tag: Tag | string): { id: string; name: string; icon?: { url: string; width: number; height: number } } {
  if (typeof tag === 'string') return { id: tag, name: tag };
  return tag;
}

export function isNewArticle(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  try {
    const publishedDate = new Date(publishedAt);
    if (isNaN(publishedDate.getTime())) return false;
    const diffTime = new Date().getTime() - publishedDate.getTime();
    if (diffTime < 0) return false;
    return diffTime / (1000 * 60 * 60 * 24) <= 7;
  } catch {
    return false;
  }
}
