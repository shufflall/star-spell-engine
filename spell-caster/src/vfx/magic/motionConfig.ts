import { motionTravelsToTarget, type VfxMotionType } from './types';

export interface MotionParams {
  speed: number;
  arcHeight: number;
  curveAmplitude: number;
  spinSpeed: number;
  baseDuration: number;
  deferCombat: boolean;
}

const BASE: Record<VfxMotionType, MotionParams> = {
  linear: {
    speed: 24,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2,
    deferCombat: true,
  },
  parabolic: {
    speed: 18,
    arcHeight: 3.5,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.6,
    deferCombat: true,
  },
  curve: {
    speed: 20,
    arcHeight: 0,
    curveAmplitude: 1.8,
    spinSpeed: 0,
    baseDuration: 2.4,
    deferCombat: true,
  },
  rotate: {
    speed: 0,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 4.5,
    baseDuration: 3.2,
    deferCombat: false,
  },
  stationary: {
    speed: 0,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.4,
    deferCombat: false,
  },
  fallFromAbove: {
    speed: 12,
    arcHeight: 0,
    curveAmplitude: 0,
    spinSpeed: 0,
    baseDuration: 2.6,
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
    baseDuration: p.baseDuration + potency * 0.2,
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
  return Math.max(0.25, distance / params.speed + 0.08);
}

export function usesDeferredCombat(motion: VfxMotionType): boolean {
  return getMotionParams(motion, 1).deferCombat;
}
