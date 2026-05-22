import { CircleEmitter, ConeEmitter, HemisphereEmitter, PointEmitter, SphereEmitter } from 'quarks.core';
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
  fireColorOverLife,
  iceColorOverLife,
  waterColorOverLife,
  windColorOverLife,
  earthColorOverLife,
  thunderColorOverLife,
  fadeSizeOverLife,
  quarkColor,
} from '../builders/shared';
import {
  createSwirlColumn,
  createSwirlRing,
  createLightningBurst,
  createGroundPool,
  createSteamCloud,
  createLavaFountain,
  createRockSpray,
} from '../builders/composites/compositeShared';
import type { ColorPreset, VfxLayer, VfxModuleId } from './types';

const COLOR_FACTORIES: Record<ColorPreset, () => ColorOverLife> = {
  fire: fireColorOverLife,
  ice: iceColorOverLife,
  water: waterColorOverLife,
  wind: windColorOverLife,
  earth: earthColorOverLife,
  thunder: thunderColorOverLife,
};

function colorLife(preset: ColorPreset): ColorOverLife {
  return COLOR_FACTORIES[preset]();
}

function createOrbBurst(tint: number, color: ColorPreset, count = 48): ParticleSystem {
  return new ParticleSystem({
    duration: 1.2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.25, thickness: 1 }),
    startLife: new IntervalValue(0.25, 0.55),
    startSpeed: new IntervalValue(2, 5),
    startSize: new IntervalValue(0.1, 0.28),
    startColor: quarkColor(1, 1, 1, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(count), cycle: 1, interval: 0.04, probability: 1 },
    ],
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife(color), fadeSizeOverLife()],
  });
}

function createNarrowBeam(tint: number, color: ColorPreset, emission = 65): ParticleSystem {
  return new ParticleSystem({
    duration: 1.4,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({ radius: 0.08, angle: 0.04, arc: Math.PI * 2, thickness: 1 }),
    startLife: new IntervalValue(0.15, 0.35),
    startSpeed: new IntervalValue(8, 14),
    startSize: new IntervalValue(0.08, 0.2),
    startColor: quarkColor(1, 1, 1, 0.95),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.06 },
    behaviors: [
      colorLife(color),
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.4, 0, 0), 0]])),
    ],
  });
}

function createRainFall(tint: number, color: ColorPreset, emission = 80): ParticleSystem {
  return new ParticleSystem({
    duration: 2.4,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new ConeEmitter({ radius: 1.1, angle: 0.06, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.45, 0.95),
    startSpeed: new IntervalValue(3, 5.5),
    startSize: new IntervalValue(0.05, 0.14),
    startColor: quarkColor(0.5, 0.8, 1, 0.9),
    emissionOverTime: new ConstantValue(emission),
    material: normalMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife(color), fadeSizeOverLife()],
  });
}

function createWallRing(tint: number, color: ColorPreset, emission = 70): ParticleSystem {
  return new ParticleSystem({
    duration: 2.2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new CircleEmitter({ radius: 1.4, arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.4, 0.85),
    startSpeed: new IntervalValue(0.5, 1.8),
    startSize: new IntervalValue(0.15, 0.4),
    startColor: quarkColor(1, 1, 1, 0.85),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife(color), fadeSizeOverLife()],
  });
}

function createEmberBurst(tint: number, color: ColorPreset, emission = 45): ParticleSystem {
  return new ParticleSystem({
    duration: 2,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.2, 0.5),
    startSpeed: new IntervalValue(3, 7),
    startSize: new IntervalValue(0.08, 0.2),
    startColor: quarkColor(1, 0.55, 0.15, 1),
    emissionOverTime: new ConstantValue(emission),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife(color)],
  });
}

function createBlizzardLayer(emission = 120, radius = 1.6): ParticleSystem {
  return new ParticleSystem({
    duration: 3.4,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new HemisphereEmitter({ radius, thickness: 1 }),
    startLife: new IntervalValue(0.8, 1.5),
    startSpeed: new ConstantValue(-1.4),
    startSize: new IntervalValue(0.08, 0.18),
    startColor: quarkColor(0.95, 0.98, 1, 0.9),
    emissionOverTime: new ConstantValue(emission),
    material: normalMaterial(0xffffff),
    renderMode: RenderMode.BillBoard,
    behaviors: [iceColorOverLife(), fadeSizeOverLife()],
  });
}

/** 根据一层配置实例化 ParticleSystem */
export function spawnModule(layer: VfxLayer): ParticleSystem {
  switch (layer.module) {
    case 'swirlColumn':
      return createSwirlColumn({
        tint: layer.tint,
        colorLife: colorLife(layer.color),
        radius: layer.radius,
        emission: layer.emission,
        orbitSpeed: layer.orbitSpeed,
        height: layer.height,
      });
    case 'swirlRing':
      return createSwirlRing(
        layer.tint,
        colorLife(layer.color),
        layer.emission,
        layer.orbitSpeed,
      );
    case 'lightningBurst':
      return createLightningBurst(
        layer.tint,
        colorLife(layer.color),
        layer.count,
      );
    case 'groundPool':
      return createGroundPool(
        layer.tint,
        colorLife(layer.color),
        layer.radius,
        layer.emission,
      );
    case 'steamCloud':
      return createSteamCloud(layer.emission);
    case 'lavaFountain':
      return createLavaFountain(layer.tint, colorLife(layer.color));
    case 'rockSpray':
      return createRockSpray(layer.emission);
    case 'emberBurst':
      return createEmberBurst(
        layer.tint ?? 0xff6622,
        layer.color ?? 'fire',
        layer.emission,
      );
    case 'blizzard':
      return createBlizzardLayer(layer.emission, layer.radius);
    case 'orbBurst':
      return createOrbBurst(layer.tint, layer.color, layer.count);
    case 'narrowBeam':
      return createNarrowBeam(layer.tint, layer.color, layer.emission);
    case 'rainFall':
      return createRainFall(layer.tint, layer.color, layer.emission);
    case 'wallRing':
      return createWallRing(layer.tint, layer.color, layer.emission);
    default:
      throw new Error(`Unknown VFX module: ${(layer as { module: string }).module}`);
  }
}

export const MODULE_IDS: VfxModuleId[] = [
  'swirlColumn',
  'swirlRing',
  'lightningBurst',
  'groundPool',
  'steamCloud',
  'lavaFountain',
  'rockSpray',
  'emberBurst',
  'blizzard',
  'orbBurst',
  'narrowBeam',
  'rainFall',
  'wallRing',
];
