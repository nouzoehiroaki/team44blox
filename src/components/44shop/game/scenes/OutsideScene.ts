import { Assets, Container, Sprite, Text, Texture } from 'pixi.js';
import { GAME_W, GAME_H, ASSETS, SceneName, SceneData, DOT_FONT } from '../constants';
import { Scene } from '../SceneManager';
import { GameInput } from '../Input';
import { Player } from '../Player';
import { IndicatorBubble } from '../ui/IndicatorBubble';
import { SpeechBubble } from '../ui/SpeechBubble';
import { DqWindow } from '../ui/DqWindow';
import { MAILMAN_DIALOGS } from '../dialogs';

// ドア（入口）の当たり・接近判定（44 STORE: 中央のOPEN札のドア）
const DOOR = {
  centerX: 655,
  rect: { x0: 548, x1: 770, y0: 350, y1: 745 }, // タップ判定（ドア全体）
  frontY: 775, // ドア前に立つy
  nearDist: 130, // 入店可能距離
};

// DJ MAILMAN イベント
const MAILMAN = {
  triggerX: 1020, // プレイヤーがこのxより右で発生
  speechMs: 1600, // 「暇だなー」表示時間
  standX: 1160,
  standY: 790,
  height: 260,
  walkSpeed: 240, // 登場時 px/s
  nearDist: 170,
  texture: '/shop/mailman.png',
};

type MailmanState = 'none' | 'speech' | 'entering' | 'present';

/**
 * 外観シーン
 * - クリック/タップ地点へ歩行、押しっぱなしで追従、矢印/WASD対応
 * - ドアをタップ → 歩いて近づいてから入店。近くで「！」表示、Enter/Space/Zでも入店可
 * - 画面右端に行くと「暇だなー」→ DJ MAILMAN が右から登場、話しかけられる
 */
export class OutsideScene implements Scene {
  readonly view = new Container();
  private player = new Player();
  private bubble = new IndicatorBubble();
  private speech = new SpeechBubble();
  private dlg = new DqWindow({ width: 1080, height: 250 });
  private offTap?: () => void;
  private pendingDoor = false;
  private pendingMailman = false;
  private entering = false;
  private hint?: Text;
  private hintAge = 0;
  private age = 0;
  private keyLatch = false;

  private mailman?: Sprite;
  private mailmanState: MailmanState = 'none';
  private mailmanT = 0;
  private mailmanCount = 0;

  constructor(
    private input: GameInput,
    private go: (name: SceneName, data?: SceneData) => void,
    private data?: SceneData,
  ) {}

  async enter() {
    // y座標ベースの深度ソート（足元が手前のキャラが前に描画される）
    this.view.sortableChildren = true;

    const tex: Texture = await Assets.load(ASSETS.shopBg);
    const bg = new Sprite(tex);
    bg.width = GAME_W;
    bg.height = GAME_H;
    bg.zIndex = 0;
    this.view.addChild(bg);

    // 歩行不可の障害物（02.png: A看板 / 01.png: 消火栓）
    // y0=0 で上方向に無限に伸ばし、障害物の奥側（後ろ）には回り込めないようにする
    this.player.setObstacles([
      { x0: 175, y0: 0, x1: 300, y1: 795 }, // A看板（44 STORE CLOTHING RECORDS GOODS）
      { x0: 1020, y0: 0, x1: 1115, y1: 793 }, // 消火栓
    ]);
    await this.player.load();
    const spawn = this.data?.spawn ?? { x: 150, y: 795 };
    this.player.place(spawn.x, spawn.y);
    this.player.view.zIndex = this.player.y;
    this.view.addChild(this.player.view);
    this.bubble.zIndex = 10000;
    this.view.addChild(this.bubble);
    this.speech.zIndex = 10001;
    this.view.addChild(this.speech);

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
    this.hint.zIndex = 10002;
    this.view.addChild(this.hint);

    this.dlg.position.set(GAME_W / 2, GAME_H - 170);
    this.dlg.zIndex = 20000;
    this.view.addChild(this.dlg);

    this.offTap = this.input.onTap((p) => {
      if (this.entering) return;
      // 会話ウィンドウ表示中: 内側=送り, 外側=閉じる
      if (this.dlg.isOpen) {
        if (this.dlg.containsPoint(p.x, p.y)) this.dlg.advance();
        else this.dlg.close();
        return;
      }
      if (this.inDoor(p.x, p.y)) {
        this.pendingDoor = true;
        this.pendingMailman = false;
        this.player.walkTo(DOOR.centerX, DOOR.frontY);
        return;
      }
      if (this.onMailman(p.x, p.y)) {
        this.pendingMailman = true;
        this.pendingDoor = false;
        this.player.walkTo(MAILMAN.standX - 150, MAILMAN.standY);
        return;
      }
      this.pendingDoor = false;
      this.pendingMailman = false;
      this.player.walkTo(p.x, p.y);
    });
  }

