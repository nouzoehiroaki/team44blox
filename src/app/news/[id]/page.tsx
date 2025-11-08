import { client } from "../../../../libs/client";
import "../../../styles/styles.css";

type Params = { id: string };

export default async function NewsDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

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

export async function generateStaticParams() {
  const { contents } = await client.get({ endpoint: "news" });
  return contents.map((item: { id: string }) => ({ id: item.id }));
}