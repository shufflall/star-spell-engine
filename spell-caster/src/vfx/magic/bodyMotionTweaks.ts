import type { VfxEntityType, VfxMotionType } from './types';

/** 运动方式对粒子发射/寿命的乘数（叠在元素×实体 variant 之上） */
export interface MotionBodyTweaks {
  emissionMul: number;
  speedMul: number;
  sizeMul: number;
  durationMul: number;
  burstMul: number;
  /** 柱/束沿轴向拉伸（StretchedBillBoard speedFactor 缩放） */
  stretchMul: number;
}

const DEFAULT: MotionBodyTweaks = {
  emissionMul: 1,
  speedMul: 1,
  sizeMul: 1,
  durationMul: 1,
  burstMul: 1,
  stretchMul: 1,
};

const BY_MOTION: Record<VfxMotionType, Partial<MotionBodyTweaks>> = {
  linear: {
    emissionMul: 1.15,
    speedMul: 1.4,
    sizeMul: 0.92,
    durationMul: 0.95,
    stretchMul: 1.25,
  },
  parabolic: {
    emissionMul: 1.05,
    speedMul: 0.75,
    sizeMul: 1.12,
    durationMul: 1.15,
    burstMul: 1.1,
  },
  curve: {
    emissionMul: 1.2,
    speedMul: 1.1,
    sizeMul: 0.95,
    durationMul: 1.05,
    stretchMul: 1.15,
  },
  rotate: {
    emissionMul: 1.35,
    speedMul: 0.9,
    sizeMul: 1.08,
    durationMul: 1.25,
    burstMul: 0.85,
  },
  stationary: {
    emissionMul: 1.45,
    speedMul: 0.55,
    sizeMul: 1.18,
    durationMul: 1.3,
    burstMul: 0.9,
  },
  fallFromAbove: {
    emissionMul: 1.5,
    speedMul: 1.6,
    sizeMul: 1.05,
    durationMul: 1.1,
    burstMul: 1.2,
  },
};

const BY_ENTITY: Partial<Record<VfxEntityType, Partial<MotionBodyTweaks>>> = {
  beam: { emissionMul: 1.35, speedMul: 1.5, stretchMul: 1.5, durationMul: 1.2 },
  barrier: { emissionMul: 1.25, sizeMul: 1.15, durationMul: 1.35 },
  burst: { burstMul: 1.45, emissionMul: 1.2, speedMul: 1.3 },
  shatter: { burstMul: 1.35, sizeMul: 1.1, emissionMul: 1.15 },
  cone: { stretchMul: 1.15 },
  fluid: { stretchMul: 1.1 },
};

const ENTITY_STRETCH: Partial<Record<VfxEntityType, number>> = {
  beam: 1.35,
  cone: 1.15,
  fluid: 1.1,
};

export function getMotionBodyTweaks(
  motion: VfxMotionType,
  entity: VfxEntityType,
): MotionBodyTweaks {
  const m = { ...DEFAULT, ...BY_MOTION[motion], ...BY_ENTITY[entity] };
  const entStretch = ENTITY_STRETCH[entity] ?? 1;
  return {
    ...m,
    stretchMul: m.stretchMul * entStretch,
  };
}
