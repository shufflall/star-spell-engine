import {
  CircleEmitter,
  ConeEmitter,
  HemisphereEmitter,
  PointEmitter,
  SphereEmitter,
} from 'quarks.core';
import { OrbitOverLife, Vector3 } from 'quarks.core';
import { ParticleSystem, RenderMode } from 'three.quarks';
import type { SpellData } from '../../types';
import { ELEMENT_STYLES } from './elementStyle';
import {
  getBodyVariant,
  type BodyVariant,
  type ExtraLayerKind,
} from './elementBodyVariants';
import type { MagicVfxRecipe } from './types';
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

function createExtraLayer(
  kind: ExtraLayerKind,
  tint: number,
  additive: boolean,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  const mat = materialFor(additive, tint);
  const base = {
    duration: 1.8,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    material: mat,
    renderMode: RenderMode.BillBoard,
    behaviors: [fadeSizeOverLife()],
  };

  switch (kind) {
    case 'embers':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.12, 0.35),
        startSpeed: new IntervalValue(1.5, 4),
        startSize: new IntervalValue(scaled(scale, variant, 0.05), scaled(scale, variant, 0.12)),
        startColor: quarkColor(1, 0.7, 0.2, 1),
        emissionOverTime: new ConstantValue(emit(variant, 35)),
      });
    case 'sparks':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.08, 0.2),
        startSpeed: new IntervalValue(4, 10),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: quarkColor(1, 1, 1, 1),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [
          { time: 0, count: new ConstantValue(burst(variant, 25)), cycle: 1, interval: 0.03, probability: 1 },
        ],
        material: additiveMaterial(tint),
        renderMode: RenderMode.StretchedBillBoard,
        rendererEmitterSettings: { speedFactor: 0.1 },
      });
    case 'shards':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.2, 0.45),
        startSpeed: new IntervalValue(2, 5),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: quarkColor(0.9, 0.95, 1, 0.95),
        emissionOverTime: new ConstantValue(emit(variant, 30)),
        material: normalMaterial(0xccddff),
      });
    case 'droplets':
      return new ParticleSystem({
        ...base,
        shape: new SphereEmitter({ radius: scaled(scale, variant, 0.15), thickness: 1 }),
        startLife: new IntervalValue(0.25, 0.5),
        startSpeed: new IntervalValue(0.5, 2),
        startSize: new IntervalValue(scaled(scale, variant, 0.05), scaled(scale, variant, 0.1)),
        startColor: quarkColor(0.5, 0.8, 1, 0.85),
        emissionOverTime: new ConstantValue(emit(variant, 40)),
        material: normalMaterial(tint),
      });
    case 'streaks':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.15, 0.3),
        startSpeed: new IntervalValue(3 * variant.speedMul, 7 * variant.speedMul),
        startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.2)),
        startColor: quarkColor(0.9, 0.95, 1, 0.8),
        emissionOverTime: new ConstantValue(emit(variant, 45)),
        renderMode: RenderMode.StretchedBillBoard,
        rendererEmitterSettings: { speedFactor: 0.12 },
      });
    case 'dust':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.3, 0.6),
        startSpeed: new IntervalValue(1, 3),
        startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.18)),
        startColor: quarkColor(0.55, 0.45, 0.35, 0.9),
        emissionOverTime: new ConstantValue(emit(variant, 32)),
        material: normalMaterial(0x8a7355),
      });
    case 'snow':
      return new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.4, 0.8),
        startSpeed: new ConstantValue(-0.5),
        startSize: new IntervalValue(scaled(scale, variant, 0.04), scaled(scale, variant, 0.1)),
        startColor: quarkColor(0.95, 0.98, 1, 0.9),
        emissionOverTime: new ConstantValue(emit(variant, 38)),
        material: normalMaterial(0xffffff),
      });
    default: {
      const ps = new ParticleSystem({
        ...base,
        shape: new PointEmitter(),
        startLife: new IntervalValue(0.08, 0.2),
        startSpeed: new IntervalValue(4, 10),
        startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
        startColor: quarkColor(1, 1, 1, 1),
        emissionOverTime: new ConstantValue(emit(variant, 20)),
        material: additiveMaterial(tint),
      });
      return ps;
    }
  }
}

