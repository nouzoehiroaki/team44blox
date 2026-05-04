"use client";
import Image from "next/image";
import type { ExternalLink } from "@/types/news";

type ExternalLinksRendererProps = {
  links: ExternalLink[];
  tagIconMap: Record<string, string>;
};

export function ExternalLinksRenderer({ links, tagIconMap }: ExternalLinksRendererProps) {
  if (links.length === 0) return <p className="no-news">No external links available</p>;

  return (
    <ul className="news-list external-links-list">
      {links.map((link, index) => (
        <li key={index}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="news-link external-link">
            <span className="news-item-content">
              <span className="news-title">{link.title}</span>
              {link.artistIcons.length > 0 && (
                <span className="tag-icons">
                  {link.artistIcons.map((iconName, iconIndex) => (
                    <span key={iconIndex} className="tag-icon-wrapper">
                      {tagIconMap[iconName] && (
                        <Image src={tagIconMap[iconName]} alt={iconName} width={20} height={20} className="tag-icon" />
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
}
