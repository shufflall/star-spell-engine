import { QuarksPrefab } from 'three.quarks';
import { thunderColorOverLife, earthColorOverLife } from '../shared';
import { createLightningBurst, createRockSpray, createGroundPool } from './compositeShared';

export function createEarthThunderPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  prefab.add(createLightningBurst(0xffeeaa, thunderColorOverLife(), 90).emitter);
  prefab.add(createRockSpray(55).emitter);
  prefab.add(createGroundPool(0x887755, earthColorOverLife(), 0.75, 40).emitter);
  return prefab;
}
