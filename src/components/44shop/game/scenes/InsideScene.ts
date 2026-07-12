import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { GAME_W, GAME_H, ASSETS, SceneName, SceneData, OUTSIDE_DOOR_SPAWN } from '../constants';
import { Scene } from '../SceneManager';
import { GameInput } from '../Input';
import { Player } from '../Player';
import { IndicatorBubble } from '../ui/IndicatorBubble';
import { DqWindow } from '../ui/DqWindow';
import { REGI_DIALOGS, GOODS_PLACEHOLDER, CD_PLACEHOLDER } from '../dialogs';

type SpotId = 'regi' | 'goods' | 'cd' | 'exit';

type Spot = {
  id: SpotId;
  /** 立ち位置（歩行目標） */
  standX: number;
  standY: number;
  /** タップ判定矩形 */
  rect: { x0: number; y0: number; x1: number; y1: number };
  nearDist: number;
};

// 店内マップ（inside-bg 1248x832）に合わせたスポット定義
const SPOTS: Spot[] = [
  { id: 'regi', standX: 184, standY: 460, rect: { x0: 48, y0: 190, x1: 320, y1: 370 }, nearDist: 130 },
  { id: 'goods', standX: 600, standY: 440, rect: { x0: 416, y0: 100, x1: 784, y1: 280 }, nearDist: 140 },
  { id: 'cd', standX: 1032, standY: 450, rect: { x0: 864, y0: 100, x1: 1200, y1: 295 }, nearDist: 140 },
  { id: 'exit', standX: 624, standY: 790, rect: { x0: 548, y0: 740, x1: 700, y1: 832 }, nearDist: 90 },
];

const BOUNDS = { minX: 70, maxX: GAME_W - 70, minY: 430, maxY: 805 };

/**
 * 店内シーン（Phase 2）
 * - レジ / グッズ / CD / 出口 のスポット。タップ→歩いて近づいてから発火
 * - レジ: DQ風会話ウィンドウ（タイプライター・ページ送り）
 * - グッズ/CD: プレースホルダ会話（Phase 3/4 で本実装）
 */
export class InsideScene implements Scene {
  readonly view = new Container();
  private player = new Player();
  private bubble = new IndicatorBubble();
  private window = new DqWindow({ width: 1080, height: 250 });
  private offTap?: () => void;
  private pending: SpotId | null = null;
  private leaving = false;
  private regiCount = 0;
  private age = 0;
  private keyLatch = false;

  constructor(private input: GameInput, private go: (name: SceneName, data?: SceneData) => void) {}

  async enter() {
    const tex: Texture = await Assets.load(ASSETS.insideBg);
    const bg = new Sprite(tex);
    bg.width = GAME_W;
    bg.height = GAME_H;
    this.view.addChild(bg);

    this.player.setBounds(BOUNDS);
    await this.player.load();
    this.player.place(624, 700); // 入口（EXITマット手前）
    this.view.addChild(this.player.view);
    this.view.addChild(this.bubble);

    this.window.position.set(GAME_W / 2, GAME_H - 170);
    this.view.addChild(this.window);

    this.offTap = this.input.onTap((p) => {
      if (this.leaving) return;
      // ウィンドウ表示中: 内側タップ=送り, 外側タップ=閉じる
      if (this.window.isOpen) {
        if (this.window.containsPoint(p.x, p.y)) this.window.advance();
        else this.window.close();
        return;
      }
      const spot = SPOTS.find(
        (s) => p.x >= s.rect.x0 && p.x <= s.rect.x1 && p.y >= s.rect.y0 && p.y <= s.rect.y1,
      );
      if (spot) {
        this.pending = spot.id;
        this.player.walkTo(spot.standX, spot.standY);
      } else {
        this.pending = null;
        this.player.walkTo(p.x, p.y);
      }
    });
  }

  exit() {
    this.offTap?.();
  }

  private nearSpot(): Spot | undefined {
    return SPOTS.find((s) => this.player.distanceTo(s.standX, s.standY) < s.nearDist);
  }

  private trigger(id: SpotId) {
    this.pending = null;
    switch (id) {
      case 'regi': {
        const lines = REGI_DIALOGS[this.regiCount % REGI_DIALOGS.length];
        this.regiCount++;
        this.window.open(lines);
        break;
      }
      case 'goods':
        this.window.open(GOODS_PLACEHOLDER);
        break;
      case 'cd':
        this.window.open(CD_PLACEHOLDER);
        break;
      case 'exit':
        this.leaving = true;
        this.go('outside', { spawn: OUTSIDE_DOOR_SPAWN });
        break;
    }
  }

  update(dtMs: number) {
    if (this.leaving) return;
    this.age += dtMs;

    // モーダル中はキャラ操作停止。ESC/決定キー処理のみ
    if (this.window.isOpen) {
      this.window.update(dtMs);
      const k = this.input.keys;
      const decide = k.has('enter') || k.has(' ') || k.has('z');
      if (k.has('escape')) {
        this.window.close();
      } else if (decide) {
        if (!this.keyLatch) {
          this.keyLatch = true;
          this.window.advance();
        }
      } else {
        this.keyLatch = false;
      }
      this.player.update(dtMs); // 待機モーション維持
      this.bubble.visible = false;
      return;
    }

    // 押しっぱなし追従（スポット上を除く）
    const ptr = this.input.pointer;
    if (ptr.down) {
      const overSpot = SPOTS.some(
        (s) => ptr.x >= s.rect.x0 && ptr.x <= s.rect.x1 && ptr.y >= s.rect.y0 && ptr.y <= s.rect.y1,
      );
      if (!overSpot) {
        this.pending = null;
        this.player.walkTo(ptr.x, ptr.y);
      }
    }

    this.player.update(dtMs, this.input.axis());

    const near = this.nearSpot();
    this.bubble.visible = !!near;
    if (near) {
      this.bubble.setBase(this.player.x, this.player.headY - 30);
      this.bubble.update(dtMs);
    }

    // 発火: タップ予約で到着 / 近接中に決定キー
    const k = this.input.keys;
    const decide = this.age > 500 && (k.has('enter') || k.has(' ') || k.has('z'));
    if (near && this.pending === near.id && !this.player.isMoving) {
      this.trigger(near.id);
    } else if (near && decide && !this.keyLatch) {
      this.keyLatch = true;
      this.trigger(near.id);
    } else if (!decide) {
      this.keyLatch = false;
    }
  }
}
