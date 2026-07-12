import { Application, Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import { GAME_W, GAME_H } from './constants';

export type Point = { x: number; y: number };
export type TapHandler = (p: Point) => void;

/**
 * 入力抽象化レイヤー
 * マウス / タッチ / キーボードを統一的に扱う。
 * - tap: クリック or タップ（論理座標）
 * - pointer: 押下中の現在位置（長押し追従用）
 * - keys: 押下中のキー（矢印・WASD）
 */
export class GameInput {
  readonly keys = new Set<string>();
  readonly pointer: Point & { down: boolean } = { x: 0, y: 0, down: false };

  private tapHandlers: TapHandler[] = [];
  private layer: Container;
  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  constructor(private app: Application) {
    this.layer = new Container();
    this.layer.eventMode = 'static';
    this.layer.hitArea = new Rectangle(0, 0, GAME_W, GAME_H);
    app.stage.addChild(this.layer);

    this.layer.on('pointerdown', (e: FederatedPointerEvent) => {
      this.pointer.down = true;
      this.setPos(e);
      this.tapHandlers.forEach((h) => h({ x: this.pointer.x, y: this.pointer.y }));
    });
    this.layer.on('pointermove', (e: FederatedPointerEvent) => this.setPos(e));
    const up = () => {
      this.pointer.down = false;
    };
    this.layer.on('pointerup', up);
    this.layer.on('pointerupoutside', up);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private setPos(e: FederatedPointerEvent) {
    this.pointer.x = e.global.x;
    this.pointer.y = e.global.y;
  }

  onTap(h: TapHandler): () => void {
    this.tapHandlers.push(h);
    return () => {
      this.tapHandlers = this.tapHandlers.filter((x) => x !== h);
    };
  }

  /** 矢印キー/WASD の合成方向 (-1〜1) */
  axis(): Point {
    const k = this.keys;
    const x = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0);
    const y = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0);
    return { x, y };
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.tapHandlers = [];
    this.layer.destroy();
  }
}
