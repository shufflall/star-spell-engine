import { QuarksPrefab } from 'three.quarks';
import { iceColorOverLife } from '../shared';
import { createSwirlColumn, createSwirlRing } from './compositeShared';

export function createIceWindPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  const color = iceColorOverLife();
  prefab.add(
    createSwirlColumn({
      tint: 0xaaddff,
      colorLife: color,
      emission: 95,
      orbitSpeed: 5,
    }).emitter,
  );
  prefab.add(createSwirlRing(0xddffff, color, 50, 6).emitter);
  return prefab;
}
