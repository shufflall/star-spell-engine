import type { Object3D } from 'three';
import { QuarksUtil } from 'three.quarks';
import type { SpellData } from '../types';
import { BaseEffect } from '../effects/BaseEffect';
import { vfxDuration } from './builders/shared';

/** 包装 three.quarks 实例，纳入 Engine 特效生命周期 */
export class QuarksSpellEffect extends BaseEffect {
  private readonly instance: Object3D;

  constructor(
    position: import('three').Vector3,
    spellData: SpellData,
    instance: Object3D,
    baseDuration: number,
  ) {
    super(position, spellData, vfxDuration(spellData, baseDuration));
    this.instance = instance;
    this.group.add(instance);
  }

  update(dt: number): void {
    if (this.dead) return;
    this.tickLife(dt);
  }

  dispose(): void {
    QuarksUtil.stop(this.instance);
    this.group.remove(this.instance);
    this.instance.traverse((child) => {
      const obj = child as { dispose?: () => void };
      obj.dispose?.();
    });
  }
}
