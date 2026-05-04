"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Tag, Category, NewsItem, ExternalLink } from "@/types/news";

type NewsTabsProps = {
  categories: Category[];
  newsByCategory: Record<string, NewsItem[]>;
  tagIconMap: Record<string, string>;
  externalLinks: ExternalLink[];
};

function normalizeTag(tag: Tag | string): { id: string; name: string; icon?: { url: string; width: number; height: number; } } {
  if (typeof tag === 'string') {
    return { id: tag, name: tag };
  }
  return tag;
}

function isNewArticle(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  try {
    const publishedDate = new Date(publishedAt);
    if (isNaN(publishedDate.getTime())) return false;
    const now = new Date();
    const diffTime = now.getTime() - publishedDate.getTime();
    if (diffTime < 0) return false;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  } catch {
    return false;
  }
}

export default function NewsTabs({ categories, newsByCategory, tagIconMap, externalLinks }: NewsTabsProps) {
  // ニュースがあるカテゴリーのみをフィルタリング
  const categoriesWithNews = categories.filter(cat => {
    const news = newsByCategory[cat.id];
    return news && news.length > 0;
  });

  // 初期タブ: "Live"を含むカテゴリーを優先、なければ最初のカテゴリー
  const getInitialTab = (): string => {
    const liveCategory = categoriesWithNews.find(cat =>
      cat.name.toLowerCase().includes('live')
    );
    if (liveCategory) return liveCategory.id;
    if (categoriesWithNews.length > 0) return categoriesWithNews[0].id;
    return "external";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  const renderNewsList = (categoryId: string) => {
    const categoryNews = newsByCategory[categoryId] || [];
    if (categoryNews.length === 0) return <p className="no-news">No news available</p>;

    return (
      <ul className="news-list">
        {categoryNews.map((item) => (
          <li key={item.id}>
            <Link href={`/news/${item.id}`} className="news-link">
              <span className="news-item-content">
                <span className="news-title">
                   {item.title}
                  {isNewArticle(item.publishedAt) && <span className="new-badge">
                    <Image
                        src={"/icons/new2.gif"}
                        alt={"New"}
                        width={20}
                        height={20}
                        className="new-icon"
                      />
                </span>}
                </span>
                {item.tag && item.tag.length > 0 && (
                  <span className="tag-icons">
                    {item.tag.map((tag, index) => {
                      const normalizedTag = normalizeTag(tag);
                      const key = `${item.id}-tag-${normalizedTag.id}-${index}`;

                      return (
                        <span key={key} className="tag-icon-wrapper">
                          {normalizedTag.icon ? (
                            <Image
                              src={normalizedTag.icon.url}
                              alt={normalizedTag.name}
                              width={20}
                              height={20}
                              className="tag-icon"
                            />
                          ) : (
                            tagIconMap[normalizedTag.name] && (
                              <Image
                                src={tagIconMap[normalizedTag.name]}
                                alt={normalizedTag.name}
                                width={20}
                                height={20}
                                className="tag-icon"
                              />
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
  };

  const renderExternalLinks = () => {
    if (externalLinks.length === 0) return <p className="no-news">No external links available</p>;

    return (
      <ul className="news-list external-links-list">
        {externalLinks.map((link, index) => (
          <li key={index}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="news-link external-link">
              <span className="news-item-content">
                <span className="news-title">{link.title}</span>
                {link.artistIcons.length > 0 && (
                  <span className="tag-icons">
                    {link.artistIcons.map((iconName, iconIndex) => (
                      <span key={iconIndex} className="tag-icon-wrapper">
                        {tagIconMap[iconName] && (
                          <Image
                            src={tagIconMap[iconName]}
                            alt={iconName}
                            width={20}
                            height={20}
                            className="tag-icon"
                          />
                        )}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="news-tabs-container">
      <div className="tabs-header">
        {categoriesWithNews.map((category) => (
          <button
            key={category.id}
            className={`tab-button ${activeTab === category.id ? "active" : ""}`}
            onClick={() => setActiveTab(category.id)}
          >
            {category.name}
          </button>
        ))}
        <button
          className={`tab-button ${activeTab === "external" ? "active" : ""}`}
          onClick={() => setActiveTab("external")}
        >
          External Links
        </button>
      </div>
      <div className="tabs-content">
        {activeTab === "external" ? (
          renderExternalLinks()
        ) : (
          renderNewsList(activeTab)
        )}
      </div>
    </div>
  );
}
