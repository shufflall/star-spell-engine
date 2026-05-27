import { CircleEmitter, PointEmitter, SphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import type { SpellData } from '../../types';
import { ELEMENT_STYLES } from './elementStyle';
import { elementStartColor } from './elementColor';
import type { MagicVfxRecipe, VfxEntityType, VfxMotionType } from './types';
import {
  ConstantValue,
  IntervalValue,
  fadeSizeOverLife,
  quarkColor,
  additiveMaterial,
  normalMaterial,
} from '../builders/shared';
import { vfxScale } from '../builders/shared';

interface ImpactProfile {
  flashCount: number;
  sparkCount: number;
  flashRadius: number;
  sparkSpeed: [number, number];
  ring?: boolean;
  upwardBurst?: boolean;
}

function profileForEntity(entity: VfxEntityType): ImpactProfile | null {
  switch (entity) {
    case 'burst':
      return {
        flashCount: 65,
        sparkCount: 45,
        flashRadius: 0.8,
        sparkSpeed: [4, 12],
        ring: true,
      };
    case 'shatter':
      return {
        flashCount: 50,
        sparkCount: 38,
        flashRadius: 0.7,
        sparkSpeed: [3, 9],
        ring: true,
      };
    case 'barrier':
      return {
        flashCount: 22,
        sparkCount: 14,
        flashRadius: 0.55,
        sparkSpeed: [2, 5],
        ring: true,
      };
    default:
      return null;
  }
}

function profileForMotion(motion: VfxMotionType): ImpactProfile {
  switch (motion) {
    case 'linear':
      return {
        flashCount: 32,
        sparkCount: 38,
        flashRadius: 0.45,
        sparkSpeed: [4, 11],
      };
    case 'parabolic':
      return {
        flashCount: 48,
        sparkCount: 42,
        flashRadius: 0.65,
        sparkSpeed: [3, 9],
        ring: true,
      };
    case 'curve':
      return {
        flashCount: 40,
        sparkCount: 52,
        flashRadius: 0.55,
        sparkSpeed: [5, 12],
      };
    case 'fallFromAbove':
      return {
        flashCount: 55,
        sparkCount: 36,
        flashRadius: 0.75,
        sparkSpeed: [2, 7],
        ring: true,
        upwardBurst: true,
      };
    default:
      return {
        flashCount: 35,
        sparkCount: 28,
        flashRadius: 0.5,
        sparkSpeed: [3, 8],
      };
  }
}

/** 命中目标时的爆发粒子（随运动方式变化形态） */
export function composeImpactBurst(recipe: MagicVfxRecipe, spell: SpellData): QuarksPrefab {
  const style = ELEMENT_STYLES[recipe.element];
  const colorLife = style.colorLife();
  const scale = vfxScale(spell) * 0.85;
  const prof = profileForEntity(recipe.entity) ?? profileForMotion(recipe.motion);
  const prefab = new QuarksPrefab();
  const mat = style.additive ? additiveMaterial(style.tint) : normalMaterial(style.tint);
  const start = elementStartColor(recipe.element, 1.2);

  const flash = new ParticleSystem({
    duration: 0.95,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({
      radius: prof.flashRadius * scale,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.15, 0.38),
    startSpeed: new IntervalValue(2, 5.5),
    startSize: new IntervalValue(0.15 * scale, 0.42 * scale),
    startColor: start,
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(prof.flashCount),
        cycle: 1,
        interval: 0.02,
        probability: 1,
      },
    ],
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const sparks = new ParticleSystem({
    duration: 0.75,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.1, 0.28),
    startSpeed: new IntervalValue(prof.sparkSpeed[0], prof.sparkSpeed[1]),
    startSize: new IntervalValue(0.06 * scale, 0.18 * scale),
    startColor: elementStartColor(recipe.element, 1.4, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(prof.sparkCount),
        cycle: 1,
        interval: 0.02,
        probability: 1,
      },
    ],
    material: additiveMaterial(style.tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });

  prefab.add(flash.emitter);
  prefab.add(sparks.emitter);

  if (prof.ring) {
    const ring = new ParticleSystem({
      duration: 0.7,
      looping: false,
      autoDestroy: false,
      worldSpace: true,
      shape: new CircleEmitter({ radius: 0.9 * scale, arc: Math.PI * 2 }),
      startLife: new IntervalValue(0.2, 0.45),
      startSpeed: new IntervalValue(3, 7),
      startSize: new IntervalValue(0.08 * scale, 0.2 * scale),
      startColor: quarkColor(1, 1, 1, 0.75),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        {
          time: 0,
          count: new ConstantValue(24),
          cycle: 1,
          interval: 0.02,
          probability: 1,
        },
      ],
      material: mat,
      renderMode: RenderMode.BillBoard,
      behaviors: [colorLife, fadeSizeOverLife()],
    });
    prefab.add(ring.emitter);
  }

  if (prof.upwardBurst) {
    const rise = new ParticleSystem({
      duration: 0.85,
      looping: false,
      autoDestroy: false,
      worldSpace: true,
      shape: new PointEmitter(),
      startLife: new IntervalValue(0.25, 0.55),
      startSpeed: new IntervalValue(3, 8),
      startSize: new IntervalValue(0.1 * scale, 0.24 * scale),
      startColor: quarkColor(0.9, 0.95, 1, 0.85),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        {
          time: 0,
          count: new ConstantValue(22),
          cycle: 1,
          interval: 0.03,
          probability: 1,
        },
      ],
      material: additiveMaterial(style.tint),
      renderMode: RenderMode.BillBoard,
      behaviors: [fadeSizeOverLife()],
    });
    prefab.add(rise.emitter);
  }

  return prefab;
}
