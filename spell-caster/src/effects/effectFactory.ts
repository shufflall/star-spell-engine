import * as THREE from 'three';
import type { SpellData } from '../types';
import { VfxLibrary, type SpellVfxResult } from '../vfx/VfxLibrary';

export type { SpellVfxResult };

/** 元素反应优先；否则按单元素叠放 quarks 特效 */
export function createSpellVfx(
  spell: SpellData,
  origin: THREE.Vector3,
  target: THREE.Vector3,
  _direction: THREE.Vector3,
): SpellVfxResult {
  const lib = VfxLibrary.get();
  if (!lib.ready) {
    return { effects: [], reaction: null, deferCombat: false };
  }
  return lib.spawnSpell(spell, origin, target);
}
