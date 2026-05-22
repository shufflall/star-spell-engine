import { QuarksPrefab } from 'three.quarks';
import { fireColorOverLife, thunderColorOverLife } from '../shared';
import { createSwirlColumn, createSwirlRing, createLightningBurst } from './compositeShared';

export function createFireWindThunderPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  const fire = fireColorOverLife();
  prefab.add(
    createSwirlColumn({
      tint: 0xff4400,
      colorLife: fire,
      emission: 115,
      orbitSpeed: 5,
    }).emitter,
  );
  prefab.add(createSwirlRing(0xffaa55, fire, 65, 7).emitter);
  prefab.add(
    createLightningBurst(0xeeffff, thunderColorOverLife(), 50).emitter,
  );
  return prefab;
}
