"use client";
import type { Category } from "@/types/news";

type NewsTabHeaderProps = {
  categories: Category[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export function NewsTabHeader({ categories, activeTab, onTabChange }: NewsTabHeaderProps) {
  return (
    <div className="tabs-header">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`tab-button ${activeTab === category.id ? "active" : ""}`}
          onClick={() => onTabChange(category.id)}
        >
          {category.name}
        </button>
      ))}
      <button
        className={`tab-button ${activeTab === "external" ? "active" : ""}`}
        onClick={() => onTabChange("external")}
      >
        External Links
      </button>
    </div>
  );
}
