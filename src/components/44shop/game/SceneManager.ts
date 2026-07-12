import { Application, Container, Graphics } from 'pixi.js';
import { GAME_W, GAME_H, SceneName, SceneData } from './constants';

export interface Scene {
  /** シーンの表示ツリールート */
  readonly view: Container;
  enter(): Promise<void> | void;
  exit(): void;
  /** 毎フレーム呼ばれる（deltaMS: 前フレームからの経過ms） */
  update(deltaMS: number): void;
}

export type SceneFactory = (name: SceneName, data?: SceneData) => Scene;

/**
 * シーン管理（フェード付き切替）
 */
export class SceneManager {
  private current?: Scene;
  private overlay: Graphics;
  private switching = false;
  private destroyed = false;

  constructor(private app: Application, private factory: SceneFactory) {
    this.overlay = new Graphics().rect(0, 0, GAME_W, GAME_H).fill(0x000000);
    this.overlay.alpha = 0;
    this.overlay.eventMode = 'none';
    app.stage.addChild(this.overlay);
    app.ticker.add(this.tick);
  }

  private tick = () => {
    this.current?.update(this.app.ticker.deltaMS);
  };

  get isSwitching() {
    return this.switching;
  }

  async goTo(name: SceneName, data?: SceneData, fadeMs = 350): Promise<void> {
    if (this.switching || this.destroyed) return;
    this.switching = true;
    try {
      if (this.current) await this.fade(1, fadeMs);
      if (this.destroyed) return;
      if (this.current) {
        this.current.exit();
        this.app.stage.removeChild(this.current.view);
        this.current.view.destroy({ children: true });
      }
      const next = this.factory(name, data);
      this.current = next;
      this.app.stage.addChildAt(next.view, 0);
      try {
        await next.enter();
      } catch (e) {
        console.error('[44shop] scene enter failed:', e);
      }
      await this.fade(0, fadeMs);
    } finally {
      this.switching = false;
    }
  }

  private fade(to: number, ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (ms <= 0) {
        this.overlay.alpha = to;
        resolve();
        return;
      }
      // NaN汚染からの回復（保険）
      const from = Number.isFinite(this.overlay.alpha) ? this.overlay.alpha : 1 - to;
      const start = performance.now();
      const step = () => {
        if (this.destroyed) return resolve();
        const t = Math.min(1, (performance.now() - start) / ms);
        this.overlay.alpha = from + (to - from) * t;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      step();
    });
  }

  destroy() {
    this.destroyed = true;
    this.app.ticker.remove(this.tick);
    if (this.current) {
      this.current.exit();
      this.current = undefined;
    }
  }
}
