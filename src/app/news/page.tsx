// app/news/page.tsx
import Link from "next/link";
import Image from "next/image";
import { client } from "../../../libs/client";
import "../../styles/styles.css"

// ISR
export const revalidate = 60; // 60 秒ごとに再生成

type Tag = {
  id: string;
  name: string;
  icon?: {
    url: string;
    width: number;
    height: number;
  };
}

type Category = {
  id: string;
  name: string;
  slug?: string;
}

type NewsItem = {
  id: string;
  title: string;
  category?: Category;
  content?: string;
  tag?: Tag[] | string[];
}

type NewsResponse = {
  contents: NewsItem[];
  totalCount: number;
}

type CategoryResponse = {
  contents: Category[];
}

type TagResponse = {
  contents: Tag[];
}

// タグとアイコンのマッピング（microCMSでアイコン画像を管理しない場合）
const tagIconMap: Record<string, string> = {
  'JBM': '/icons/jbm-icon.jpg',
  'MIKRIS': '/icons/mikris-icon.jpg',
  'DELI': '/icons/deli-icon.jpg',
  '大蛇': '/icons/olochi-icon.jpg',
  'MARS MANIE': '/icons/mars-icon.jpg',
  'DABO': '/icons/dabo-icon.jpg',
  'GOCCI': '/icons/gocci-icon.jpg',
  'SMITH-CN': '/icons/smith-cn-icon.jpg',
  'SNIPE': '/icons/snipe-icon.jpg',
  'KGE': '/icons/kge.jpg',
  'T-MANGKANG': '/icons/t-mangkang-icon.jpg',
  'BASS': '/icons/bass-icon.jpg',
  'MAILMAN': '/icons/mailman-icon.jpg',
};

// タグ情報を正規化する関数
function normalizeTag(tag: Tag | string): { id: string; name: string; icon?: { url: string; width: number; height: number; } } {
  if (typeof tag === 'string') {
    return { id: tag, name: tag };
  }
  return tag;
}


export default async function NewsPage() {
  const newsData: NewsResponse = await client.get({
    endpoint: "news",
    queries: {
      limit: 100, // 全件取得のため増やす
      fields: 'id,title,category,content,tag'
    }
  });

  const categoryData: CategoryResponse = await client.get({
    endpoint: "categories", // カテゴリーのエンドポイント名に合わせて変更してください
    queries: {
      limit: 100
    }
  });

  // カテゴリーごとにニュースをグループ化
  const newsByCategory = newsData.contents.reduce((acc: Record<string, NewsItem[]>, item) => {
    const categoryId = item.category?.id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {});

  // カテゴリーなしの記事を処理
  // const uncategorizedNews = newsByCategory['uncategorized'] || [];

  return (
    <div>
      <div id="news" className="news fixed">
        <div className="container">
          <h1>NEWS</h1>
          <div className="wrap">
            {/* カテゴリー別に表示 */}
            {categoryData.contents.map((category) => {
              const categoryNews = newsByCategory[category.id] || [];
              if (categoryNews.length === 0) return null;

              return (
                <div key={category.id} className="category-section">
                  <h2 className="category-title">{category.name}</h2>
                  <ul className="news-list">
                    {categoryNews.map((item) => (
                      <li key={item.id}>
                        <Link href={`/news/${item.id}`} className="news-link">
                          <span className="news-item-content">
                            <span className="news-title">{item.title}</span>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
