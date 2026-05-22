import { ConeEmitter, PointEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  additiveMaterial,
  fireColorOverLife,
  fireSizeOverLife,
  fadeSizeOverLife,
  quarkColor,
} from './shared';

export function createFirePrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const flames = new ParticleSystem({
    duration: 2.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({
      radius: 0.35,
      angle: 0.28,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.35, 0.85),
    startSpeed: new IntervalValue(1.2, 2.8),
    startSize: new IntervalValue(0.12, 0.38),
    startColor: quarkColor(1, 0.55, 0.12, 1),
    emissionOverTime: new ConstantValue(55),
    material: additiveMaterial(0xff6622),
    renderMode: RenderMode.BillBoard,
    behaviors: [fireColorOverLife(), fireSizeOverLife()],
  });

  const embers = new ParticleSystem({
    duration: 2.2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.15, 0.45),
    startSpeed: new IntervalValue(2, 5),
    startSize: new IntervalValue(0.04, 0.12),
    startColor: quarkColor(1, 0.75, 0.2, 1),
    emissionOverTime: new ConstantValue(35),
    material: additiveMaterial(0xffaa44),
    renderMode: RenderMode.BillBoard,
    behaviors: [fireColorOverLife(), fadeSizeOverLife()],
  });

  prefab.add(flames.emitter);
  prefab.add(embers.emitter);
  return prefab;
}
