import { QuarksPrefab } from 'three.quarks';
import { waterColorOverLife } from '../shared';
import { createSwirlColumn, createSwirlRing, createGroundPool } from './compositeShared';

/** 风水 / 海啸旋风 — 水 + 风 */
export function createWaterWindPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  const color = waterColorOverLife();
  prefab.add(
    createSwirlColumn({
      tint: 0x2288ff,
      colorLife: color,
      radius: 0.6,
      emission: 105,
      orbitSpeed: 5.5,
    }).emitter,
  );
  prefab.add(createSwirlRing(0x66ccff, color, 65, 7).emitter);
  prefab.add(createGroundPool(0x1155aa, color, 1, 45).emitter);
  return prefab;
}
