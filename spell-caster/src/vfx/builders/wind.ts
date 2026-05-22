import { CircleEmitter, SphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  additiveMaterial,
  normalMaterial,
  windColorOverLife,
  quarkColor,
} from './shared';

export function createWindPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const gust = new ParticleSystem({
    duration: 1.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new CircleEmitter({ radius: 0.5, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.2, 0.45),
    startSpeed: new IntervalValue(3, 6),
    startSize: new IntervalValue(0.15, 0.35),
    startColor: quarkColor(0.75, 0.9, 1, 0.8),
    emissionOverTime: new ConstantValue(45),
    material: additiveMaterial(0xaaddff),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.12 },
    behaviors: [
      windColorOverLife(),
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(1, 0.5, 0.1, 0), 0]]),
      ),
    ],
  });

  const dust = new ParticleSystem({
    duration: 1.5,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.4, thickness: 0.4 }),
    startLife: new IntervalValue(0.25, 0.5),
    startSpeed: new IntervalValue(1, 2.5),
    startSize: new IntervalValue(0.05, 0.12),
    startColor: quarkColor(0.7, 0.75, 0.65, 0.6),
    emissionOverTime: new ConstantValue(30),
    material: normalMaterial(0xaaaa99),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(0.5, 1, 0.3, 0), 0]]),
      ),
    ],
  });

  prefab.add(gust.emitter);
  prefab.add(dust.emitter);
  return prefab;
}
