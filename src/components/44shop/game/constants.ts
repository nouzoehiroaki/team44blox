// 44SHOP ゲーム共通定数
export const GAME_W = 1248;
export const GAME_H = 832;

// 外観シーンの歩行可能範囲（歩道）
export const GROUND_TOP = 700;
export const GROUND_BOTTOM = 820;

export const ASSETS = {
  shopBg: '/44shop/shop-bg.webp',
  kge: '/44shop/kge.png',
} as const;

export type SceneName = 'outside' | 'inside';
