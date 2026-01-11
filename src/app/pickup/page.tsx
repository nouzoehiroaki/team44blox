import { div } from "motion/react-client";
import { client } from "../../../libs/client"; // ルートエイリアスがなければ相対パスに変更
import "../../styles/styles.css"
import './pickup.css';

export const revalidate = 60;

type PickupItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

type PickupResponse = {
  contents: PickupItem[];
  totalCount: number;
  offset: number;
  limit: number;
}

function extractYouTubeEmbedUrl(content: string): string | null {
  if (!content) return null;
  // iframeタグからYouTube埋め込みURLを抽出
  const iframeMatch = content.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch && iframeMatch[1]) {
    const url = iframeMatch[1];

    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' ||
          urlObj.hostname === 'youtube.com' ||
          urlObj.hostname === 'www.youtube-nocookie.com') {
          return url;
        }
      } catch {
        return null;
      }
    }
  }
  // 通常のYouTube URLがある場合、埋め込み用に変換
  const youtubeMatch = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return null;
}

// 安全なHTMLコンテンツをレンダリングするコンポーネント
function SafeContent({ content, title }: { content: string; title: string }) {
  const embedUrl = extractYouTubeEmbedUrl(content);

  if (embedUrl) {
    return (
      <div className="videoWrapper">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="video"
          loading="lazy"
        />
      </div>
    );
  }

  // 動画が見つからない場合はメッセージを表示
  return (
    <div className="noVideo">
      <p>動画コンテンツが見つかりません</p>
    </div>
  );
}

export default async function PickupPage() {
  try {
    const pickupData: PickupResponse = await client.get({
      endpoint: "pickup",
      queries: {
        limit: 100,
        fields: 'id,title,content'
      }
    });

    if (!pickupData.contents || pickupData.contents.length === 0) {
      return (
        <div id="news" className="news fixed">
          <div className="container">
            <div className="inner">
              <h1 className="pageTitle">FAV CLIPS</h1>
              <p className="noContent">現在、表示するコンテンツはありません。</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="news" className="news fixed">
        <div className="container">
          <div className="inner">
            <h1 className="pageTitle">FAV CLIPS</h1>

            <div className="pickupGrid">
              {pickupData.contents.map((item) => (
                <article key={item.id} className="pickupItem">
                  <h2 className="itemTitle">{item.title}</h2>
                  <SafeContent content={item.content} title={item.title} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch pickup data:', error);

    return (
      <div id="news" className="news fixed">
        <div className="container">
          <div className="inner">
            <h1 className="pageTitle">PICK UP</h1>
            <p className="errorMessage">コンテンツの取得に失敗しました。</p>
          </div>
        </div>
      </div>
    );
  }
}