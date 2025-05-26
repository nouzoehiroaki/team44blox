import { client } from "../../../../libs/client";
import "../../../styles/styles.css";

type PageProps = {
  params: Promise<{ id: string }>  // ← ここがポイント
};

export default async function NewsDetail(props: PageProps) {
  // Promise を展開
  const { id } = await props.params;

  // MicroCMS などから記事を取得
  const data = await client.get({
    endpoint: "news",
    contentId: id,
  });

  return (
    <article id="content" className="content fixed">
      <div className="container">
        <h1>{data.title}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
      <div />
    </article>
  );
}

// 動的パスをビルド時に列挙
export async function generateStaticParams() {
  const { contents } = await client.get({ endpoint: "news" });
  return contents.map((item: { id: string }) => ({ id: item.id }));
}
