import {
  CircleEmitter,
  ConeEmitter,
  HemisphereEmitter,
  PointEmitter,
  SphereEmitter,
} from 'quarks.core';
import { ParticleSystem, RenderMode } from 'three.quarks';
import type { SpellData } from '../../types';
import { ELEMENT_STYLES } from './elementStyle';
import {
  getBodyVariant,
  type BodyVariant,
  type ExtraLayerKind,
} from './elementBodyVariants';
import { getMotionBodyTweaks, type MotionBodyTweaks } from './bodyMotionTweaks';
import type { ElementType } from '../../types';
import { elementCoreColor, elementStartColor } from './elementColor';
import type { MagicVfxRecipe } from './types';
import {
  createGroundPool,
  createRockSpray,
  createSwirlColumn,
  createSwirlRing,
} from '../builders/composites/compositeShared';
import {
  ConstantValue,
  IntervalValue,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  additiveMaterial,
  normalMaterial,
  fadeSizeOverLife,
} from '../builders/shared';
import { vfxScale } from '../builders/shared';

function materialFor(additive: boolean, tint: number) {
  return additive ? additiveMaterial(tint) : normalMaterial(tint);
}

function scaled(scale: number, variant: BodyVariant, n: number): number {
  return n * scale * variant.sizeMul;
}

function emit(variant: BodyVariant, n: number): number {
  return Math.round(n * variant.emissionMul);
}

function burst(variant: BodyVariant, n: number): number {
  return Math.round(n * variant.burstMul);
}

function mergeBodyVariant(base: BodyVariant, motion: MotionBodyTweaks): BodyVariant {
  return {
    emissionMul: base.emissionMul * motion.emissionMul,
    sizeMul: base.sizeMul * motion.sizeMul,
    burstMul: base.burstMul * motion.burstMul,
    speedMul: base.speedMul * motion.speedMul,
    extra: base.extra,
  };
}

function bodyDuration(base: number, durationMul: number): number {
  return base * durationMul;
}

function createExtraLayer(
  kind: ExtraLayerKind,
  element: ElementType,
  tint: number,
  additive: boolean,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  const style = ELEMENT_STYLES[element];
  const colorLife = style.colorLife();
  const mat = materialFor(additive, tint);
  const start = elementStartColor(element, 1.25);
  const base = {
    duration: 2,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  };

  switch (kind) {
    case 'embers':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.12, 0.35),
        startSpeed: new IntervalValue(1.5, 4),
        startSize: new IntervalValue(scaled(scale, variant, 0.05), scaled(scale, variant, 0.12)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 40)),
        material: additiveMaterial(tint),
      });
    case 'sparks':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.08, 0.22),
        startSpeed: new IntervalValue(4, 11),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: elementCoreColor(element, 1),
        emissionOverTime: new ConstantValue(emit(variant, 30)),
        material: additiveMaterial(tint),
        renderMode: RenderMode.StretchedBillBoard,
        rendererEmitterSettings: { speedFactor: 0.12 },
      });
    case 'shards':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.2, 0.45),
        startSpeed: new IntervalValue(2, 5),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 35)),
        material: normalMaterial(tint),
      });
    case 'droplets':
      return new ParticleSystem({
        ...base,
        shape: new SphereEmitter({ radius: scaled(scale, variant, 0.15), thickness: 1 }),
        startLife: new IntervalValue(0.25, 0.5),
        startSpeed: new IntervalValue(0.5, 2),
        startSize: new IntervalValue(scaled(scale, variant, 0.05), scaled(scale, variant, 0.1)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 45)),
        material: normalMaterial(tint),
      });
    case 'streaks':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.15, 0.3),
        startSpeed: new IntervalValue(3 * variant.speedMul, 7 * variant.speedMul),
        startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.2)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 50)),
        renderMode: RenderMode.StretchedBillBoard,
        rendererEmitterSettings: { speedFactor: 0.14 },
        material: additiveMaterial(tint),
      });
    case 'dust':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.3, 0.6),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.18)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 36)),
        material: normalMaterial(tint),
      });
    case 'snow':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.4, 0.8),
        startSpeed: new ConstantValue(-0.5),
        startSize: new IntervalValue(scaled(scale, variant, 0.04), scaled(scale, variant, 0.1)),
        startColor: elementStartColor(element, 1.1),
        emissionOverTime: new ConstantValue(emit(variant, 42)),
        material: normalMaterial(0xffffff),
      });
    default:
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.08, 0.2),
        startSpeed: new IntervalValue(4, 10),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: start,
        emissionOverTime: new ConstantValue(emit(variant, 24)),
        material: additiveMaterial(tint),
      });
  }
}

