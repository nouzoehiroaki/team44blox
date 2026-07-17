import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { DOT_FONT, GAME_W, GAME_H } from '../constants';
import { GameInput } from '../Input';
import { INITIALS, Artist, Cd, artistsByInitial } from '@/data/44shop';
import { openEcUrl } from '../openEc';

/** ビューのデータソース（CDコーナー / RECORDSコーナーで差し替え） */
export type CdViewSource = {
  heading: string; // 例: 'CDコーナー'
  byArtist: (artistId: string) => Cd[];
  emptyText: string; // 商品未登録アーティストの表示
};

const BOX_W = 1120;
const BOX_H = 600;
const OPEN_MS = 140;

// A-Z棚
const GRID_COLS = 9;
const CELL_W = 108;
const CELL_H = 96;
const GRID_X = -((GRID_COLS - 1) * CELL_W) / 2;
const GRID_Y = -140;

// リスト（アーティスト/CD）
const LIST_X = -BOX_W / 2 + 48;
const LIST_Y = -BOX_H / 2 + 110;
const ROW_H = 62;
const VISIBLE = 6;
const PREVIEW_X = BOX_W / 2 - 300;

type Level = 'index' | 'artists' | 'cds';

/**
 * CDコーナー（A-Z棚 → アーティスト → CD一覧 → EC）
 * - 各階層に「◀ もどる」。外側タップ/ESCも1階層戻る（最上位では閉じる）
 * - CD一覧: 選択中を再押下 or ジャケット押下でEC別タブ
 */
export class CdView extends Container {
  onRequestClose?: () => void;

  private level: Level = 'index';
  private initial = 'A';
  private artist?: Artist;
  private artists: Artist[] = [];
  private cds: Cd[] = [];

  private title: Text;
  private letterTexts: Text[] = [];
  private letterCursor: Graphics;
  private rows: Text[] = [];
  private rowCursor: Text;
  private emptyText: Text;
  private preview: Sprite;
  private previewTitle: Text;
  private backBtn: Container;
  private selected = 0;
  private scrollTop = 0;
  private upArrow: Text;
  private downArrow: Text;

  private state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private animT = 0;
  private keyLatch = new Set<string>();
  private textures = new Map<string, Texture>();

  constructor(private input: GameInput, private source: CdViewSource) {
    super();

    const g = new Graphics()
      .rect(-BOX_W / 2, -BOX_H / 2, BOX_W, BOX_H)
      .fill({ color: 0x000000, alpha: 0.94 })
      .stroke({ color: 0xffffff, width: 5 })
      .rect(-BOX_W / 2 + 8, -BOX_H / 2 + 8, BOX_W - 16, BOX_H - 16)
      .stroke({ color: 0xffffff, width: 2 });
    this.addChild(g);

    this.title = new Text({
      text: '',
      style: { fill: 0xf5d442, fontSize: 32, fontFamily: DOT_FONT },
    });
    this.title.anchor.set(0.5, 0);
    this.title.position.set(0, -BOX_H / 2 + 22);
    this.addChild(this.title);

    // A-Z棚
    this.letterCursor = new Graphics()
      .rect(-CELL_W / 2 + 8, -CELL_H / 2 + 10, CELL_W - 16, CELL_H - 20)
      .stroke({ color: 0xf5d442, width: 4 });
    this.addChild(this.letterCursor);
    INITIALS.forEach((ch, i) => {
      const t = new Text({
        text: ch,
        style: { fill: 0xffffff, fontSize: 44, fontFamily: DOT_FONT },
      });
      t.anchor.set(0.5);
      t.position.set(GRID_X + (i % GRID_COLS) * CELL_W, GRID_Y + Math.floor(i / GRID_COLS) * CELL_H);
      this.letterTexts.push(t);
      this.addChild(t);
    });

    // リスト
    this.rowCursor = new Text({
      text: '▶',
      style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
    });
    this.addChild(this.rowCursor);
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

    this.emptyText = new Text({
      text: '',
      style: { fill: 0x9a9a9a, fontSize: 26, fontFamily: DOT_FONT, align: 'center' },
    });
    this.emptyText.anchor.set(0.5);
    this.emptyText.position.set(0, 0);
    this.addChild(this.emptyText);

    // プレビュー（CD一覧のみ）
    this.preview = new Sprite(Texture.WHITE);
    this.preview.anchor.set(0.5);
    this.preview.position.set(PREVIEW_X + 10, LIST_Y + 120);
    this.addChild(this.preview);
    this.previewTitle = new Text({
      text: '',
      style: {
        fill: 0xffffff, fontSize: 24, fontFamily: DOT_FONT,
        wordWrap: true, wordWrapWidth: 300, breakWords: true, align: 'center',
      },
    });
    this.previewTitle.anchor.set(0.5, 0);
    this.previewTitle.position.set(PREVIEW_X + 10, LIST_Y + 270);
    this.addChild(this.previewTitle);

    // もどるボタン
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
    return this.state !== 'closed';
  }

