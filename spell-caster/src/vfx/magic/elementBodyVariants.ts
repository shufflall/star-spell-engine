import type { ElementType } from '../../types';
import type { VfxEntityType } from './types';

export type ExtraLayerKind = 'embers' | 'sparks' | 'shards' | 'droplets' | 'streaks' | 'dust' | 'snow';

export interface BodyVariant {
  emissionMul: number;
  sizeMul: number;
  burstMul: number;
  speedMul: number;
  extra?: ExtraLayerKind;
}

const DEFAULT: BodyVariant = {
  emissionMul: 1,
  sizeMul: 1,
  burstMul: 1,
  speedMul: 1,
};

function v(
  partial: Partial<BodyVariant> & { extra?: ExtraLayerKind },
): BodyVariant {
  return { ...DEFAULT, ...partial };
}

/** 元素 × 实体 粒子参数差异 */
export const BODY_VARIANTS: Record<ElementType, Partial<Record<VfxEntityType, BodyVariant>>> = {
  fire: {
    sphere: v({ extra: 'embers', emissionMul: 1.15, sizeMul: 1.05 }),
    cone: v({ extra: 'embers', burstMul: 1.2 }),
    column: v({ emissionMul: 1.2, extra: 'embers' }),
    beam: v({ emissionMul: 1.1, speedMul: 1.1 }),
    fluid: v({ emissionMul: 1.1, extra: 'embers' }),
    cloud: v({ emissionMul: 0.95, sizeMul: 1.1 }),
    ring: v({ emissionMul: 1.05 }),
    disk: v({ emissionMul: 1 }),
    barrier: v({ emissionMul: 1.2, extra: 'embers', sizeMul: 1.08 }),
    burst: v({ extra: 'embers', burstMul: 1.4, emissionMul: 1.15 }),
    shatter: v({ extra: 'embers', burstMul: 1.2 }),
  },
  water: {
    sphere: v({ extra: 'droplets', emissionMul: 1.1 }),
    cone: v({ extra: 'droplets', burstMul: 1.1 }),
    column: v({ emissionMul: 1.15, extra: 'droplets' }),
    beam: v({ emissionMul: 1.05 }),
    fluid: v({ emissionMul: 1.25, extra: 'droplets' }),
    cloud: v({ emissionMul: 1, sizeMul: 1.15 }),
    ring: v({ emissionMul: 1.1 }),
    disk: v({ emissionMul: 1.2, sizeMul: 1.1 }),
    barrier: v({ emissionMul: 1.15, extra: 'droplets' }),
    burst: v({ extra: 'droplets', burstMul: 1.35 }),
    shatter: v({ extra: 'droplets', burstMul: 1.1 }),
  },
  ice: {
    sphere: v({ extra: 'shards', emissionMul: 0.95, sizeMul: 0.95 }),
    cone: v({ extra: 'shards', burstMul: 1.35, sizeMul: 1.05 }),
    column: v({ emissionMul: 1, extra: 'snow' }),
    beam: v({ burstMul: 1.1 }),
    fluid: v({ extra: 'snow', emissionMul: 1.1 }),
    cloud: v({ emissionMul: 0.9, sizeMul: 1.05 }),
    ring: v({ emissionMul: 1 }),
    disk: v({ emissionMul: 1.15, extra: 'snow' }),
    barrier: v({ emissionMul: 1.05, extra: 'shards' }),
    burst: v({ extra: 'shards', burstMul: 1.45 }),
    shatter: v({ extra: 'shards', burstMul: 1.35, sizeMul: 1.05 }),
  },
  wind: {
    sphere: v({ extra: 'streaks', speedMul: 1.2 }),
    cone: v({ speedMul: 1.15, burstMul: 1.1 }),
    column: v({ emissionMul: 1.2, extra: 'streaks' }),
    beam: v({ emissionMul: 1.15, speedMul: 1.25 }),
    fluid: v({ emissionMul: 1.1, extra: 'streaks' }),
    cloud: v({ emissionMul: 1.05 }),
    ring: v({ emissionMul: 1.1, speedMul: 1.1 }),
    disk: v({ emissionMul: 1 }),
    barrier: v({ emissionMul: 1.1, extra: 'streaks' }),
    burst: v({ extra: 'streaks', burstMul: 1.3 }),
    shatter: v({ extra: 'streaks', burstMul: 1.15 }),
  },
  earth: {
    sphere: v({ extra: 'dust', emissionMul: 0.9, sizeMul: 1.1 }),
    cone: v({ extra: 'dust', burstMul: 1.15 }),
    column: v({ emissionMul: 1.05, extra: 'dust' }),
    beam: v({ emissionMul: 0.95 }),
    fluid: v({ extra: 'dust', emissionMul: 1 }),
    cloud: v({ emissionMul: 0.85, sizeMul: 1.2 }),
    ring: v({ emissionMul: 1.05 }),
    disk: v({ emissionMul: 1.25, sizeMul: 1.15 }),
    barrier: v({ emissionMul: 1.1, extra: 'dust', sizeMul: 1.12 }),
    burst: v({ extra: 'dust', burstMul: 1.25 }),
    shatter: v({ extra: 'dust', burstMul: 1.4, sizeMul: 1.1 }),
  },
  thunder: {
    sphere: v({ extra: 'sparks', emissionMul: 1.1 }),
    cone: v({ extra: 'sparks', burstMul: 1.25 }),
    column: v({ emissionMul: 1.1, extra: 'sparks' }),
    beam: v({ emissionMul: 1.3, speedMul: 1.2, burstMul: 1.2 }),
    fluid: v({ extra: 'sparks', emissionMul: 1.15 }),
    cloud: v({ emissionMul: 1.05 }),
    ring: v({ emissionMul: 1.1, extra: 'sparks' }),
    disk: v({ emissionMul: 1 }),
    barrier: v({ emissionMul: 1.15, extra: 'sparks' }),
    burst: v({ extra: 'sparks', burstMul: 1.5, emissionMul: 1.2 }),
    shatter: v({ extra: 'sparks', burstMul: 1.3 }),
  },
};

export function getBodyVariant(element: ElementType, entity: VfxEntityType): BodyVariant {
  return BODY_VARIANTS[element][entity] ?? DEFAULT;
}