export function buildMagicBody(recipe: MagicVfxRecipe, spell: SpellData): ParticleSystem[] {
  const style = ELEMENT_STYLES[recipe.element];
  const el = recipe.element;
  const colorLife = style.colorLife();
  const motionTweaks = getMotionBodyTweaks(recipe.motion, recipe.entity);
  const variant = mergeBodyVariant(getBodyVariant(recipe.element, recipe.entity), motionTweaks);
  const scale = vfxScale(spell);
  const durMul = motionTweaks.durationMul;
  const stretchMul = motionTweaks.stretchMul;
  const mat = materialFor(style.additive, style.tint);
  const systems: ParticleSystem[] = [];
  const dedicatedEntity =
    recipe.entity === 'barrier' || recipe.entity === 'burst' || recipe.entity === 'shatter';

  const push = (ps: ParticleSystem) => systems.push(ps);
  const pushExtra = (mul = 1) => {
    if (!variant.extra) return;
    push(
      createExtraLayer(variant.extra, el, style.tint, style.additive, scale, {
        ...variant,
        emissionMul: variant.emissionMul * mul,
        burstMul: variant.burstMul * mul,
      }),
    );
  };

  switch (recipe.entity) {
    case 'barrier': {
      const parts = createBarrierBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, mat);
      for (const ps of parts) push(ps);
      pushExtra(1.1);
      break;
    }
    case 'burst': {
      const parts = createBurstBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, mat);
      for (const ps of parts) push(ps);
      pushExtra(1.45);
      break;
    }
    case 'shatter': {
      const parts = createShatterBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, mat);
      for (const ps of parts) push(ps);
      pushExtra(1.2);
      break;
    }
    case 'cone':
      push(createConeBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, stretchMul));
      break;
    case 'sphere':
      push(createSphereBody(el, style.tint, style.additive, colorLife, scale, variant, durMul));
      break;
    case 'ring':
      if (recipe.motion === 'rotate') {
        for (const ps of createVortexRingBody(
          el,
          style.tint,
          colorLife,
          scale,
          variant,
          durMul,
        )) {
          push(ps);
        }
      } else {
        push(createRingBody(el, style.tint, style.additive, colorLife, scale, variant, durMul));
      }
      break;
    case 'column':
      if (recipe.motion === 'rotate') {
        for (const ps of createTornadoBody(
          el,
          style.tint,
          colorLife,
          scale,
          variant,
          durMul,
        )) {
          push(ps);
        }
      } else {
        push(createColumnBody(el, style.tint, style.additive, colorLife, scale, variant, durMul));
      }
      break;
    case 'disk':
      push(createDiskBody(el, style.tint, style.additive, colorLife, scale, variant, durMul));
      break;
    case 'beam': {
      for (const ps of createBeamBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, stretchMul)) {
        push(ps);
      }
      break;
    }
    case 'cloud':
      if (recipe.motion === 'fallFromAbove') {
        for (const ps of createFallRainBody(
          el,
          style.tint,
          style.additive,
          colorLife,
          scale,
          variant,
          durMul,
        )) {
          push(ps);
        }
      } else {
        push(createCloudBody(el, style.tint, style.additive, colorLife, scale, variant, durMul));
      }
      break;
    case 'fluid':
      if (recipe.motion === 'fallFromAbove') {
        for (const ps of createFallRainBody(
          el,
          style.tint,
          style.additive,
          colorLife,
          scale,
          variant,
          durMul,
        )) {
          push(ps);
        }
      } else {
        push(createFluidBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, stretchMul));
      }
      break;
    default:
      push(createFluidBody(el, style.tint, style.additive, colorLife, scale, variant, durMul, stretchMul));
  }

  if (variant.extra && !dedicatedEntity) {
    pushExtra(1);
  }

  return systems;
}

function createBarrierBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul: number,
  mat: ReturnType<typeof materialFor>,
): ParticleSystem[] {
  const start = elementStartColor(el, 1.2);
  const ground = new ParticleSystem({
    duration: bodyDuration(3.2, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new CircleEmitter({ radius: scaled(scale, variant, 1.15), arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.5, 1.1),
    startSpeed: new IntervalValue(0.3, 1.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.14), scaled(scale, variant, 0.34)),
    startColor: start,
    emissionOverTime: new ConstantValue(emit(variant, 75)),
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const wall = new ParticleSystem({
    duration: bodyDuration(3.4, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.85),
      angle: 0.52,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.45, 0.95),
    startSpeed: new IntervalValue(1.8, 4.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.1), scaled(scale, variant, 0.26)),
    startColor: elementCoreColor(el, 0.88),
    emissionOverTime: new ConstantValue(emit(variant, 90)),
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const veil = new ParticleSystem({
    duration: bodyDuration(3, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new CircleEmitter({ radius: scaled(scale, variant, 0.55), arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.25, 0.55),
    startSpeed: new IntervalValue(2.5, 5),
    startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.18)),
    startColor: elementStartColor(el, 1.35, 0.75),
    emissionOverTime: new ConstantValue(emit(variant, 55)),
    material: additive ? additiveMaterial(tint) : mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });

  return [ground, wall, veil];
}

function createBurstBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul: number,
  mat: ReturnType<typeof materialFor>,
): ParticleSystem[] {
  const core = new ParticleSystem({
    duration: bodyDuration(1.6, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.35), thickness: 1 }),
    startLife: new IntervalValue(0.15, 0.4),
    startSpeed: new IntervalValue(8, 18),
    startSize: new IntervalValue(scaled(scale, variant, 0.22), scaled(scale, variant, 0.55)),
    startColor: elementCoreColor(el, 1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(burst(variant, 85)), cycle: 1, interval: 0.012, probability: 1 },
      { time: 0.05, count: new ConstantValue(burst(variant, 35)), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const linger = new ParticleSystem({
    duration: bodyDuration(2.2, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.55), thickness: 0.9 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(1, 3.5),
    startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.32)),
    startColor: elementStartColor(el, 1.05, 0.7),
    emissionOverTime: new ConstantValue(emit(variant, 40)),
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const shock = new ParticleSystem({
    duration: bodyDuration(1.1, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new CircleEmitter({ radius: scaled(scale, variant, 0.35), arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.1, 0.25),
    startSpeed: new IntervalValue(5, 12),
    startSize: new IntervalValue(scaled(scale, variant, 0.1), scaled(scale, variant, 0.28)),
    startColor: elementStartColor(el, 1.5, 0.9),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(burst(variant, 48)), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: additive ? additiveMaterial(tint) : mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  return [core, linger, shock];
}

function createShatterBody(
  el: ElementType,
  tint: number,
  _additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul: number,
  mat: ReturnType<typeof materialFor>,
): ParticleSystem[] {
  const crack = new ParticleSystem({
    duration: bodyDuration(2.4, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new HemisphereEmitter({ radius: scaled(scale, variant, 1.2), thickness: 1 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(2, 6),
    startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.2)),
    startColor: elementStartColor(el, 1.1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(burst(variant, 55)), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  const debris = new ParticleSystem({
    duration: bodyDuration(1.8, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0.25, 0.55),
    startSpeed: new IntervalValue(3, 9),
    startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.16)),
    startColor: elementCoreColor(el, 0.95),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(burst(variant, 40)), cycle: 1, interval: 0.025, probability: 1 },
    ],
    material: normalMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  });

  return [crack, debris];
}

function createConeBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
  _stretchMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(2, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.22),
      angle: 0.12,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.2, 0.45),
    startSpeed: new IntervalValue(0.5 * variant.speedMul, 2 * variant.speedMul),
    startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.28)),
    startColor: elementStartColor(el, 1.1),
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      { time: 0, count: new ConstantValue(burst(variant, 42)), cycle: 1, interval: 0.02, probability: 1 },
    ],
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      colorLife,
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.15, 0), 0]])),
    ],
  });
}

function createSphereBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(2.5, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.35), thickness: 1 }),
    startLife: new IntervalValue(0.35, 0.7),
    startSpeed: new IntervalValue(0.3, 1.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.15), scaled(scale, variant, 0.35)),
    startColor: elementStartColor(el, 1.15, 0.9),
    emissionOverTime: new ConstantValue(emit(variant, 55)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createRingBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(2.2, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new CircleEmitter({ radius: scaled(scale, variant, 0.9), arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(0.4, 1.5),
    startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.32)),
    startColor: elementStartColor(el, 1.2, 0.88),
    emissionOverTime: new ConstantValue(emit(variant, 65)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createColumnBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(3, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.5),
      angle: 0.4,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.5, 1.1),
    startSpeed: new IntervalValue(2 * variant.speedMul, 4.5 * variant.speedMul),
    startSize: new IntervalValue(scaled(scale, variant, 0.14), scaled(scale, variant, 0.38)),
    startColor: elementStartColor(el, 1.15, 0.9),
    emissionOverTime: new ConstantValue(emit(variant, 95)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

/** 火雨 / 暴雨 / 冰雨等 — 窄锥向下、世界空间拖尾 */
function createFallRainBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem[] {
  const r = scaled(scale, variant, 1.05);
  const systems: ParticleSystem[] = [
    new ParticleSystem({
      duration: bodyDuration(3.2, durMul),
      looping: false,
      autoDestroy: false,
      worldSpace: true,
      shape: new ConeEmitter({
        radius: r,
        angle: 0.055,
        arc: Math.PI * 2,
        thickness: 1,
      }),
      startLife: new IntervalValue(0.42, 0.92),
      startSpeed: new IntervalValue(3.8 * variant.speedMul, 7 * variant.speedMul),
      startSize: new IntervalValue(scaled(scale, variant, 0.05), scaled(scale, variant, 0.14)),
      startColor: elementStartColor(el, 1.05, 0.88),
      emissionOverTime: new ConstantValue(emit(variant, 105)),
      material: materialFor(additive, tint),
      renderMode: RenderMode.BillBoard,
      behaviors: [colorLife, fadeSizeOverLife()],
    }),
    new ParticleSystem({
      duration: bodyDuration(2.8, durMul),
      looping: false,
      autoDestroy: false,
      worldSpace: true,
      shape: new SphereEmitter({ radius: r * 0.45, thickness: 1 }),
      startLife: new IntervalValue(0.35, 0.75),
      startSpeed: new IntervalValue(0.6, 1.8),
      startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.32)),
      startColor: elementStartColor(el, 0.95, 0.55),
      emissionOverTime: new ConstantValue(emit(variant, 38)),
      material: materialFor(additive, tint),
      renderMode: RenderMode.BillBoard,
      behaviors: [colorLife, fadeSizeOverLife()],
    }),
  ];

  if (el === 'earth') {
    systems.push(createRockSpray(Math.round(emit(variant, 36))));
  }

  return systems;
}

/** 旋风 / 龙卷 — 与风火反应共用螺旋柱 + 环，世界空间粒子在落点自转上升 */
function createTornadoBody(
  el: ElementType,
  tint: number,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem[] {
  const orbit = 4.6 * variant.speedMul;
  const rBase = scaled(scale, variant, 0.48);
  const height = Math.max(2.8, bodyDuration(3.4, durMul) * (0.85 + scale * 0.12));

  const systems: ParticleSystem[] = [
    createSwirlColumn({
      tint,
      colorLife,
      radius: rBase,
      emission: emit(variant, 118),
      orbitSpeed: orbit,
      height,
    }),
    createSwirlRing(tint, colorLife, emit(variant, 62), orbit * 1.3),
    createGroundPool(tint, colorLife, rBase * 1.55, emit(variant, 42)),
  ];

  if (el === 'earth') {
    systems.push(createRockSpray(Math.round(emit(variant, 32))));
  }

  return systems;
}

/** 水平气旋环（风环等） */
function createVortexRingBody(
  el: ElementType,
  tint: number,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem[] {
  void el;
  const orbit = 6.8 * variant.speedMul;
  const r = scaled(scale, variant, 0.95);
  const ring = createSwirlRing(tint, colorLife, emit(variant, 92), orbit);
  ring.duration = bodyDuration(2.6, durMul);
  return [
    ring,
    createSwirlColumn({
      tint,
      colorLife,
      radius: r * 0.35,
      emission: emit(variant, 48),
      orbitSpeed: orbit * 0.85,
      height: bodyDuration(2.2, durMul),
    }),
    createGroundPool(tint, colorLife, r * 1.2, emit(variant, 35)),
  ];
}

function createDiskBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(2.6, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new HemisphereEmitter({ radius: scaled(scale, variant, 1.1), thickness: 1 }),
    startLife: new IntervalValue(0.5, 1),
    startSpeed: new ConstantValue(-1.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
    startColor: elementStartColor(el, 1.05, 0.88),
    emissionOverTime: new ConstantValue(emit(variant, 80)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createFluidBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
  stretchMul = 1,
): ParticleSystem {
  const ps = new ParticleSystem({
    duration: bodyDuration(2.4, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.4), thickness: 0.85 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(0.8, 2.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.1), scaled(scale, variant, 0.28)),
    startColor: elementStartColor(el, 1.1, 0.8),
    emissionOverTime: new ConstantValue(emit(variant, 50)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.08 * stretchMul },
    behaviors: [colorLife, fadeSizeOverLife()],
  });
  return ps;
}

function createCloudBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
): ParticleSystem {
  return new ParticleSystem({
    duration: bodyDuration(2.6, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.55), thickness: 1 }),
    startLife: new IntervalValue(0.5, 1.1),
    startSpeed: new IntervalValue(0.4, 1.5),
    startSize: new IntervalValue(scaled(scale, variant, 0.2), scaled(scale, variant, 0.45)),
    startColor: elementStartColor(el, 1.05, 0.65),
    emissionOverTime: new ConstantValue(emit(variant, 40)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createBeamBody(
  el: ElementType,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
  durMul = 1,
  stretchMul = 1,
): ParticleSystem[] {
  const core = new ParticleSystem({
    duration: bodyDuration(2.8, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.08),
      angle: 0.04,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.08, 0.2),
    startSpeed: new IntervalValue(4 * variant.speedMul, 9 * variant.speedMul),
    startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.28)),
    startColor: elementCoreColor(el, 1),
    emissionOverTime: new ConstantValue(emit(variant, 130)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.12 * stretchMul },
    behaviors: [
      colorLife,
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.35, 0, 0), 0]])),
    ],
  });

  const glow = new ParticleSystem({
    duration: bodyDuration(2.6, durMul),
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.14),
      angle: 0.06,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.12, 0.3),
    startSpeed: new IntervalValue(2.5 * variant.speedMul, 6 * variant.speedMul),
    startSize: new IntervalValue(scaled(scale, variant, 0.16), scaled(scale, variant, 0.36)),
    startColor: elementStartColor(el, 1.2, 0.75),
    emissionOverTime: new ConstantValue(emit(variant, 55)),
    material: additiveMaterial(tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });

  return [core, glow];
}
