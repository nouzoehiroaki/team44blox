import { client } from "../../../../libs/client";
import "../../../styles/styles.css"

// 動的パスをビルド時に列挙
export async function generateStaticParams() {
  const { contents } = await client.get({ endpoint: "news" });
  return contents.map((item: { id: string }) => ({ id: item.id }));
}

export default async function NewsDetail({
  params,
}: {
  params: { id: string };
}) {
  const data = await client.get({
    endpoint: "news",
    contentId: params.id,
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
