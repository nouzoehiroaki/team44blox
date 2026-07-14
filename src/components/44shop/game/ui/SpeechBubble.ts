import { Container, Graphics, Text } from 'pixi.js';
import { DOT_FONT } from '../constants';

/**
 * キャラの頭上に出る小さなセリフ吹き出し（「暇だなー」等）
 */
export class SpeechBubble extends Container {
  private txt: Text;
  private bg: Graphics;

  constructor() {
    super();
    this.bg = new Graphics();
    this.addChild(this.bg);
    this.txt = new Text({
      text: '',
      style: { fill: 0x111111, fontSize: 26, fontFamily: DOT_FONT },
    });
    this.txt.anchor.set(0.5);
    this.addChild(this.txt);
    this.visible = false;
  }

  show(text: string) {
    this.txt.text = text;
    const w = Math.max(120, this.txt.width + 44);
    const h = 62;
    this.bg
      .clear()
      .roundRect(-w / 2, -h / 2, w, h, 10)
      .fill(0xffffff)
      .stroke({ color: 0x111111, width: 4 })
      .moveTo(-10, h / 2)
      .lineTo(0, h / 2 + 14)
      .lineTo(10, h / 2)
      .fill(0xffffff)
      .stroke({ color: 0x111111, width: 4 });
    this.visible = true;
    this.alpha = 1;
  }

  hide() {
    this.visible = false;
  }
}
