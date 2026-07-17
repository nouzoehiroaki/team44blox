import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { DOT_FONT, GAME_W, GAME_H } from '../constants';
import { GameInput } from '../Input';
import { GOODS, Goods } from '@/data/44shop';
import { openEcUrl } from '../openEc';

const BOX_W = 1120;
const BOX_H = 600;
const LIST_X = -BOX_W / 2 + 48;
const LIST_Y = -BOX_H / 2 + 96;
const ROW_H = 62;
const VISIBLE = 6;
const PREVIEW_X = BOX_W / 2 - 300;
const OPEN_MS = 140;

const yen = (n?: number) => (n === undefined ? '' : `${n.toLocaleString('ja-JP')}円`);
const SOLDOUT_IMG = '/44shop/goods/soldout.png';

/**
 * グッズコーナー（DQ道具屋風）
 * - 左：商品リスト（▶カーソル、ホバー/タップで選択）
 * - 右：サムネイル・価格プレビュー
 * - 選択中の商品を再度押下 or「ECサイトでみる」でEC別タブ
 */
export class GoodsView extends Container {
  onRequestClose?: () => void;

  private rows: Text[] = [];
  private cursorMark: Text;
  private selected = 0;
  private scrollTop = 0;
  private preview: Sprite;
  private rowSoldouts: Sprite[] = [];
  private previewPrice: Text;
  // 指スクロール・タップ判定（リスト領域）
  private pendingTapRow: number | null = null;
  private dragStartY = 0;
  private dragLastY = 0;
  private dragAccum = 0;
  private dragging = false;
  private prevDown = false;
  private backBtn: Container;
  private state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private animT = 0;
  private keyLatch = new Set<string>();
  private textures = new Map<string, Texture>();
  private upArrow: Text;
  private downArrow: Text;

  constructor(private input: GameInput) {
    super();

    const g = new Graphics()
      .rect(-BOX_W / 2, -BOX_H / 2, BOX_W, BOX_H)
      .fill({ color: 0x000000, alpha: 0.94 })
      .stroke({ color: 0xffffff, width: 5 })
      .rect(-BOX_W / 2 + 8, -BOX_H / 2 + 8, BOX_W - 16, BOX_H - 16)
      .stroke({ color: 0xffffff, width: 2 })
      // プレビュー枠
      .rect(PREVIEW_X - 130, LIST_Y - 10, 280, 280)
      .stroke({ color: 0xffffff, width: 2 });
    this.addChild(g);

    const title = new Text({
      text: '＊グッズコーナー＊',
      style: { fill: 0xf5d442, fontSize: 32, fontFamily: DOT_FONT },
    });
    title.anchor.set(0.5, 0);
    title.position.set(0, -BOX_H / 2 + 22);
    this.addChild(title);

    this.cursorMark = new Text({
      text: '▶',
      style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
    });
    this.addChild(this.cursorMark);

    for (let i = 0; i < VISIBLE; i++) {
      const row = new Text({
        text: '',
        style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
      });
      row.position.set(LIST_X + 40, LIST_Y + i * ROW_H);
      this.rows.push(row);
      this.addChild(row);
    }

    this.upArrow = new Text({ text: '▲', style: { fill: 0xffffff, fontSize: 22, fontFamily: DOT_FONT } });
    this.upArrow.position.set(LIST_X + 200, LIST_Y - 34);
    this.downArrow = new Text({ text: '▼', style: { fill: 0xffffff, fontSize: 22, fontFamily: DOT_FONT } });
    this.downArrow.position.set(LIST_X + 200, LIST_Y + VISIBLE * ROW_H + 4);
    this.addChild(this.upArrow, this.downArrow);

    this.preview = new Sprite(Texture.WHITE);
    this.preview.anchor.set(0.5);
    this.preview.position.set(PREVIEW_X + 10, LIST_Y + 130);
    this.addChild(this.preview);

    // SOLD OUT スタンプ（リストの商品名に重ねる。行の高さに収まるサイズ）
    for (let i = 0; i < VISIBLE; i++) {
      const sp = new Sprite(Texture.EMPTY);
      sp.anchor.set(0.5);
      sp.rotation = -0.2;
      sp.visible = false;
      this.rowSoldouts.push(sp);
      this.addChild(sp);
    }
    void Assets.load(SOLDOUT_IMG)
      .then((tex: Texture) => {
        this.rowSoldouts.forEach((sp) => {
          sp.texture = tex;
          sp.scale.set(70 / tex.height); // 高さ70px（行の高さ62pxを少し上回る）
        });
      })
      .catch(() => {});

    this.previewPrice = new Text({
      text: '',
      style: { fill: 0xf5d442, fontSize: 28, fontFamily: DOT_FONT },
    });
    this.previewPrice.anchor.set(0.5, 0);
    this.previewPrice.position.set(PREVIEW_X + 10, LIST_Y + 300);
    this.addChild(this.previewPrice);

    // もどるボタン（下中央・大きめタップ領域）
    this.backBtn = new Container();
    const backBg = new Graphics()
      .rect(-120, -30, 240, 60)
      .fill(0x333333)
      .stroke({ color: 0xffffff, width: 3 });
    const backLabel = new Text({
      text: '◀ もどる',
      style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
    });
    backLabel.anchor.set(0.5);
    this.backBtn.addChild(backBg, backLabel);
    this.backBtn.position.set(0, BOX_H / 2 - 46);
    this.addChild(this.backBtn);

    this.position.set(GAME_W / 2, GAME_H / 2 - 20);
    this.visible = false;
    this.eventMode = 'none';
  }

