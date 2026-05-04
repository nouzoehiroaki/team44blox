import { div } from "motion/react-client";
import { client } from "../../../libs/client";
import "../../styles/styles.css"
import './pickup.css';

import type { PickupResponse } from "@/types/pickup";
import { extractYouTubeEmbedUrl } from "@/lib/youtubeUtils";

export const revalidate = 60;

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