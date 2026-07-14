// 44SHOP ゲーム共通定数
export const GAME_W = 1248;
export const GAME_H = 832;

// 外観シーンの歩行可能範囲（歩道）
export const GROUND_TOP = 738;
export const GROUND_BOTTOM = 810;

export const ASSETS = {
  shopBg: '/44shop/shop-bg.webp',
  insideBg: '/44shop/inside-bg.webp',
  kge: '/44shop/kge.png',
} as const;

export type SceneName = 'outside' | 'inside';

/** ドット系フォント（@fontsource/dotgothic16） */
export const DOT_FONT = '"DotGothic16", sans-serif';

/** 外観：ドア前スポーン（店から出た時） */
export const OUTSIDE_DOOR_SPAWN = { x: 655, y: 785 };

/** シーン遷移時に渡すデータ */
export type SceneData = { spawn?: { x: number; y: number } };