  get isOpen() {
    // closing中もtrue（シーン側からupdateが呼ばれ続け、閉じアニメが完了できる）
    return this.state !== 'closed';
  }

  open() {
    this.state = 'opening';
    this.animT = 0;
    this.visible = true;
    this.alpha = 0;
    this.scale.set(1, 0.2);
    this.selected = 0;
    this.scrollTop = 0;
    this.refresh();
  }

  close() {
    if (this.state === 'closed' || this.state === 'closing') return;
    this.state = 'closing';
    this.animT = 0;
  }

  /** タップ処理。ビューが消費したら true */
  handleTap(px: number, py: number): boolean {
    if (!this.isOpen) return false;
    if (this.state === 'closing') return true; // 閉じ中は無視
    const lx = px - this.x;
    const ly = py - this.y;
    // 外側 → 閉じる
    if (Math.abs(lx) > BOX_W / 2 || Math.abs(ly) > BOX_H / 2) {
      this.close();
      return true;
    }
    // もどるボタン（タップ領域を広めに）
    if (Math.abs(lx - this.backBtn.x) <= 140 && Math.abs(ly - this.backBtn.y) <= 42) {
      this.close();
      return true;
    }
    // プレビュー画像 → EC遷移
    if (Math.abs(lx - this.preview.x) <= 135 && Math.abs(ly - this.preview.y) <= 135) {
      this.openEc(GOODS[this.selected]);
      return true;
    }
    // スクロール矢印
    if (this.hitText(this.upArrow, lx, ly)) {
      this.moveCursor(-1);
      return true;
    }
    if (this.hitText(this.downArrow, lx, ly)) {
      this.moveCursor(1);
      return true;
    }
    // リスト行: 押下時点では確定せず、指を離した時に確定（スワイプスクロールと両立）
    const row = this.rowAt(lx, ly);
    if (row !== null) {
      this.pendingTapRow = row;
      this.dragStartY = py;
      this.dragLastY = py;
      this.dragAccum = 0;
      this.dragging = false;
    }
    return true;
  }

  private hitText(t: Text, lx: number, ly: number) {
    return (
      t.visible &&
      lx >= t.x - 20 && lx <= t.x + t.width + 20 &&
      ly >= t.y - 14 && ly <= t.y + t.height + 14
    );
  }

  private rowAt(lx: number, ly: number): number | null {
    if (lx < LIST_X || lx > LIST_X + 480) return null;
    const r = Math.floor((ly - LIST_Y + 8) / ROW_H);
    if (r < 0 || r >= Math.min(VISIBLE, GOODS.length - this.scrollTop)) return null;
    return r;
  }

  private moveCursor(d: number) {
    this.selected = Math.min(GOODS.length - 1, Math.max(0, this.selected + d));
    // 選択が見える位置までスクロール
    if (this.selected < this.scrollTop) this.scrollTop = this.selected;
    if (this.selected >= this.scrollTop + VISIBLE) this.scrollTop = this.selected - VISIBLE + 1;
    this.refresh();
  }

  private maxScrollTop() {
    return Math.max(0, GOODS.length - VISIBLE);
  }

  private openEc(item?: Goods) {
    if (!item) return;
    openEcUrl(item.ecUrl);
  }

