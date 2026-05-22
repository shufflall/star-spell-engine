import { HemisphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  normalMaterial,
  iceColorOverLife,
  fadeSizeOverLife,
  quarkColor,
} from '../shared';

export function createWaterIcePrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const blizzard = new ParticleSystem({
    duration: 3.4,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new HemisphereEmitter({ radius: 1.6, thickness: 1 }),
    startLife: new IntervalValue(0.8, 1.5),
    startSpeed: new ConstantValue(-1.4),
    startSize: new IntervalValue(0.08, 0.18),
    startColor: quarkColor(0.95, 0.98, 1, 0.9),
    emissionOverTime: new ConstantValue(120),
    material: normalMaterial(0xffffff),
    renderMode: RenderMode.BillBoard,
    behaviors: [iceColorOverLife(), fadeSizeOverLife()],
  });

  prefab.add(blizzard.emitter);
  return prefab;
}
