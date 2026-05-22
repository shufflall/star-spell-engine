import { PointEmitter, SphereEmitter } from 'quarks.core';
import { ParticleSystem, QuarksPrefab, RenderMode } from 'three.quarks';
import type { SpellData } from '../../types';
import { ELEMENT_STYLES } from './elementStyle';
import type { MagicVfxRecipe } from './types';
import {
  ConstantValue,
  IntervalValue,
  fadeSizeOverLife,
  quarkColor,
  additiveMaterial,
  normalMaterial,
} from '../builders/shared';
import { vfxScale } from '../builders/shared';

/** 命中目标时的爆发粒子 */
export function composeImpactBurst(recipe: MagicVfxRecipe, spell: SpellData): QuarksPrefab {
  const style = ELEMENT_STYLES[recipe.element];
  const colorLife = style.colorLife();
  const scale = vfxScale(spell) * 0.85;
  const prefab = new QuarksPrefab();
  const mat = style.additive ? additiveMaterial(style.tint) : normalMaterial(style.tint);

  const flash = new ParticleSystem({
    duration: 0.9,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new SphereEmitter({ radius: 0.5 * scale, thickness: 1 }),
    startLife: new IntervalValue(0.15, 0.35),
    startSpeed: new IntervalValue(2, 5),
    startSize: new IntervalValue(0.15 * scale, 0.4 * scale),
    startColor: quarkColor(1, 1, 1, 0.9),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(35), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const sparks = new ParticleSystem({
    duration: 0.7,
    looping: false,
    autoDestroy: false,
    worldSpace: true,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.1, 0.25),
    startSpeed: new IntervalValue(3, 8),
    startSize: new IntervalValue(0.06 * scale, 0.16 * scale),
    startColor: quarkColor(1, 1, 1, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(28), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: additiveMaterial(style.tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });

  prefab.add(flash.emitter);
  prefab.add(sparks.emitter);
  return prefab;
}
