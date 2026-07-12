/**
 * 44SHOP 商品データ（JSONファイル管理）
 * 更新フロー: JSON編集＋画像配置 → コミット → デプロイ
 * 不正データ（必須欠落・型不一致・参照切れ）はモジュール読込時に例外で検知する。
 */
import goodsJson from './goods.json';

export type Goods = {
  id: string;
  name: string;
  image: string;
  price?: number;
  ecUrl: string;
  order?: number;
};

export type Artist = {
  id: string;
  name: string;
  initial: string; // A-Z or '#'
  order?: number;
};

export type Cd = {
  id: string;
  title: string;
  artistId: string;
  jacket: string;
  price?: number;
  ecUrl: string;
  releaseYear?: number;
};

function req(cond: boolean, msg: string): asserts cond {
  if (!cond) throw new Error(`[44shop data] ${msg}`);
}

function validateGoods(raw: unknown): Goods[] {
  req(Array.isArray(raw), 'goods.json は配列である必要があります');
  const ids = new Set<string>();
  return raw.map((g, i) => {
    const item = g as Goods;
    req(typeof item.id === 'string' && item.id.length > 0, `goods[${i}]: id が必要です`);
    req(!ids.has(item.id), `goods: id "${item.id}" が重複しています`);
    ids.add(item.id);
    req(typeof item.name === 'string' && item.name.length > 0, `goods[${item.id}]: name が必要です`);
    req(
      typeof item.image === 'string' && item.image.startsWith('/'),
      `goods[${item.id}]: image は "/" 始まりのパスが必要です`,
    );
    req(
      typeof item.ecUrl === 'string' && /^https?:\/\//.test(item.ecUrl),
      `goods[${item.id}]: ecUrl は http(s) URLが必要です`,
    );
    req(item.price === undefined || typeof item.price === 'number', `goods[${item.id}]: price は数値`);
    req(item.order === undefined || typeof item.order === 'number', `goods[${item.id}]: order は数値`);
    return item;
  });
}

export const GOODS: Goods[] = validateGoods(goodsJson).sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);
