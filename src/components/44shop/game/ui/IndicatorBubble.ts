import { Container, Graphics, Text } from 'pixi.js';

/**
 * 「！」吹き出し（インタラクション可能表示）
 * update(t) で上下にふわふわ動く。
 */
export class IndicatorBubble extends Container {
  private baseY = 0;
  private t = 0;

  constructor() {
    super();
    const g = new Graphics()
      .roundRect(-22, -26, 44, 52, 10)
      .fill(0xffffff)
      .stroke({ color: 0x111111, width: 4 });
    // しっぽ
    g.moveTo(-8, 26).lineTo(0, 40).lineTo(8, 26).fill(0xffffff).stroke({ color: 0x111111, width: 4 });
    this.addChild(g);

    const mark = new Text({
      text: '！',
      style: { fill: 0xd42a1e, fontSize: 38, fontFamily: 'sans-serif', fontWeight: '900' },
    });
    mark.anchor.set(0.5);
    mark.position.set(0, -1);
    this.addChild(mark);
    this.visible = false;
  }

  setBase(x: number, y: number) {
    this.baseY = y;
    this.position.set(x, y);
  }

  update(dtMs: number) {
    if (!this.visible) return;
    this.t += dtMs;
    this.y = this.baseY + Math.sin(this.t * 0.005) * 6;
  }
}
