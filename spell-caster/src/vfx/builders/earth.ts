import { CircleEmitter, PointEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import {
  ConstantValue,
  IntervalValue,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  normalMaterial,
  earthColorOverLife,
  quarkColor,
} from './shared';

export function createEarthPrefab(): QuarksPrefab {
  const prefab = new QuarksPrefab();

  const dust = new ParticleSystem({
    duration: 2.2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new CircleEmitter({ radius: 0.7, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.5, 1),
    startSpeed: new IntervalValue(0.8, 2),
    startSize: new IntervalValue(0.1, 0.28),
    startColor: quarkColor(0.55, 0.45, 0.35, 0.85),
    emissionOverTime: new ConstantValue(50),
    material: normalMaterial(0x8a7355),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      earthColorOverLife(),
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(0.3, 0.8, 1, 0.2), 0]]),
      ),
    ],
  });

  const rocks = new ParticleSystem({
    duration: 1.2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.35, 0.65),
    startSpeed: new IntervalValue(2, 4.5),
    startSize: new IntervalValue(0.12, 0.25),
    startColor: quarkColor(0.5, 0.42, 0.35, 1),
    emissionOverTime: new ConstantValue(18),
    material: normalMaterial(0x6b5a45),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(1, 0.7, 0.4, 0.1), 0]]),
      ),
    ],
  });

  prefab.add(dust.emitter);
  prefab.add(rocks.emitter);
  return prefab;
}
