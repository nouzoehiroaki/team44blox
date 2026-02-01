// app/news/page.tsx
import { client } from "../../../libs/client";
import "../../styles/styles.css"
import NewsTabs from "../../components/NewsTabs";

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
  'TEAM44BLOX': '/icons/44-icon.png',
};

// 外部リンクのダミーデータ（ハードコーディング）
const externalLinks = [
  {
    title: "MARS MANIEオフィシャルブログ『Run da StreetZ』",
    url: "https://ameblo.jp/marsmanie/",
    artistIcons: ["MARS MANIE"],
  },
  {
    title: "THE DOG HOUSE MUSIC STORE",
    url: "https://thedoghousemusic.stores.jp/",
    artistIcons: ["MIKRIS"],
  },
  {
    title: "Live and Music Bar BLACK BOX",
    url: "https://black---box.com/",
    artistIcons: ["JBM"],
  },
  {
    title: "KGE THE SHADOWMEN OFFICIAL WEB SITE",
    url: "https://kgetheshadowmen.com/",
    artistIcons: ["KGE"],
  },
  {
    title: "大蛇 オフィシャル",
    url: "https://www.olochi.jp/",
    artistIcons: ["大蛇"],
  },
  {
    title: "NITRO MICROPHONE UNDERGROUND",
    url: "https://nitromicrophoneunderground.com/",
    artistIcons: ["DELI", "DABO"],
  },
];

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

  return (
    <div>
      <div id="news" className="news fixed">
        <div className="container">
          <h1>NEWS</h1>
          <NewsTabs
            categories={categoryData.contents}
            newsByCategory={newsByCategory}
            tagIconMap={tagIconMap}
            externalLinks={externalLinks}
          />
        </div>
      </div>
    </div>
  );
}
