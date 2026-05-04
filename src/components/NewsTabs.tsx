"use client";
import { useState } from "react";
import type { Category, NewsItem, ExternalLink } from "@/types/news";
import { NewsTabHeader } from "@/components/NewsTabHeader";
import { NewsListRenderer } from "@/components/NewsListRenderer";
import { ExternalLinksRenderer } from "@/components/ExternalLinksRenderer";

type NewsTabsProps = {
  categories: Category[];
  newsByCategory: Record<string, NewsItem[]>;
  tagIconMap: Record<string, string>;
  externalLinks: ExternalLink[];
};

export default function NewsTabs({ categories, newsByCategory, tagIconMap, externalLinks }: NewsTabsProps) {
  const categoriesWithNews = categories.filter((cat) => newsByCategory[cat.id]?.length > 0);

  const getInitialTab = (): string => {
    const liveCategory = categoriesWithNews.find((cat) => cat.name.toLowerCase().includes('live'));
    if (liveCategory) return liveCategory.id;
    if (categoriesWithNews.length > 0) return categoriesWithNews[0].id;
    return "external";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  return (
    <div className="news-tabs-container">
      <NewsTabHeader categories={categoriesWithNews} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="tabs-content">
        {activeTab === "external" ? (
          <ExternalLinksRenderer links={externalLinks} tagIconMap={tagIconMap} />
        ) : (
          <NewsListRenderer items={newsByCategory[activeTab] ?? []} tagIconMap={tagIconMap} />
        )}
      </div>
    </div>
  );
}
