import { ConeEmitter, SphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  normalMaterial,
  additiveMaterial,
  waterColorOverLife,
  fadeSizeOverLife,
  quarkColor,
} from './shared';

export function createWaterPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const rain = new ParticleSystem({
    duration: 2.5,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({
      radius: 0.8,
      angle: 0.08,
      arc: Math.PI * 2,
    }),
    startLife: new IntervalValue(0.4, 0.9),
    startSpeed: new IntervalValue(2.5, 4.5),
    startSize: new IntervalValue(0.06, 0.14),
    startColor: quarkColor(0.4, 0.7, 1, 0.85),
    emissionOverTime: new ConstantValue(70),
    material: normalMaterial(0x55aaff),
    renderMode: RenderMode.BillBoard,
    behaviors: [waterColorOverLife(), fadeSizeOverLife()],
  });

  const mist = new ParticleSystem({
    duration: 1.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.5, thickness: 0.6 }),
    startLife: new IntervalValue(0.3, 0.6),
    startSpeed: new IntervalValue(0.3, 1),
    startSize: new IntervalValue(0.2, 0.45),
    startColor: quarkColor(0.6, 0.85, 1, 0.5),
    emissionOverTime: new ConstantValue(25),
    material: additiveMaterial(0x88ccff),
    renderMode: RenderMode.BillBoard,
    behaviors: [waterColorOverLife(), fadeSizeOverLife()],
  });

  prefab.add(rain.emitter);
  prefab.add(mist.emitter);
  return prefab;
}