  exit() {
    this.offTap?.();
  }

  private inDoor(x: number, y: number) {
    return x >= DOOR.rect.x0 && x <= DOOR.rect.x1 && y >= DOOR.rect.y0 && y <= DOOR.rect.y1;
  }

  private onMailman(x: number, y: number) {
    if (this.mailmanState !== 'present' || !this.mailman) return false;
    return (
      Math.abs(x - this.mailman.x) <= 90 &&
      y <= this.mailman.y + 20 &&
      y >= this.mailman.y - MAILMAN.height - 40
    );
  }

  private nearDoor() {
    return this.player.distanceTo(DOOR.centerX, DOOR.frontY) < DOOR.nearDist;
  }

  private nearMailman() {
    return (
      this.mailmanState === 'present' &&
      !!this.mailman &&
      this.player.distanceTo(this.mailman.x, this.mailman.y) < MAILMAN.nearDist
    );
  }

  private talkToMailman() {
    this.pendingMailman = false;
    const lines = MAILMAN_DIALOGS[this.mailmanCount % MAILMAN_DIALOGS.length];
    this.mailmanCount++;
    this.dlg.open(lines);
  }

  private async spawnMailman() {
    this.mailmanState = 'entering';
    try {
      const tex: Texture = await Assets.load(MAILMAN.texture);
      const sp = new Sprite(tex);
      sp.anchor.set(0.5, 1);
      sp.scale.set(MAILMAN.height / tex.height);
      sp.position.set(GAME_W + 100, MAILMAN.standY);
      sp.zIndex = MAILMAN.standY;
      this.mailman = sp;
      this.view.addChild(sp);
    } catch (e) {
      console.error('[44shop] mailman load failed:', e);
      this.mailmanState = 'none';
    }
  }

  update(dtMs: number) {
    if (this.entering) return;
    this.age += dtMs;

    // 会話ウィンドウ表示中
    if (this.dlg.isOpen) {
      this.dlg.update(dtMs);
      const k = this.input.keys;
      const decide = k.has('enter') || k.has(' ') || k.has('z');
      if (k.has('escape')) this.dlg.close();
      else if (decide) {
        if (!this.keyLatch) {
          this.keyLatch = true;
          this.dlg.advance();
        }
      } else this.keyLatch = false;
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // 押しっぱなし追従（ドア/MAILMAN上を押している間は除く）
    const ptr = this.input.pointer;
    if (ptr.down && !this.inDoor(ptr.x, ptr.y) && !this.onMailman(ptr.x, ptr.y)) {
      this.pendingDoor = false;
      this.pendingMailman = false;
      this.player.walkTo(ptr.x, ptr.y);
    }

    this.player.update(dtMs, this.input.axis());
    // 深度更新（yが大きい＝手前が前面に）
    this.player.view.zIndex = this.player.y;

    // --- DJ MAILMAN イベント進行 ---
    if (this.mailmanState === 'none' && this.player.x > MAILMAN.triggerX) {
      this.mailmanState = 'speech';
      this.mailmanT = 0;
      this.speech.show('暇だなー');
    } else if (this.mailmanState === 'speech') {
      this.mailmanT += dtMs;
      this.speech.position.set(this.player.x, this.player.headY - 44);
      if (this.mailmanT > MAILMAN.speechMs) {
        this.speech.hide();
        void this.spawnMailman();
      }
    } else if (this.mailmanState === 'entering' && this.mailman) {
      this.mailmanT += dtMs;
      const step = (MAILMAN.walkSpeed * dtMs) / 1000;
      this.mailman.x = Math.max(MAILMAN.standX, this.mailman.x - step);
      this.mailman.y = MAILMAN.standY - Math.abs(Math.sin(this.mailmanT * 0.02)) * 6;
      if (this.mailman.x <= MAILMAN.standX) {
        this.mailman.y = MAILMAN.standY;
        this.mailmanState = 'present';
      }
    }

    // 近接表示（ドア or MAILMAN）
    const nearD = this.nearDoor();
    const nearM = this.nearMailman();
    this.bubble.visible = nearD || nearM;
    if (nearD || nearM) {
      this.bubble.setBase(this.player.x, this.player.headY - 30);
      this.bubble.update(dtMs);
    }

    const k = this.input.keys;
    const decideKey = k.has('enter') || k.has(' ') || k.has('z');
    const keyEnter = this.age > 500 && decideKey;

    // MAILMANとの会話：タップ予約で到着 or 近接中にキー入力
    if (nearM && (this.pendingMailman && !this.player.isMoving || (keyEnter && !this.keyLatch))) {
      this.keyLatch = true;
      this.talkToMailman();
      return;
    }
    if (!decideKey) this.keyLatch = false;

    // 入店判定：タップ予約で到着 or 近接中にキー入力
    if (nearD && (this.pendingDoor && !this.player.isMoving || keyEnter)) {
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
