import { Container, Graphics, Text } from 'pixi.js';
import { DOT_FONT } from '../constants';
import { GameInput } from '../Input';

const MSG_W = 1080;
const MSG_H = 200;
const CHOICE_W = 400;
const ROW_H = 58;
const TYPE_INTERVAL = 34;
const OPEN_MS = 140;

/**
 * メッセージ＋選択肢のドラクエ風ウィンドウ
 * 例：「GOODSコーナーだ。」→「GOODSを みる」「ほかを みる」
 * - メッセージはタイプライター表示、完了後に選択肢ボックスを表示
 * - ホバー/タップ、↑↓＋Enter、ESC（＝最後の選択肢でキャンセル扱い）
 */
export class ChoiceWindow extends Container {
  /** 選択確定（クローズ完了後に呼ばれる） */
  onChoose?: (index: number) => void;

  private msgText: Text;
  private choiceBox: Container;
  private choiceBg: Graphics;
  private rows: Text[] = [];
  private cursorMark: Text;
  private choices: string[] = [];
  private message = '';
  private shown = 0;
  private typeTimer = 0;
  private selected = 0;
  private chosen: number | null = null;
  private state: 'closed' | 'opening' | 'typing' | 'choosing' | 'closing' = 'closed';
  private animT = 0;
  private keyLatch = new Set<string>();

