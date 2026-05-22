import { QuarksPrefab } from 'three.quarks';
import { fireColorOverLife } from '../shared';
import { createLavaFountain, createRockSpray } from './compositeShared';

export function createFireEarthPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  prefab.add(createLavaFountain(0xff4400, fireColorOverLife()).emitter);
  prefab.add(createRockSpray(50).emitter);
  return prefab;
}
