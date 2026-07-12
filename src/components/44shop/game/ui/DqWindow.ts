import { Container, Graphics, Text } from 'pixi.js';
import { DOT_FONT } from '../constants';

const TYPE_INTERVAL = 34; // ms/文字
const OPEN_MS = 140;

export type DqWindowOptions = {
  width: number;
  height: number;
  fontSize?: number;
};

/**
 * ドラクエ風ウィンドウ
 * - 黒地・白枠・角なし、ドットフォント
 * - タイプライター表示、ページ送り（▼カーソル点滅）
 * - advance(): 表示中→全文表示 / 全文表示→次ページ or クローズ
 * - 開閉アニメーション付き
 */
export class DqWindow extends Container {
  readonly boxW: number;
  readonly boxH: number;
  onClosed?: () => void;

  private txt: Text;
  private cursorMark: Text;
  private pages: string[] = [];
  private pageIdx = 0;
  private shown = 0;
  private typeTimer = 0;
  private cursorTimer = 0;
  private state: 'closed' | 'opening' | 'typing' | 'waiting' | 'closing' = 'closed';
  private animT = 0;

  constructor(opts: DqWindowOptions) {
    super();
    this.boxW = opts.width;
    this.boxH = opts.height;

    const g = new Graphics()
      // 外枠（白）→内側黒。DQ風の二重枠
      .rect(-this.boxW / 2, -this.boxH / 2, this.boxW, this.boxH)
      .fill({ color: 0x000000, alpha: 0.92 })
      .stroke({ color: 0xffffff, width: 5 })
      .rect(-this.boxW / 2 + 8, -this.boxH / 2 + 8, this.boxW - 16, this.boxH - 16)
      .stroke({ color: 0xffffff, width: 2 });
    this.addChild(g);

    this.txt = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: opts.fontSize ?? 30,
        fontFamily: DOT_FONT,
        lineHeight: (opts.fontSize ?? 30) * 1.55,
        wordWrap: true,
        wordWrapWidth: this.boxW - 72,
        breakWords: true,
      },
    });
    this.txt.position.set(-this.boxW / 2 + 36, -this.boxH / 2 + 28);
    this.addChild(this.txt);

    this.cursorMark = new Text({
      text: '▼',
      style: { fill: 0xffffff, fontSize: 24, fontFamily: DOT_FONT },
    });
    this.cursorMark.anchor.set(0.5);
    this.cursorMark.position.set(0, this.boxH / 2 - 26);
    this.cursorMark.visible = false;
    this.addChild(this.cursorMark);

    this.visible = false;
    this.eventMode = 'none';
  }

  get isOpen() {
    return this.state !== 'closed';
  }

  /** ページ配列を渡して開く */
  open(pages: string[]) {
    this.pages = pages.length ? pages : [''];
    this.pageIdx = 0;
    this.shown = 0;
    this.typeTimer = 0;
    this.txt.text = '';
    this.cursorMark.visible = false;
    this.state = 'opening';
    this.animT = 0;
    this.visible = true;
    this.scale.set(1, 0.1);
    this.alpha = 0;
  }

  /** タップ/決定キーでの進行 */
  advance() {
    if (this.state === 'typing') {
      // 全文表示に切り替え
      this.shown = this.pages[this.pageIdx].length;
      this.txt.text = this.pages[this.pageIdx];
      this.state = 'waiting';
    } else if (this.state === 'waiting') {
      if (this.pageIdx < this.pages.length - 1) {
        this.pageIdx++;
        this.shown = 0;
        this.txt.text = '';
        this.cursorMark.visible = false;
        this.state = 'typing';
      } else {
        this.close();
      }
    }
  }

  close() {
    if (this.state === 'closed' || this.state === 'closing') return;
    this.state = 'closing';
    this.animT = 0;
    this.cursorMark.visible = false;
  }

  update(dtMs: number) {
    switch (this.state) {
      case 'opening': {
        this.animT += dtMs;
        const t = Math.min(1, this.animT / OPEN_MS);
        this.scale.set(1, 0.1 + 0.9 * t);
        this.alpha = t;
        if (t >= 1) this.state = 'typing';
        break;
      }
      case 'typing': {
        this.typeTimer += dtMs;
        const page = this.pages[this.pageIdx];
        while (this.typeTimer >= TYPE_INTERVAL && this.shown < page.length) {
          this.typeTimer -= TYPE_INTERVAL;
          this.shown++;
        }
        this.txt.text = page.slice(0, this.shown);
        if (this.shown >= page.length) this.state = 'waiting';
        break;
      }
      case 'waiting': {
        this.cursorTimer += dtMs;
        this.cursorMark.visible = Math.floor(this.cursorTimer / 400) % 2 === 0;
        break;
      }
      case 'closing': {
        this.animT += dtMs;
        const t = Math.min(1, this.animT / OPEN_MS);
        this.scale.set(1, 1 - 0.9 * t);
        this.alpha = 1 - t;
        if (t >= 1) {
          this.state = 'closed';
          this.visible = false;
          this.onClosed?.();
        }
        break;
      }
    }
  }

  /** ウィンドウ矩形内か（外側タップ判定用・ローカル座標系は親基準） */
  containsPoint(px: number, py: number) {
    return (
      Math.abs(px - this.x) <= (this.boxW / 2) * this.scale.x &&
      Math.abs(py - this.y) <= (this.boxH / 2) * this.scale.y
    );
  }
}
