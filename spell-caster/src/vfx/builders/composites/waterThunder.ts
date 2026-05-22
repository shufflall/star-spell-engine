import { QuarksPrefab } from 'three.quarks';
import { waterColorOverLife, thunderColorOverLife } from '../shared';
import { createLightningBurst, createGroundPool, createSwirlRing } from './compositeShared';

export function createWaterThunderPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  prefab.add(createLightningBurst(0xccffff, thunderColorOverLife(), 100).emitter);
  prefab.add(createGroundPool(0x2266ff, waterColorOverLife(), 0.9, 55).emitter);
  prefab.add(createSwirlRing(0x88bbff, waterColorOverLife(), 35, 4).emitter);
  return prefab;
}
