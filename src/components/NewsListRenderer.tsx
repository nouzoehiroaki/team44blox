"use client";
import Link from "next/link";
import Image from "next/image";
import type { NewsItem } from "@/types/news";
import { normalizeTag, isNewArticle } from "@/lib/newsUtils";

type NewsListRendererProps = {
  items: NewsItem[];
  tagIconMap: Record<string, string>;
};

export function NewsListRenderer({ items, tagIconMap }: NewsListRendererProps) {
  if (items.length === 0) return <p className="no-news">No news available</p>;

  return (
    <ul className="news-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={`/news/${item.id}`} className="news-link">
            <span className="news-item-content">
              <span className="news-title">
                {item.title}
                {isNewArticle(item.publishedAt) && (
                  <span className="new-badge">
                    <Image src="/icons/new2.gif" alt="New" width={20} height={20} className="new-icon" />
                  </span>
                )}
              </span>
              {item.tag && item.tag.length > 0 && (
                <span className="tag-icons">
                  {item.tag.map((tag, index) => {
                    const normalizedTag = normalizeTag(tag);
                    return (
                      <span key={`${item.id}-tag-${normalizedTag.id}-${index}`} className="tag-icon-wrapper">
                        {normalizedTag.icon ? (
                          <Image src={normalizedTag.icon.url} alt={normalizedTag.name} width={20} height={20} className="tag-icon" />
                        ) : (
                          tagIconMap[normalizedTag.name] && (
                            <Image src={tagIconMap[normalizedTag.name]} alt={normalizedTag.name} width={20} height={20} className="tag-icon" />
                          )
                        )}
                      </span>
                    );
                  })}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
