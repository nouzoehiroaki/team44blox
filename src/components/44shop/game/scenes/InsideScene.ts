import { Container, Graphics, Text } from 'pixi.js';
import { GAME_W, GAME_H, SceneName } from '../constants';
import { Scene } from '../SceneManager';
import { GameInput } from '../Input';

/**
 * 店内シーン（Phase 0: プレースホルダ）
 * Phase 2 でメタバース風の店内マップ・レジ/グッズ/CDコーナーを実装する。
 */
export class InsideScene implements Scene {
  readonly view = new Container();
  private offTap?: () => void;

  constructor(private input: GameInput, private go: (name: SceneName) => void) {}

  enter() {
    const floor = new Graphics().rect(0, 0, GAME_W, GAME_H).fill(0x1a1512);
    this.view.addChild(floor);

    const label = new Text({
      text: '店内（Phase 2 で実装予定）\nタップ / クリックで外へ出る',
      style: { fill: 0xf5d442, fontSize: 36, fontFamily: 'sans-serif', align: 'center', lineHeight: 52 },
    });
    label.anchor.set(0.5);
    label.position.set(GAME_W / 2, GAME_H / 2);
    this.view.addChild(label);

    this.offTap = this.input.onTap(() => this.go('outside'));
  }

  exit() {
    this.offTap?.();
  }

  update(_deltaMS: number) {}
}
