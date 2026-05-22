import { SphereEmitter, HemisphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  normalMaterial,
  iceColorOverLife,
  fadeSizeOverLife,
  quarkColor,
} from './shared';

export function createIcePrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const crystals = new ParticleSystem({
    duration: 3,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.6, thickness: 1 }),
    startLife: new IntervalValue(0.8, 1.6),
    startSpeed: new IntervalValue(0.2, 0.8),
    startSize: new IntervalValue(0.08, 0.22),
    startColor: quarkColor(0.85, 0.95, 1, 0.9),
    emissionOverTime: new ConstantValue(40),
    material: normalMaterial(0xcceeff),
    renderMode: RenderMode.BillBoard,
    behaviors: [iceColorOverLife(), fadeSizeOverLife()],
  });

  const snow = new ParticleSystem({
    duration: 2.5,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new HemisphereEmitter({ radius: 1.2, thickness: 1 }),
    startLife: new IntervalValue(0.6, 1.2),
    startSpeed: new ConstantValue(-0.6),
    startSize: new IntervalValue(0.04, 0.1),
    startColor: quarkColor(0.95, 0.98, 1, 0.7),
    emissionOverTime: new ConstantValue(50),
    material: normalMaterial(0xffffff),
    renderMode: RenderMode.BillBoard,
    behaviors: [iceColorOverLife(), fadeSizeOverLife()],
  });

  prefab.add(crystals.emitter);
  prefab.add(snow.emitter);
  return prefab;
}
