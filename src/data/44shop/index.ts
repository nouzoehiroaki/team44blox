/**
 * 44SHOP 商品データ（JSONファイル管理）
 * 更新フロー: JSON編集＋画像配置 → コミット → デプロイ
 * 不正データ（必須欠落・型不一致・参照切れ）はモジュール読込時に例外で検知する。
 */
import goodsJson from './goods.json';
import artistsJson from './artists.json';
import cdsJson from './cds.json';
import recordsJson from './records.json';

export type Goods = {
  id: string;
  name: string;
  image: string;
  price?: number;
  ecUrl: string;
  order?: number;
  /** 売り切れフラグ（trueでSOLD OUT表示） */
  soldOut?: boolean;
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
  ecUrl: string;
  releaseYear?: number;
};

/** レコード（バイナル）。スキーマはCDと同一 */
export type VinylRecord = Cd;

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
    req(
      item.soldOut === undefined || typeof item.soldOut === 'boolean',
      `goods[${item.id}]: soldOut は真偽値`,
    );
    return item;
  });
}

export const GOODS: Goods[] = validateGoods(goodsJson).sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);

function validateArtists(raw: unknown): Artist[] {
  req(Array.isArray(raw), 'artists.json は配列である必要があります');
  const ids = new Set<string>();
  return raw.map((a, i) => {
    const item = a as Artist;
    req(typeof item.id === 'string' && item.id.length > 0, `artists[${i}]: id が必要です`);
    req(!ids.has(item.id), `artists: id "${item.id}" が重複しています`);
    ids.add(item.id);
    req(typeof item.name === 'string' && item.name.length > 0, `artists[${item.id}]: name が必要です`);
    req(
      typeof item.initial === 'string' && /^[A-Z#]$/.test(item.initial),
      `artists[${item.id}]: initial は A-Z または # が必要です`,
    );
    return item;
  });
}

function validateCds(raw: unknown, artists: Artist[], label: string): Cd[] {
  req(Array.isArray(raw), `${label}.json は配列である必要があります`);
  const ids = new Set<string>();
  const artistIds = new Set(artists.map((a) => a.id));
  return raw.map((c, i) => {
    const item = c as Cd;
    req(typeof item.id === 'string' && item.id.length > 0, `${label}[${i}]: id が必要です`);
    req(!ids.has(item.id), `${label}: id "${item.id}" が重複しています`);
    ids.add(item.id);
    req(typeof item.title === 'string' && item.title.length > 0, `${label}[${item.id}]: title が必要です`);
    req(
      artistIds.has(item.artistId),
      `${label}[${item.id}]: artistId "${item.artistId}" が artists.json に存在しません`,
    );
    req(
      typeof item.jacket === 'string' && item.jacket.startsWith('/'),
      `${label}[${item.id}]: jacket は "/" 始まりのパスが必要です`,
    );
    req(
      typeof item.ecUrl === 'string' && /^https?:\/\//.test(item.ecUrl),
      `${label}[${item.id}]: ecUrl は http(s) URLが必要です`,
    );
    return item;
  });
}

export const ARTISTS: Artist[] = validateArtists(artistsJson).sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);
export const CDS: Cd[] = validateCds(cdsJson, ARTISTS, 'cds').sort(
  (a, b) => (a.releaseYear ?? 9999) - (b.releaseYear ?? 9999),
);
export const RECORDS: VinylRecord[] = validateCds(recordsJson, ARTISTS, 'records').sort(
  (a, b) => (a.releaseYear ?? 9999) - (b.releaseYear ?? 9999),
);

/** 頭文字 → アーティスト一覧（A-Z順の全26文字＋#） */
export const INITIALS: string[] = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'];

export function artistsByInitial(initial: string): Artist[] {
  return ARTISTS.filter((a) => a.initial === initial);
}

export function cdsByArtist(artistId: string): Cd[] {
  return CDS.filter((c) => c.artistId === artistId);
}

export function recordsByArtist(artistId: string): VinylRecord[] {
  return RECORDS.filter((c) => c.artistId === artistId);
}
