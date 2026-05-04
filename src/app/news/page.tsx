// app/news/page.tsx
import { client } from "../../../libs/client";
import "../../styles/styles.css"
import NewsTabs from "../../components/NewsTabs";
import type { NewsItem, NewsResponse, CategoryResponse } from "@/types/news";
import { getOneMonthAgo } from "@/lib/dateUtils";

// ISR
export const revalidate = 60; // 60 秒ごとに再生成

// タグとアイコンのマッピング
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

// 外部リンクデータ
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

const NEWS_FIELDS = 'id,title,category,content,tag,publishedAt,date';

export default async function NewsPage() {
  const categoryData: CategoryResponse = await client.get({
    endpoint: "categories",
    queries: { limit: 100 },
  });
  const liveCategory = categoryData.contents.find((cat) =>
    cat.name.toLowerCase().includes('live info')
  );
  let newsContents: NewsItem[];

  if (liveCategory) {
    const oneMonthAgoISO = getOneMonthAgo().toISOString();
    const [liveNewsData, otherNewsData] = await Promise.all([
      client.get({
        endpoint: "news",
        queries: {
          limit: 30,
          fields: NEWS_FIELDS,
          filters: `category[equals]${liveCategory.id}[and]date[greater_than]${oneMonthAgoISO}`,
        },
      }) as Promise<NewsResponse>,
      client.get({
        endpoint: "news",
        queries: {
          limit: 50,
          fields: NEWS_FIELDS,
          filters: `category[not_equals]${liveCategory.id}`,
        },
      }) as Promise<NewsResponse>,
    ]);
    newsContents = [...liveNewsData.contents, ...otherNewsData.contents];
  } else {
    const newsData: NewsResponse = await client.get({
      endpoint: "news",
      queries: { limit: 100, fields: NEWS_FIELDS },
    });
    newsContents = newsData.contents;
  }

  const newsByCategory = newsContents.reduce((acc: Record<string, NewsItem[]>, item) => {
    const categoryId = item.category?.id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
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
