import { motionTravelsToTarget, type VfxMotionType } from './types';

export interface MotionParams {
  speed: number;
  arcHeight: number;
  curveAmplitude: number;
  spinSpeed: number;
  baseDuration: number;
  /** 命中后拖尾时间（秒），再销毁弹道 group */
  tailDuration: number;
  deferCombat: boolean;
}

const BASE: Record<VfxMotionType, MotionParams> = {
  linear: {
    speed: 26,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2,
    tailDuration: 0.45,
    deferCombat: true,
  },
  parabolic: {
    speed: 19,
    arcHeight: 4,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.6,
    tailDuration: 0.55,
    deferCombat: true,
  },
  curve: {
    speed: 21,
    arcHeight: 0.6,
    curveAmplitude: 2.2,
    spinSpeed: 0,
    baseDuration: 2.4,
    tailDuration: 0.5,
    deferCombat: true,
  },
  rotate: {
    speed: 0,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 3.6,
    tailDuration: 0.4,
    deferCombat: false,
  },
  stationary: {
    speed: 0,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.8,
    tailDuration: 0.3,
    deferCombat: false,
  },
  fallFromAbove: {
    speed: 14,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.8,
    tailDuration: 0.5,
    deferCombat: true,
  },
};

export function getMotionParams(motion: VfxMotionType, potency: number): MotionParams {
  const p = BASE[motion];
  const mul = 0.88 + potency * 0.07;
  return {
    ...p,
    speed: p.speed * mul,
    arcHeight: p.arcHeight * (0.9 + potency * 0.1),
    curveAmplitude: p.curveAmplitude * mul,
    baseDuration: p.baseDuration + potency * 0.22,
    tailDuration: p.tailDuration + potency * 0.04,
  };
}

/** 根据起点—目标距离估算飞行时长 */
export function computeFlightDuration(
  distance: number,
  motion: VfxMotionType,
  params: MotionParams,
): number {
  if (!motionTravelsToTarget(motion)) {
    return params.baseDuration;
  }
  if (distance < 0.05) return 0.2;
  return Math.max(0.28, distance / params.speed + 0.1);
}

/** 下落运动：由落点上方高度与下落速度估算 */
export function computeFallDuration(
  originY: number,
  targetY: number,
  potency: number,
  params: MotionParams,
): number {
  const dropH = Math.max(originY, targetY) + 5 + potency;
  const fallDist = Math.max(0.5, dropH - targetY);
  return Math.max(0.4, fallDist / params.speed + 0.12);
}

/** 特效 group 存活时间：覆盖飞行/下落全程 + 拖尾 */
export function computeEffectDuration(
  motion: VfxMotionType,
  potency: number,
  flightTime: number,
): number {
  const p = getMotionParams(motion, potency);
  if (motionTravelsToTarget(motion) || motion === 'fallFromAbove') {
    return Math.max(p.baseDuration, flightTime + p.tailDuration);
  }
  return p.baseDuration;
}

export function usesDeferredCombat(motion: VfxMotionType): boolean {
  return getMotionParams(motion, 1).deferCombat;
}
