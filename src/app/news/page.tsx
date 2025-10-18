// app/news/page.tsx
import Link from "next/link";
import { client } from "../../../libs/client"; // ルートエイリアスがなければ相対パスに変更
import "../../styles/styles.css"

// ❶ ISR をしたい場合は revalidate を指定（秒）
export const revalidate = 60; // 60 秒ごとに再生成

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
}

type NewsResponse = {
  contents: NewsItem[];
  totalCount: number;
}

type CategoryResponse = {
  contents: Category[];
}



export default async function NewsPage() {
  const newsData: NewsResponse = await client.get({
    endpoint: "news",
    queries: {
      limit: 100, // 全件取得のため増やす
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
  const uncategorizedNews = newsByCategory['uncategorized'] || [];

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
                        <Link href={`/news/${item.id}`}>
                          <span className="news-title">{item.title}</span>
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
