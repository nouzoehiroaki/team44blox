import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { GAME_W, GROUND_TOP, GROUND_BOTTOM, ASSETS } from './constants';

const SPEED = 300; // px/s（論理座標）
const HEIGHT = 270; // 表示上の身長（基準スケール時）
const MARGIN_X = 50;

export type Vec = { x: number; y: number };

/**
 * 操作キャラクター（KGE）
 * - view.position = 足元基準
 * - walkTo: 目標地点へ自動歩行 / update内でキー入力の直接移動
 * - 移動中はバウンド＋スウェイ、左右反転で向きを表現
 * - yに応じた擬似奥行きスケール
 */
export class Player {
  readonly view = new Container();
  x = 120;
  y = 800;

  private sprite?: Sprite;
  private target: Vec | null = null;
  private facing = 1;
  private t = 0;
  private baseScale = 1;
  private moving = false;

  async load() {
    const tex: Texture = await Assets.load(ASSETS.kge);
    this.sprite = new Sprite(tex);
    this.sprite.anchor.set(0.5, 1);
    this.baseScale = HEIGHT / tex.height;
    this.view.addChild(this.sprite);
    this.apply();
  }

  /** 表示上の頭上の位置（吹き出し用） */
  get headY(): number {
    return this.y - HEIGHT * this.depth() - 26;
  }

  get isMoving() {
    return this.moving;
  }

  walkTo(x: number, y: number) {
    this.target = this.clamp(x, y);
  }

  stop() {
    this.target = null;
  }

  distanceTo(x: number, y: number) {
    return Math.hypot(this.x - x, this.y - y);
  }

  private clamp(x: number, y: number): Vec {
    return {
      x: Math.min(GAME_W - MARGIN_X, Math.max(MARGIN_X, x)),
      y: Math.min(GROUND_BOTTOM, Math.max(GROUND_TOP + 15, y)),
    };
  }

  private depth() {
    // 手前(下)ほど大きく
    return 0.88 + 0.24 * ((this.y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP));
  }

  /**
   * @param axis キーボード合成方向(-1〜1)。入力があれば自動歩行より優先
   */
  update(dtMs: number, axis: Vec = { x: 0, y: 0 }) {
    this.t += dtMs;
    this.moving = false;
    const step = (SPEED * dtMs) / 1000;

    if (axis.x !== 0 || axis.y !== 0) {
      this.target = null;
      const len = Math.hypot(axis.x, axis.y) || 1;
      const p = this.clamp(this.x + (axis.x / len) * step, this.y + (axis.y / len) * step);
      if (p.x !== this.x || p.y !== this.y) {
        if (Math.abs(p.x - this.x) > 0.1) this.facing = p.x > this.x ? 1 : -1;
        this.x = p.x;
        this.y = p.y;
        this.moving = true;
      }
    } else if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= step) {
        this.x = this.target.x;
        this.y = this.target.y;
        this.target = null;
      } else {
        if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.moving = true;
      }
    }
    this.apply();
  }

  private apply() {
    if (!this.sprite) return;
    const depth = this.depth();
    const bounce = this.moving ? Math.abs(Math.sin(this.t * 0.02)) * 7 : 0;
    const sway = this.moving ? Math.sin(this.t * 0.02) * 0.045 : 0;
    this.view.position.set(this.x, this.y - bounce);
    this.sprite.scale.set(this.baseScale * depth * this.facing, this.baseScale * depth);
    this.sprite.rotation = sway;
  }
}
