import { PointEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  additiveMaterial,
  fireColorOverLife,
  quarkColor,
} from '../shared';
import { createSteamCloud } from './compositeShared';

export function createFireIcePrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();
  prefab.add(createSteamCloud(90).emitter);

  const sparks = new ParticleSystem({
    duration: 2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.2, 0.5),
    startSpeed: new IntervalValue(3, 7),
    startSize: new IntervalValue(0.08, 0.2),
    startColor: quarkColor(1, 0.55, 0.15, 1),
    emissionOverTime: new ConstantValue(45),
    material: additiveMaterial(0xff6622),
    renderMode: RenderMode.BillBoard,
    behaviors: [fireColorOverLife()],
  });
  prefab.add(sparks.emitter);
  return prefab;
}
