import { CircleEmitter, ConeEmitter, PointEmitter, SphereEmitter } from 'quarks.core';
import { OrbitOverLife, Vector3 } from 'quarks.core';
import { ParticleSystem, RenderMode } from 'three.quarks';
import type { ColorOverLife } from 'quarks.core';
import {
  ConstantValue,
  IntervalValue,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  additiveMaterial,
  normalMaterial,
  fadeSizeOverLife,
  quarkColor,
} from '../shared';

export interface SwirlConfig {
  tint: number;
  colorLife: ColorOverLife;
  radius?: number;
  emission?: number;
  orbitSpeed?: number;
  height?: number;
}

/** 风卷 / 旋风层 — 风火、风水、冰风等共用结构，参数区分颜色 */
export function createSwirlColumn(config: SwirlConfig): ParticleSystem {
  const {
    tint,
    colorLife,
    radius = 0.55,
    emission = 100,
    orbitSpeed = 5,
    height = 3,
  } = config;

  return new ParticleSystem({
    duration: height,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({
      radius,
      angle: 0.42,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.55, 1.15),
    startSpeed: new IntervalValue(2.5, 5),
    startSize: new IntervalValue(0.18, 0.5),
    startColor: quarkColor(1, 1, 1, 1),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      colorLife,
      fadeSizeOverLife(),
      new OrbitOverLife(new ConstantValue(orbitSpeed), new Vector3(0, 1, 0)),
    ],
  });
}

export function createSwirlRing(
  tint: number,
  colorLife: ColorOverLife,
  emission = 55,
  orbitSpeed = 7,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new CircleEmitter({ radius: 1, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.3, 0.55),
    startSpeed: new IntervalValue(3, 6),
    startSize: new IntervalValue(0.1, 0.28),
    startColor: quarkColor(1, 1, 1, 0.95),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.18 },
    behaviors: [
      colorLife,
      new OrbitOverLife(new ConstantValue(orbitSpeed), new Vector3(0, 1, 0)),
    ],
  });
}

export function createLightningBurst(
  tint: number,
  colorLife: ColorOverLife,
  count = 80,
): ParticleSystem {
  return new ParticleSystem({
    duration: 1.5,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.08, 0.2),
    startSpeed: new IntervalValue(6, 16),
    startSize: new IntervalValue(0.3, 0.75),
    startColor: quarkColor(1, 1, 1, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(count), cycle: 1, interval: 0.03, probability: 1 },
    ],
    material: additiveMaterial(tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.12 },
    behaviors: [
      colorLife,
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.25, 0, 0), 0]])),
    ],
  });
}

export function createGroundPool(
  tint: number,
  colorLife: ColorOverLife,
  radius = 0.85,
  emission = 50,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.5,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius, thickness: 0.7 }),
    startLife: new IntervalValue(0.5, 1.1),
    startSpeed: new IntervalValue(0.4, 1.2),
    startSize: new IntervalValue(0.2, 0.55),
    startColor: quarkColor(1, 1, 1, 0.8),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

export function createSteamCloud(emission = 70): ParticleSystem {
  return new ParticleSystem({
    duration: 2.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.9, thickness: 1 }),
    startLife: new IntervalValue(0.6, 1.3),
    startSpeed: new IntervalValue(1.2, 3.5),
    startSize: new IntervalValue(0.3, 0.7),
    startColor: quarkColor(0.92, 0.94, 0.96, 0.8),
    emissionOverTime: new ConstantValue(emission),
    material: normalMaterial(0xeeeeee),
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });
}

export function createLavaFountain(tint: number, colorLife: ColorOverLife): ParticleSystem {
  return new ParticleSystem({
    duration: 2.8,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({ radius: 0.45, angle: 0.32, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.45, 1),
    startSpeed: new IntervalValue(2, 5),
    startSize: new IntervalValue(0.2, 0.48),
    startColor: quarkColor(1, 0.4, 0.05, 1),
    emissionOverTime: new ConstantValue(75),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

export function createRockSpray(emission = 40): ParticleSystem {
  return new ParticleSystem({
    duration: 2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new CircleEmitter({ radius: 0.7, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.5, 1),
    startSpeed: new IntervalValue(2.5, 5.5),
    startSize: new IntervalValue(0.12, 0.3),
    startColor: quarkColor(0.5, 0.4, 0.32, 1),
    emissionOverTime: new ConstantValue(emission),
    material: normalMaterial(0x7a5a40),
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });
}
