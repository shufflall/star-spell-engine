import { QuarksPrefab } from 'three.quarks';
import { fireColorOverLife } from '../shared';
import { createSteamCloud, createLavaFountain } from './compositeShared';

export function createFireWaterPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  prefab.add(createSteamCloud(100).emitter);
  prefab.add(
    createLavaFountain(0xff5522, fireColorOverLife()).emitter,
  );
  return prefab;
}
