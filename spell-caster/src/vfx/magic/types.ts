import type { ElementType } from '../../types';

/**
 * 魔法特效三元组：实体 × 元素 × 运动
 * 由咒语语言分别指定；缺省时单元素为「流体 + 直线飞向目标」
 */
export type VfxEntityType =
  | 'sphere'
  | 'cone'
  | 'ring'
  | 'column'
  | 'disk'
  | 'beam'
  | 'fluid'
  | 'cloud';

/** 运动方式（由咒语关键词设定） */
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

export const ENTITY_LABELS: Record<VfxEntityType, string> = {
  sphere: '球体',
  cone: '锥形',
  ring: '环',
  column: '柱',
  disk: '盘',
  beam: '束',
  fluid: '流体',
  cloud: '云团',
};

export const MOTION_LABELS: Record<VfxMotionType, string> = {
  linear: '直线',
  parabolic: '抛物',
  curve: '曲线',
  rotate: '旋转',
  stationary: '定点',
  fallFromAbove: '下落',
};

/** 需要从施法起点飞向目标落点的运动 */
export function motionTravelsToTarget(motion: VfxMotionType): boolean {
  return motion === 'linear' || motion === 'parabolic' || motion === 'curve';
}