  open() {
    this.state = 'opening';
    this.animT = 0;
    this.visible = true;
    this.alpha = 0;
    this.scale.set(1, 0.2);
    this.showIndex();
  }

  close() {
    if (this.state === 'closed' || this.state === 'closing') return;
    this.state = 'closing';
    this.animT = 0;
  }

  // ---- 階層表示 ----

  private setListVisible(v: boolean) {
    this.rows.forEach((r) => (r.visible = v));
    this.rowCursor.visible = v;
    this.upArrow.visible = false;
    this.downArrow.visible = false;
  }

  private setIndexVisible(v: boolean) {
    this.letterTexts.forEach((t) => (t.visible = v));
    this.letterCursor.visible = v;
  }

  private setPreviewVisible(v: boolean) {
    this.preview.visible = v;
    this.previewTitle.visible = v;
  }

  private showIndex() {
    this.level = 'index';
    this.title.text = `＊${this.source.heading}＊`;
    this.emptyText.text = '';
    this.setIndexVisible(true);
    this.setListVisible(false);
    this.setPreviewVisible(false);
    this.selected = Math.max(0, INITIALS.indexOf(this.initial));
    this.refreshIndex();
  }

  private showArtists(initial: string) {
    this.level = 'artists';
    this.initial = initial;
    this.artists = artistsByInitial(initial);
    this.title.text = `＊${initial} の アーティスト＊`;
    this.emptyText.text = '';
    this.setIndexVisible(false);
    this.setListVisible(true);
    this.setPreviewVisible(false);
    this.selected = 0;
    this.scrollTop = 0;
    this.refreshList(this.artists.map((a) => a.name));
  }

  private showCds(artist: Artist) {
    this.level = 'cds';
    this.artist = artist;
    this.cds = this.source.byArtist(artist.id);
    this.title.text = `＊${artist.name}＊`;
    this.setIndexVisible(false);
    if (this.cds.length === 0) {
      this.emptyText.text = this.source.emptyText;
      this.setListVisible(false);
      this.setPreviewVisible(false);
      return;
    }
    this.emptyText.text = '';
    this.setListVisible(true);
    this.setPreviewVisible(true);
    this.selected = 0;
    this.scrollTop = 0;
    this.refreshList(this.cds.map((c) => c.title));
  }

  private back() {
    if (this.level === 'cds') this.showArtists(this.initial);
    else if (this.level === 'artists') this.showIndex();
    else this.close();
  }

  // ---- 描画更新 ----

  private refreshIndex() {
    INITIALS.forEach((ch, i) => {
      const active = artistsByInitial(ch).length > 0;
      this.letterTexts[i].alpha = active ? (i === this.selected ? 1 : 0.85) : 0.22;
    });
    const t = this.letterTexts[this.selected];
    this.letterCursor.position.set(t.x, t.y);
  }

  private currentListLength() {
    return this.level === 'artists' ? this.artists.length : this.cds.length;
  }

  private refreshList(labels: string[]) {
    if (this.selected < this.scrollTop) this.scrollTop = this.selected;
    if (this.selected >= this.scrollTop + VISIBLE) this.scrollTop = this.selected - VISIBLE + 1;
    for (let i = 0; i < VISIBLE; i++) {
      const label = labels[this.scrollTop + i];
      this.rows[i].text = label ?? '';
      this.rows[i].alpha = this.scrollTop + i === this.selected ? 1 : 0.75;
    }
    const visRow = this.selected - this.scrollTop;
    this.rowCursor.position.set(LIST_X, LIST_Y + visRow * ROW_H);
    this.upArrow.visible = this.scrollTop > 0;
    this.downArrow.visible = this.scrollTop + VISIBLE < labels.length;

    if (this.level === 'cds') {
      const cd = this.cds[this.selected];
      if (cd) {
        this.previewTitle.text = cd.title + (cd.releaseYear ? `（${cd.releaseYear}）` : '');
        void this.loadJacket(cd);
      }
    }
  }

  private refreshCurrentList() {
    this.refreshList(
      this.level === 'artists' ? this.artists.map((a) => a.name) : this.cds.map((c) => c.title),
    );
  }

  private async loadJacket(cd: Cd) {
    let tex = this.textures.get(cd.jacket);
    if (!tex) {
      try {
        tex = (await Assets.load(cd.jacket)) as Texture;
      } catch {
        tex = Texture.WHITE;
      }
      this.textures.set(cd.jacket, tex);
    }
    if (this.level !== 'cds' || this.cds[this.selected]?.jacket !== cd.jacket) return;
    this.preview.texture = tex;
    const size = 230;
    this.preview.scale.set(Math.min(size / tex.width, size / tex.height));
  }

