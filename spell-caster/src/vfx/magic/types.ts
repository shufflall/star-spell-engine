import type { ElementType } from '../../types';

/**
 * 魔法特效三元组：实体形状 × 元素 × 运动
 * 咒语里的「束 / 屏障 / 爆 / 崩」等均为实体类型，见 ENTITY_LABELS
 */
export type VfxEntityType =
  | 'sphere'
  | 'cone'
  | 'ring'
  | 'column'
  | 'disk'
  | 'beam'
  | 'fluid'
  | 'cloud'
  | 'barrier'
  | 'burst'
  | 'shatter';

export type VfxMotionType =
  | 'linear'
  | 'parabolic'
  | 'curve'
  | 'rotate'
  | 'stationary'
  | 'fallFromAbove';

export interface MagicVfxRecipe {
  entity: VfxEntityType;
  element: ElementType;
  motion: VfxMotionType;
  label?: string;
}

/** 实体形状中文名（与咒语关键词一一对应） */
export const ENTITY_LABELS: Record<VfxEntityType, string> = {
  sphere: '球体',
  cone: '锥形',
  ring: '环',
  column: '柱',
  disk: '盘',
  beam: '束',
  fluid: '流体',
  cloud: '云团',
  barrier: '屏障',
  burst: '爆发',
  shatter: '崩裂',
};

export const MOTION_LABELS: Record<VfxMotionType, string> = {
  linear: '直线',
  parabolic: '抛物',
  curve: '曲线',
  rotate: '旋转',
  stationary: '定点',
  fallFromAbove: '下落',
};

export function motionTravelsToTarget(motion: VfxMotionType): boolean {
  return motion === 'linear' || motion === 'parabolic' || motion === 'curve';
}

export function motionNeedsImpact(motion: VfxMotionType): boolean {
  return motionTravelsToTarget(motion) || motion === 'fallFromAbove';
}

/** 落点立即展开的实体（爆发 / 崩裂） */
export function entityNeedsInstantImpact(entity: VfxEntityType): boolean {
  return entity === 'burst' || entity === 'shatter';
}

/** 定点维持的实体（屏障 / 环 / 云等） */
export function entityPrefersStationary(entity: VfxEntityType): boolean {
  return (
    entity === 'barrier' ||
    entity === 'burst' ||
    entity === 'shatter' ||
    entity === 'ring' ||
    entity === 'disk' ||
    entity === 'cloud'
  );
}

/** 旋转运动由粒子 Orbit 表现，不再整体旋转 group */
export function motionUsesParticleVortex(recipe: MagicVfxRecipe): boolean {
  return recipe.motion === 'rotate' && (recipe.entity === 'column' || recipe.entity === 'ring');
}

/** 下落雨/云：锥形向下发射，group 只平移不旋转 */
export function motionUsesRainEmitter(recipe: MagicVfxRecipe): boolean {
  return (
    recipe.motion === 'fallFromAbove' &&
    (recipe.entity === 'fluid' || recipe.entity === 'cloud')
  );
}