  private refresh() {
    for (let i = 0; i < VISIBLE; i++) {
      const item = GOODS[this.scrollTop + i];
      if (!item) {
        this.rows[i].text = '';
        this.rowSoldouts[i].visible = false;
        continue;
      }
      this.rows[i].text = item.name;
      this.rows[i].alpha = this.scrollTop + i === this.selected ? 1 : 0.75;
      // 売り切れ: 商品名の上にスタンプを重ねる
      const so = this.rowSoldouts[i];
      so.visible = !!item.soldOut;
      if (so.visible) {
        const r = this.rows[i];
        so.position.set(r.x + Math.min(r.width, 440) / 2, r.y + ROW_H / 2 - 8);
      }
    }
    // 選択行が画面外にスクロールされている場合はカーソルを隠す
    const visRow = this.selected - this.scrollTop;
    this.cursorMark.visible = visRow >= 0 && visRow < VISIBLE;
    if (this.cursorMark.visible) this.cursorMark.position.set(LIST_X, LIST_Y + visRow * ROW_H);
    this.upArrow.visible = this.scrollTop > 0;
    this.downArrow.visible = this.scrollTop + VISIBLE < GOODS.length;

    const item = GOODS[this.selected];
    this.previewPrice.text = item.price !== undefined ? yen(item.price) : '';
    void this.loadPreview(item);
  }

  private async loadPreview(item: Goods) {
    let tex = this.textures.get(item.image);
    if (!tex) {
      try {
        tex = (await Assets.load(item.image)) as Texture;
      } catch {
        tex = Texture.WHITE;
      }
      this.textures.set(item.image, tex);
    }
    // 選択が変わっていたら反映しない
    if (GOODS[this.selected].image !== item.image) return;
    this.preview.texture = tex;
    const size = 240;
    const s = Math.min(size / tex.width, size / tex.height);
    this.preview.scale.set(s);
  }

  update(dtMs: number) {
    if (this.state === 'opening') {
      this.animT += dtMs;
      const t = Math.min(1, this.animT / OPEN_MS);
      this.alpha = t;
      this.scale.set(1, 0.2 + 0.8 * t);
      if (t >= 1) this.state = 'open';
    } else if (this.state === 'closing') {
      this.animT += dtMs;
      const t = Math.min(1, this.animT / OPEN_MS);
      this.alpha = 1 - t;
      this.scale.set(1, 1 - 0.8 * t);
      if (t >= 1) {
        this.state = 'closed';
        this.visible = false;
        this.onRequestClose?.();
      }
      return;
    }
    if (this.state !== 'open') return;

    const ptr = this.input.pointer;

    // 指スクロール（リスト行を押下したままの上下ドラッグ）
    if (ptr.down && this.pendingTapRow !== null) {
      if (!this.dragging && Math.abs(ptr.y - this.dragStartY) > 14) this.dragging = true;
      if (this.dragging) {
        this.dragAccum += this.dragLastY - ptr.y; // 上へスワイプ→リストは下へ進む
        this.dragLastY = ptr.y;
        let changed = false;
        while (this.dragAccum >= ROW_H && this.scrollTop < this.maxScrollTop()) {
          this.scrollTop++;
          this.dragAccum -= ROW_H;
          changed = true;
        }
        while (this.dragAccum <= -ROW_H && this.scrollTop > 0) {
          this.scrollTop--;
          this.dragAccum += ROW_H;
          changed = true;
        }
        if (changed) this.refresh();
      } else {
        this.dragLastY = ptr.y;
      }
    }

    // 指を離した時にタップ確定（ドラッグしていなければ選択/EC遷移）
    if (this.prevDown && !ptr.down) {
      if (this.pendingTapRow !== null && !this.dragging) {
        const idx = this.scrollTop + this.pendingTapRow;
        const item = GOODS[idx];
        if (item) {
          if (idx === this.selected) this.openEc(item); // 選択中を再押下→EC
          else {
            this.selected = idx;
            this.refresh();
          }
        }
      }
      this.pendingTapRow = null;
      this.dragging = false;
      this.dragAccum = 0;
    }
    this.prevDown = ptr.down;

    // ホバーで▶移動（PC）
    const row = this.rowAt(ptr.x - this.x, ptr.y - this.y);
    if (row !== null && this.scrollTop + row !== this.selected && !ptr.down) {
      this.selected = this.scrollTop + row;
      this.refresh();
    }

    // キーボード
    const k = this.input.keys;
    const press = (key: string) => {
      if (k.has(key) && !this.keyLatch.has(key)) {
        this.keyLatch.add(key);
        return true;
      }
      if (!k.has(key)) this.keyLatch.delete(key);
      return false;
    };
    if (press('arrowup') || press('w')) this.moveCursor(-1);
    if (press('arrowdown') || press('s')) this.moveCursor(1);
    if (press('enter') || press('z') || press(' ')) this.openEc(GOODS[this.selected]);
    if (press('escape')) this.close();
  }
}