  constructor(private input: GameInput) {
    super();

    const g = new Graphics()
      .rect(-MSG_W / 2, -MSG_H / 2, MSG_W, MSG_H)
      .fill({ color: 0x000000, alpha: 0.92 })
      .stroke({ color: 0xffffff, width: 5 })
      .rect(-MSG_W / 2 + 8, -MSG_H / 2 + 8, MSG_W - 16, MSG_H - 16)
      .stroke({ color: 0xffffff, width: 2 });
    this.addChild(g);

    this.msgText = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: 30,
        fontFamily: DOT_FONT,
        lineHeight: 46,
        wordWrap: true,
        wordWrapWidth: MSG_W - 72,
        breakWords: true,
      },
    });
    this.msgText.position.set(-MSG_W / 2 + 36, -MSG_H / 2 + 28);
    this.addChild(this.msgText);

    // 選択肢ボックス（メッセージ右上に重ねる）
    this.choiceBox = new Container();
    this.choiceBg = new Graphics();
    this.choiceBox.addChild(this.choiceBg);
    this.cursorMark = new Text({
      text: '▶',
      style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
    });
    this.choiceBox.addChild(this.cursorMark);
    this.choiceBox.visible = false;
    this.addChild(this.choiceBox);

    this.visible = false;
    this.eventMode = 'none';
  }

  get isOpen() {
    return this.state !== 'closed';
  }

  open(message: string, choices: string[]) {
    this.message = message;
    this.choices = choices;
    this.shown = 0;
    this.typeTimer = 0;
    this.selected = 0;
    this.chosen = null;
    this.msgText.text = '';
    this.buildChoiceBox();
    this.choiceBox.visible = false;
    this.state = 'opening';
    this.animT = 0;
    this.visible = true;
    this.alpha = 0;
    this.scale.set(1, 0.1);
  }

  close(chosenIndex: number | null = null) {
    if (this.state === 'closed' || this.state === 'closing') return;
    this.chosen = chosenIndex;
    this.state = 'closing';
    this.animT = 0;
  }

  private buildChoiceBox() {
    const h = this.choices.length * ROW_H + 40;
    this.choiceBg
      .clear()
      .rect(-CHOICE_W / 2, -h / 2, CHOICE_W, h)
      .fill({ color: 0x000000, alpha: 0.95 })
      .stroke({ color: 0xffffff, width: 5 })
      .rect(-CHOICE_W / 2 + 8, -h / 2 + 8, CHOICE_W - 16, h - 16)
      .stroke({ color: 0xffffff, width: 2 });

    this.rows.forEach((r) => r.destroy());
    this.rows = this.choices.map((c, i) => {
      const t = new Text({
        text: c,
        style: { fill: 0xffffff, fontSize: 28, fontFamily: DOT_FONT },
      });
      t.position.set(-CHOICE_W / 2 + 72, -h / 2 + 24 + i * ROW_H);
      this.choiceBox.addChild(t);
      return t;
    });
    this.choiceBox.position.set(MSG_W / 2 - CHOICE_W / 2 - 24, -MSG_H / 2 - h / 2 + 4);
    this.refreshCursor();
  }

  private refreshCursor() {
    const h = this.choices.length * ROW_H + 40;
    this.cursorMark.position.set(-CHOICE_W / 2 + 28, -h / 2 + 24 + this.selected * ROW_H);
    this.rows.forEach((r, i) => (r.alpha = i === this.selected ? 1 : 0.75));
  }

  /** タップ処理（論理座標）。消費したら true */
  handleTap(px: number, py: number): boolean {
    if (!this.isOpen) return false;
    if (this.state === 'closing') return true;

    if (this.state === 'typing') {
      this.shown = this.message.length;
      this.msgText.text = this.message;
      this.enterChoosing();
      return true;
    }
    if (this.state === 'choosing') {
      const row = this.choiceRowAt(px, py);
      if (row !== null) {
        this.selected = row;
        this.refreshCursor();
        this.close(row);
      }
      // 選択肢以外のタップは無視（明確な選択を促す）
      return true;
    }
    return true;
  }

  private choiceRowAt(px: number, py: number): number | null {
    const lx = px - this.x - this.choiceBox.x;
    const ly = py - this.y - this.choiceBox.y;
    const h = this.choices.length * ROW_H + 40;
    if (Math.abs(lx) > CHOICE_W / 2 || Math.abs(ly) > h / 2) return null;
    const r = Math.floor((ly + h / 2 - 16) / ROW_H);
    return r >= 0 && r < this.choices.length ? r : null;
  }

  private enterChoosing() {
    this.state = 'choosing';
    this.choiceBox.visible = true;
    this.refreshCursor();
  }

  update(dtMs: number) {
    switch (this.state) {
      case 'opening': {
        this.animT += dtMs;
        const t = Math.min(1, this.animT / OPEN_MS);
        this.alpha = t;
        this.scale.set(1, 0.1 + 0.9 * t);
        if (t >= 1) this.state = 'typing';
        break;
      }
      case 'typing': {
        this.typeTimer += dtMs;
        while (this.typeTimer >= TYPE_INTERVAL && this.shown < this.message.length) {
          this.typeTimer -= TYPE_INTERVAL;
          this.shown++;
        }
        this.msgText.text = this.message.slice(0, this.shown);
        if (this.shown >= this.message.length) this.enterChoosing();
        break;
      }
      case 'choosing': {
        // ホバーで▶移動
        const ptr = this.input.pointer;
        if (!ptr.down) {
          const row = this.choiceRowAt(ptr.x, ptr.y);
          if (row !== null && row !== this.selected) {
            this.selected = row;
            this.refreshCursor();
          }
        }
        const k = this.input.keys;
        const press = (key: string) => {
          if (k.has(key) && !this.keyLatch.has(key)) {
            this.keyLatch.add(key);
            return true;
          }
          if (!k.has(key)) this.keyLatch.delete(key);
          return false;
        };
        if (press('arrowup') || press('w')) {
          this.selected = Math.max(0, this.selected - 1);
          this.refreshCursor();
        }
        if (press('arrowdown') || press('s')) {
          this.selected = Math.min(this.choices.length - 1, this.selected + 1);
          this.refreshCursor();
        }
        if (press('enter') || press('z') || press(' ')) this.close(this.selected);
        if (press('escape')) this.close(this.choices.length - 1); // 最後の選択肢＝キャンセル
        break;
      }
      case 'closing': {
        this.animT += dtMs;
        const t = Math.min(1, this.animT / OPEN_MS);
        this.alpha = 1 - t;
        this.scale.set(1, 1 - 0.9 * t);
        if (t >= 1) {
          this.state = 'closed';
          this.visible = false;
          if (this.chosen !== null) this.onChoose?.(this.chosen);
        }
        break;
      }
    }
  }
}
