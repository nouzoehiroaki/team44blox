/**
 * ゲーム（Pixi）⇄ React間のフライヤー表示ブリッジ。
 * GameCanvas側が値・関数を設定し、シーン側が参照する。
 */
export const flyerBridge = {
  /** 今月以降のイベントが1件以上あるか（無ければレジの選択肢をスキップ） */
  hasEvents: false,
  /** フライヤーオーバーレイ表示中か（ゲーム側はこの間入力を止める） */
  isOpen: false,
  /** オーバーレイを開く（React側で差し替えられる） */
  open: () => {},
};

/** メッセージフォーム（ポスト）用ブリッジ */
export const contactBridge = {
  isOpen: false,
  open: () => {},
};
