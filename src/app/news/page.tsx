// app/news/page.tsx
import Link from "next/link";
import { client } from "../../../libs/client"; // ルートエイリアスがなければ相対パスに変更
import "../../styles/styles.css"

// ❶ ISR をしたい場合は revalidate を指定（秒）
export const revalidate = 3600; // 60 秒ごとに再生成

export default async function NewsPage() {
  const data = await client.get({ endpoint: "news" });

  return (
    <div>
      <div id="news" className="news fixed">
        <div className="container">
          <h1>NEWS</h1>
          <ul>
            {data.contents.map((item: { id: string; title: string }) => (
              <li key={item.id}>
                <Link href={`/news/${item.id}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
