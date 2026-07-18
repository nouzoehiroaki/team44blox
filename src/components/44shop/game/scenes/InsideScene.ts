import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { GAME_W, GAME_H, ASSETS, DOT_FONT, SceneName, SceneData, OUTSIDE_DOOR_SPAWN } from '../constants';
import { Scene } from '../SceneManager';
import { GameInput } from '../Input';
import { Player } from '../Player';
import { IndicatorBubble } from '../ui/IndicatorBubble';
import { DqWindow } from '../ui/DqWindow';
import { ChoiceWindow } from '../ui/ChoiceWindow';
import { GoodsView } from '../ui/GoodsView';
import { CdView } from '../ui/CdView';
import { cdsByArtist, recordsByArtist } from '@/data/44shop';
import { REGI_DIALOGS } from '../dialogs';
import { flyerBridge, contactBridge } from '../flyerBridge';

type SpotId = 'regi' | 'goods' | 'cd' | 'vinyl' | 'post' | 'exit';

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
  { id: 'vinyl', standX: 780, standY: 650, rect: { x0: 820, y0: 485, x1: 1205, y1: 760 }, nearDist: 150 },
  { id: 'post', standX: 410, standY: 480, rect: { x0: 368, y0: 330, x1: 452, y1: 445 }, nearDist: 120 },
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
  private goodsView: GoodsView;
  private goodsChoice: ChoiceWindow;
  private cdView: CdView;
  private cdChoice: ChoiceWindow;
  private recordsView: CdView;
  private recordsChoice: ChoiceWindow;
  private flyerChoice: ChoiceWindow;
  private postChoice: ChoiceWindow;
  private offTap?: () => void;
  private pending: SpotId | null = null;
  private leaving = false;
  private regiCount = 0;
  private age = 0;
  private keyLatch = false;

  constructor(private input: GameInput, private go: (name: SceneName, data?: SceneData) => void) {
    this.goodsView = new GoodsView(input);
    this.goodsChoice = new ChoiceWindow(input);
    this.cdView = new CdView(input, {
      heading: 'CDコーナー',
      byArtist: cdsByArtist,
      emptyText: 'ただいま じゅんびちゅう……\nしばし おまちを！',
    });
    this.cdChoice = new ChoiceWindow(input);
    this.recordsView = new CdView(input, {
      heading: 'RECORDSコーナー',
      byArtist: recordsByArtist,
      emptyText: 'ただいま じゅんびちゅう……\nしばし おまちを！',
    });
    this.recordsChoice = new ChoiceWindow(input);
    this.flyerChoice = new ChoiceWindow(input);
    this.postChoice = new ChoiceWindow(input);
  }

  private openPostChoice() {
    this.postChoice.open('メッセージポストだ。\nアーティストに てがみを おくれるらしい。', [
      'てがみを かく',
      'やめておく',
    ]);
  }

  private openGoodsChoice() {
    this.goodsChoice.open('GOODSコーナーだ。', ['GOODSを みる', 'ほかを みる']);
  }

  private openCdChoice() {
    this.cdChoice.open('CDコーナーだ。', ['CDを みる', 'ほかを みる']);
  }

  private openRecordsChoice() {
    this.recordsChoice.open('RECORDSコーナーだ。', ['レコードを みる', 'ほかを みる']);
  }

  async enter() {
    const tex: Texture = await Assets.load(ASSETS.insideBg);
    const bg = new Sprite(tex);
    bg.width = GAME_W;
    bg.height = GAME_H;
    this.view.addChild(bg);

    this.player.setBounds(BOUNDS);
    // レコード棚（RECORDS）の上は歩行不可
    this.player.setObstacles([{ x0: 800, y0: 468, x1: 1215, y1: 775 }]);

    // メッセージポスト（DQ風の赤いポスト。壁際に設置）
    const post = new Graphics()
      .rect(-30, -104, 60, 56)
      .fill(0xd42a1e)
      .stroke({ color: 0x1a1512, width: 4 })
      .rect(-20, -92, 40, 8)
      .fill(0x1a1512)
      .rect(-8, -48, 16, 34)
      .fill(0x3a3430)
      .stroke({ color: 0x1a1512, width: 3 })
      .rect(-18, -14, 36, 8)
      .fill(0x2a2522);
    post.position.set(410, 432);
    this.view.addChild(post);
    const postLabel = new Text({
      text: '〒',
      style: { fill: 0xffffff, fontSize: 26, fontFamily: DOT_FONT, fontWeight: '900' },
    });
    postLabel.anchor.set(0.5);
    postLabel.position.set(410, 432 - 76);
    this.view.addChild(postLabel);

    await this.player.load();
    this.player.place(624, 700); // 入口（EXITマット手前）
    this.view.addChild(this.player.view);
    this.view.addChild(this.bubble);

    this.window.position.set(GAME_W / 2, GAME_H - 170);
    this.view.addChild(this.window);
    this.goodsChoice.position.set(GAME_W / 2, GAME_H - 150);
    this.view.addChild(this.goodsChoice);
    this.view.addChild(this.goodsView);
    this.cdChoice.position.set(GAME_W / 2, GAME_H - 150);
    this.view.addChild(this.cdChoice);
    this.view.addChild(this.cdView);

    // 選択肢: 「GOODSを みる」→一覧 / 「ほかを みる」→閉じて歩行再開
    this.goodsChoice.onChoose = (i) => {
      if (i === 0) this.goodsView.open();
    };
    // 一覧を閉じたら選択肢に戻る
    this.goodsView.onRequestClose = () => this.openGoodsChoice();

    // CDコーナーも同じフロー
    this.cdChoice.onChoose = (i) => {
      if (i === 0) this.cdView.open();
    };
    this.cdView.onRequestClose = () => this.openCdChoice();

    // RECORDSコーナーも同じフロー
    this.recordsChoice.position.set(GAME_W / 2, GAME_H - 150);
    this.view.addChild(this.recordsChoice);
    this.view.addChild(this.recordsView);
    this.recordsChoice.onChoose = (i) => {
      if (i === 0) this.recordsView.open();
    };
    this.recordsView.onRequestClose = () => this.openRecordsChoice();

    // レジ会話後のフライヤー選択肢（今月以降のイベントがある時のみ表示される）
    this.flyerChoice.position.set(GAME_W / 2, GAME_H - 150);
    this.view.addChild(this.flyerChoice);
    this.flyerChoice.onChoose = (i) => {
      if (i === 0) flyerBridge.open();
    };

    // ポスト（メッセージフォーム）
    this.postChoice.position.set(GAME_W / 2, GAME_H - 150);
    this.view.addChild(this.postChoice);
    this.postChoice.onChoose = (i) => {
      if (i === 0) contactBridge.open();
    };

    this.offTap = this.input.onTap((p) => {
      if (this.leaving || flyerBridge.isOpen || contactBridge.isOpen) return;
      if (this.flyerChoice.isOpen) {
        this.flyerChoice.handleTap(p.x, p.y);
        return;
      }
      if (this.postChoice.isOpen) {
        this.postChoice.handleTap(p.x, p.y);
        return;
      }
      if (this.goodsView.isOpen) {
        this.goodsView.handleTap(p.x, p.y);
        return;
      }
      if (this.goodsChoice.isOpen) {
        this.goodsChoice.handleTap(p.x, p.y);
        return;
      }
      if (this.cdView.isOpen) {
        this.cdView.handleTap(p.x, p.y);
        return;
      }
      if (this.cdChoice.isOpen) {
        this.cdChoice.handleTap(p.x, p.y);
        return;
      }
      if (this.recordsView.isOpen) {
        this.recordsView.handleTap(p.x, p.y);
        return;
      }
      if (this.recordsChoice.isOpen) {
        this.recordsChoice.handleTap(p.x, p.y);
        return;
      }
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
        const idx = this.regiCount % REGI_DIALOGS.length;
        const lines = REGI_DIALOGS[idx];
        this.regiCount++;
        // 初回セリフ（「…各ショップで購入できるよ！」を含む）の後にフライヤー選択肢。
        // 今月以降のイベントが0件ならスキップして通常どおり閉じる。
        if (idx === 0 && flyerBridge.hasEvents) {
          this.window.open(lines.slice(0, -1));
          this.window.onClosed = () => {
            this.window.onClosed = undefined;
            this.flyerChoice.open(lines[lines.length - 1], ['フライヤーを みる', 'ほかを みる']);
          };
        } else {
          this.window.open(lines);
        }
        break;
      }
      case 'goods':
        this.openGoodsChoice();
        break;
      case 'cd':
        this.openCdChoice();
        break;
      case 'vinyl':
        this.openRecordsChoice();
        break;
      case 'post':
        this.openPostChoice();
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

    // DOMオーバーレイ（フライヤー／メッセージフォーム）表示中はゲーム側の入力を止める
    if (flyerBridge.isOpen || contactBridge.isOpen) {
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // フライヤー／ポスト選択肢ウィンドウ表示中
    if (this.flyerChoice.isOpen || this.postChoice.isOpen) {
      this.flyerChoice.update(dtMs);
      this.postChoice.update(dtMs);
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // グッズビュー表示中（入力はビュー側で処理）
    if (this.goodsView.isOpen) {
      this.goodsView.update(dtMs);
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // GOODS選択肢ウィンドウ表示中
    if (this.goodsChoice.isOpen) {
      this.goodsChoice.update(dtMs);
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // CDビュー／CD選択肢ウィンドウ表示中
    if (this.cdView.isOpen || this.cdChoice.isOpen) {
      this.cdView.update(dtMs);
      this.cdChoice.update(dtMs);
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

    // RECORDSビュー／選択肢ウィンドウ表示中
    if (this.recordsView.isOpen || this.recordsChoice.isOpen) {
      this.recordsView.update(dtMs);
      this.recordsChoice.update(dtMs);
      this.player.update(dtMs);
      this.bubble.visible = false;
      return;
    }

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
