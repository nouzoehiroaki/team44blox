import { Assets, Container, Sprite, Text, Texture } from 'pixi.js';
import { GAME_W, GAME_H, ASSETS, SceneName, SceneData, DOT_FONT } from '../constants';
import { Scene } from '../SceneManager';
import { GameInput } from '../Input';
import { Player } from '../Player';
import { IndicatorBubble } from '../ui/IndicatorBubble';

// ドア（入口）の当たり・接近判定
const DOOR = {
  centerX: 468,
  rect: { x0: 284, x1: 652, y0: 200, y1: 716 }, // タップ判定（ドア全体）
  frontY: 762, // ドア前に立つy
  nearDist: 120, // 入店可能距離
};

/**
 * 外観シーン（Phase 1）
 * - クリック/タップ地点へ歩行、押しっぱなしで追従、矢印/WASD対応
 * - ドアをタップ → 歩いて近づいてから入店
 * - ドア近くで「！」表示。Enter/Space/Zでも入店可
 */
export class OutsideScene implements Scene {
  readonly view = new Container();
  private player = new Player();
  private bubble = new IndicatorBubble();
  private offTap?: () => void;
  private pendingDoor = false;
  private entering = false;
  private hint?: Text;
  private hintAge = 0;
  private age = 0;

  constructor(
    private input: GameInput,
    private go: (name: SceneName, data?: SceneData) => void,
    private data?: SceneData,
  ) {}

  async enter() {
    const tex: Texture = await Assets.load(ASSETS.shopBg);
    const bg = new Sprite(tex);
    bg.width = GAME_W;
    bg.height = GAME_H;
    this.view.addChild(bg);

    await this.player.load();
    const spawn = this.data?.spawn ?? { x: 120, y: 800 };
    this.player.place(spawn.x, spawn.y);
    this.view.addChild(this.player.view);
    this.view.addChild(this.bubble);

    this.hint = new Text({
      text: 'クリック / タップで移動',
      style: {
        fill: 0xffffff,
        fontSize: 24,
        fontFamily: DOT_FONT,
        stroke: { color: 0x000000, width: 5 },
      },
    });
    this.hint.anchor.set(0.5);
    this.hint.position.set(GAME_W / 2, GAME_H - 40);
    this.view.addChild(this.hint);

    this.offTap = this.input.onTap((p) => {
      if (this.entering) return;
      if (this.inDoor(p.x, p.y)) {
        this.pendingDoor = true;
        this.player.walkTo(DOOR.centerX, DOOR.frontY);
      } else {
        this.pendingDoor = false;
        this.player.walkTo(p.x, p.y);
      }
    });
  }

  exit() {
    this.offTap?.();
  }

  private inDoor(x: number, y: number) {
    return x >= DOOR.rect.x0 && x <= DOOR.rect.x1 && y >= DOOR.rect.y0 && y <= DOOR.rect.y1;
  }

  private nearDoor() {
    return this.player.distanceTo(DOOR.centerX, DOOR.frontY) < DOOR.nearDist;
  }

  update(dtMs: number) {
    if (this.entering) return;
    this.age += dtMs;

    // 押しっぱなし追従（ドア上を押している間は除く）
    const ptr = this.input.pointer;
    if (ptr.down && !this.inDoor(ptr.x, ptr.y)) {
      this.pendingDoor = false;
      this.player.walkTo(ptr.x, ptr.y);
    }

    this.player.update(dtMs, this.input.axis());

    // ドア近接表示
    const near = this.nearDoor();
    this.bubble.visible = near;
    if (near) {
      this.bubble.setBase(this.player.x, this.player.headY - 30);
      this.bubble.update(dtMs);
    }

    // 入店判定：タップ予約で到着 or 近接中にキー入力
    const keyEnter =
      this.age > 500 &&
      (this.input.keys.has('enter') || this.input.keys.has(' ') || this.input.keys.has('z'));
    if (near && (this.pendingDoor && !this.player.isMoving || keyEnter)) {
      this.entering = true;
      this.go('inside');
      return;
    }

    // ヒントは6秒でフェードアウト
    if (this.hint && this.hint.alpha > 0) {
      this.hintAge += dtMs;
      if (this.hintAge > 6000) this.hint.alpha = Math.max(0, this.hint.alpha - dtMs / 600);
    }
  }
}
