import { Application, Assets } from 'pixi.js';
import { GAME_W, GAME_H, ASSETS, SceneName, SceneData } from './constants';
import { GameInput } from './Input';
import { SceneManager, Scene } from './SceneManager';
import { OutsideScene } from './scenes/OutsideScene';
import { InsideScene } from './scenes/InsideScene';

/**
 * Pixi アプリケーションの生成・破棄とキャンバスのフィット処理。
 * 論理解像度 GAME_W×GAME_H 固定、CSSでアスペクト比維持フィット（レターボックス）。
 * @returns dispose 関数
 */
export async function createGame(host: HTMLElement): Promise<() => void> {
  // ドットフォントを先に読み込む（Pixi Textのラスタライズ前に必要）
  try {
    await document.fonts.load('30px "DotGothic16"');
  } catch {
    /* フォールバックフォントで続行 */
  }

  const app = new Application();
  await app.init({
    width: GAME_W,
    height: GAME_H,
    background: 0x0b0a09,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  const canvas = app.canvas;
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);

  // レターボックスフィット
  const fit = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    const scale = Math.min(w / GAME_W, h / GAME_H);
    canvas.style.width = `${Math.floor(GAME_W * scale)}px`;
    canvas.style.height = `${Math.floor(GAME_H * scale)}px`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  // シーンアセットを先読み（遷移時のデコードジャンクを防ぎ、フェードを常に一定にする）
  await Assets.load(Object.values(ASSETS));

  const input = new GameInput(app);
  const manager: SceneManager = new SceneManager(app, (name: SceneName, data?: SceneData): Scene => {
    const go = (n: SceneName, d?: SceneData) => void manager.goTo(n, d);
    return name === 'outside' ? new OutsideScene(input, go, data) : new InsideScene(input, go);
  });
  void manager.goTo('outside', undefined, 0);

  return () => {
    ro.disconnect();
    manager.destroy();
    input.destroy();
    app.destroy(true, { children: true, texture: true });
  };
}
