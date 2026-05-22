import { PointEmitter, SphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  additiveMaterial,
  thunderColorOverLife,
  quarkColor,
} from './shared';

export function createThunderPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const bolt = new ParticleSystem({
    duration: 0.45,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.05, 0.15),
    startSpeed: new IntervalValue(4, 12),
    startSize: new IntervalValue(0.2, 0.55),
    startColor: quarkColor(0.9, 0.95, 1, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(60),
        cycle: 1,
        interval: 0.05,
        probability: 1,
      },
    ],
    material: additiveMaterial(0xeeffff),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.08 },
    behaviors: [
      thunderColorOverLife(),
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(1, 0.3, 0, 0), 0]]),
      ),
    ],
  });

  const glow = new ParticleSystem({
    duration: 0.6,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.35, thickness: 1 }),
    startLife: new IntervalValue(0.1, 0.25),
    startSpeed: new ConstantValue(0),
    startSize: new IntervalValue(0.5, 1.2),
    startColor: quarkColor(0.6, 0.75, 1, 0.8),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(8),
        cycle: 1,
        interval: 0.1,
        probability: 1,
      },
    ],
    material: additiveMaterial(0x8899ff),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(1.2, 0.8, 0, 0), 0]]),
      ),
    ],
  });

  prefab.add(bolt.emitter);
  prefab.add(glow.emitter);
  return prefab;
}