export function buildMagicBody(recipe: MagicVfxRecipe, spell: SpellData): ParticleSystem[] {
  const style = ELEMENT_STYLES[recipe.element];
  const colorLife = style.colorLife();
  const variant = getBodyVariant(recipe.element, recipe.entity);
  const scale = vfxScale(spell);
  const systems: ParticleSystem[] = [];

  const push = (ps: ParticleSystem) => systems.push(ps);

  switch (recipe.entity) {
    case 'cone':
      push(createConeBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'sphere':
      push(createSphereBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'ring':
      push(createRingBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'column':
      push(createColumnBody(recipe, style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'disk':
      push(createDiskBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'beam':
      push(createBeamBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'cloud':
      push(createCloudBody(style.tint, style.additive, colorLife, scale, variant));
      break;
    case 'fluid':
    default:
      push(createFluidBody(style.tint, style.additive, colorLife, scale, variant));
  }

  if (variant.extra) {
    push(createExtraLayer(variant.extra, style.tint, style.additive, scale, variant));
  }

  return systems;
}

function createConeBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2,
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
    startColor: quarkColor(0.9, 0.95, 1, 0.95),
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
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.5,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.35), thickness: 1 }),
    startLife: new IntervalValue(0.35, 0.7),
    startSpeed: new IntervalValue(0.3, 1.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.15), scaled(scale, variant, 0.35)),
    startColor: quarkColor(1, 1, 1, 0.9),
    emissionOverTime: new ConstantValue(emit(variant, 55)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createRingBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.2,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new CircleEmitter({ radius: scaled(scale, variant, 0.9), arc: Math.PI * 2 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(0.4, 1.5),
    startSize: new IntervalValue(scaled(scale, variant, 0.12), scaled(scale, variant, 0.32)),
    startColor: quarkColor(1, 1, 1, 0.85),
    emissionOverTime: new ConstantValue(emit(variant, 65)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createColumnBody(
  recipe: MagicVfxRecipe,
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  const orbit = recipe.motion === 'rotate' ? 5.5 : 3;
  return new ParticleSystem({
    duration: 3,
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
    startColor: quarkColor(1, 1, 1, 0.9),
    emissionOverTime: new ConstantValue(emit(variant, 95)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [
      colorLife,
      fadeSizeOverLife(),
      new OrbitOverLife(new ConstantValue(orbit), new Vector3(0, 1, 0)),
    ],
  });
}

function createDiskBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.6,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new HemisphereEmitter({ radius: scaled(scale, variant, 1.1), thickness: 1 }),
    startLife: new IntervalValue(0.5, 1),
    startSpeed: new ConstantValue(-1.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.06), scaled(scale, variant, 0.14)),
    startColor: quarkColor(0.85, 0.92, 1, 0.85),
    emissionOverTime: new ConstantValue(emit(variant, 80)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createFluidBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.4,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.4), thickness: 0.85 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(0.8, 2.2),
    startSize: new IntervalValue(scaled(scale, variant, 0.1), scaled(scale, variant, 0.28)),
    startColor: quarkColor(0.9, 0.95, 1, 0.75),
    emissionOverTime: new ConstantValue(emit(variant, 50)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createCloudBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 2.6,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new SphereEmitter({ radius: scaled(scale, variant, 0.55), thickness: 1 }),
    startLife: new IntervalValue(0.5, 1.1),
    startSpeed: new IntervalValue(0.4, 1.5),
    startSize: new IntervalValue(scaled(scale, variant, 0.2), scaled(scale, variant, 0.45)),
    startColor: quarkColor(1, 1, 1, 0.55),
    emissionOverTime: new ConstantValue(emit(variant, 40)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.BillBoard,
    behaviors: [colorLife, fadeSizeOverLife()],
  });
}

function createBeamBody(
  tint: number,
  additive: boolean,
  colorLife: ReturnType<typeof ELEMENT_STYLES.fire.colorLife>,
  scale: number,
  variant: BodyVariant,
): ParticleSystem {
  return new ParticleSystem({
    duration: 1.5,
    looping: false,
    autoDestroy: false,
    worldSpace: false,
    shape: new ConeEmitter({
      radius: scaled(scale, variant, 0.06),
      angle: 0.03,
      arc: Math.PI * 2,
      thickness: 1,
    }),
    startLife: new IntervalValue(0.12, 0.28),
    startSpeed: new IntervalValue(10 * variant.speedMul, 18 * variant.speedMul),
    startSize: new IntervalValue(scaled(scale, variant, 0.08), scaled(scale, variant, 0.2)),
    startColor: quarkColor(1, 1, 1, 1),
    emissionOverTime: new ConstantValue(emit(variant, 75)),
    material: materialFor(additive, tint),
    renderMode: RenderMode.StretchedBillBoard,
    rendererEmitterSettings: { speedFactor: 0.05 },
    behaviors: [
      colorLife,
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.35, 0, 0), 0]])),
    ],
  });
}