  // ---- 入力 ----

  /** タップ処理。消費したら true */
  handleTap(px: number, py: number): boolean {
    if (!this.isOpen) return false;
    if (this.state === 'closing') return true;
    const lx = px - this.x;
    const ly = py - this.y;

    // 外側タップ＝1階層もどる
    if (Math.abs(lx) > BOX_W / 2 || Math.abs(ly) > BOX_H / 2) {
      this.back();
      return true;
    }
    // もどるボタン
    if (Math.abs(lx - this.backBtn.x) <= 140 && Math.abs(ly - this.backBtn.y) <= 42) {
      this.back();
      return true;
    }

    if (this.level === 'index') {
      const cell = this.letterAt(lx, ly);
      if (cell !== null && artistsByInitial(INITIALS[cell]).length > 0) {
        this.selected = cell;
        this.refreshIndex();
        this.showArtists(INITIALS[cell]);
      }
      return true;
    }

    // リスト階層共通
    if (this.hitText(this.upArrow, lx, ly)) {
      this.moveCursor(-1);
      return true;
    }
    if (this.hitText(this.downArrow, lx, ly)) {
      this.moveCursor(1);
      return true;
    }
    if (this.level === 'cds' && this.preview.visible) {
      if (Math.abs(lx - this.preview.x) <= 130 && Math.abs(ly - this.preview.y) <= 130) {
        this.decide();
        return true;
      }
    }
    const row = this.rowAt(lx, ly);
    if (row !== null) {
      const idx = this.scrollTop + row;
      if (this.level === 'artists') {
        // アーティストは1タップで展開
        this.selected = idx;
        this.showCds(this.artists[idx]);
      } else if (idx === this.selected) {
        this.decide(); // 選択中CDを再押下→EC
      } else {
        this.selected = idx;
        this.refreshCurrentList();
      }
    }
    return true;
  }

  private decide() {
    if (this.level === 'index') {
      if (artistsByInitial(INITIALS[this.selected]).length > 0)
        this.showArtists(INITIALS[this.selected]);
    } else if (this.level === 'artists') {
      const a = this.artists[this.selected];
      if (a) this.showCds(a);
    } else {
      const cd = this.cds[this.selected];
      if (cd) openEcUrl(cd.ecUrl);
    }
  }

  private letterAt(lx: number, ly: number): number | null {
    for (let i = 0; i < INITIALS.length; i++) {
      const t = this.letterTexts[i];
      if (Math.abs(lx - t.x) <= CELL_W / 2 - 6 && Math.abs(ly - t.y) <= CELL_H / 2 - 6) return i;
    }
    return null;
  }

  private rowAt(lx: number, ly: number): number | null {
    if (lx < LIST_X || lx > LIST_X + 480) return null;
    const r = Math.floor((ly - LIST_Y + 8) / ROW_H);
    const max = Math.min(VISIBLE, this.currentListLength() - this.scrollTop);
    if (r < 0 || r >= max) return null;
    return r;
  }

  private hitText(t: Text, lx: number, ly: number) {
    return (
      t.visible &&
      lx >= t.x - 20 && lx <= t.x + t.width + 20 &&
      ly >= t.y - 14 && ly <= t.y + t.height + 14
    );
  }

  private moveCursor(d: number) {
    if (this.level === 'index') {
      let next = this.selected + d;
      next = Math.min(INITIALS.length - 1, Math.max(0, next));
      this.selected = next;
      this.refreshIndex();
    } else {
      const len = this.currentListLength();
      if (len === 0) return;
      this.selected = Math.min(len - 1, Math.max(0, this.selected + d));
      this.refreshCurrentList();
    }
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

    // ホバー追従（PC）
    const ptr = this.input.pointer;
    if (!ptr.down) {
      const lx = ptr.x - this.x;
      const ly = ptr.y - this.y;
      if (this.level === 'index') {
        const cell = this.letterAt(lx, ly);
        if (cell !== null && cell !== this.selected) {
          this.selected = cell;
          this.refreshIndex();
        }
      } else {
        const row = this.rowAt(lx, ly);
        if (row !== null && this.scrollTop + row !== this.selected) {
          this.selected = this.scrollTop + row;
          this.refreshCurrentList();
        }
      }
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
    if (this.level === 'index') {
      if (press('arrowleft') || press('a')) this.moveCursor(-1);
      if (press('arrowright') || press('d')) this.moveCursor(1);
      if (press('arrowup') || press('w')) this.moveCursor(-GRID_COLS);
      if (press('arrowdown') || press('s')) this.moveCursor(GRID_COLS);
    } else {
      if (press('arrowup') || press('w')) this.moveCursor(-1);
      if (press('arrowdown') || press('s')) this.moveCursor(1);
    }
    if (press('enter') || press('z') || press(' ')) this.decide();
    if (press('escape')) this.back();
  }
}
