import { QuarksPrefab } from 'three.quarks';
import { fireColorOverLife } from '../shared';
import { createSwirlColumn, createSwirlRing } from './compositeShared';

export function createFireWindPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  const color = fireColorOverLife();
  prefab.add(
    createSwirlColumn({
      tint: 0xff4400,
      colorLife: color,
      emission: 110,
      orbitSpeed: 4.5,
    }).emitter,
  );
  prefab.add(
    createSwirlRing(0xffaa44, color, 60, 6.5).emitter,
  );
  return prefab;
}
