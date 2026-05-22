import type { MagicVfxRecipe } from './vfx/magic/types';

/** 法术元素类型 */
export type ElementType = 'fire' | 'water' | 'wind' | 'earth' | 'thunder' | 'ice';

export type { MagicVfxRecipe, VfxEntityType, VfxMotionType } from './vfx/magic/types';

/** 法术形态类型 */
export type FormType = 'orb' | 'burst' | 'rain' | 'wall' | 'beam' | 'storm';

/** Worker 解析输出 */
export interface SpellData {
  elems: ElementType[];
  form: FormType;
  /** 威力等级 1~5 */
  potency: number;
  /** 影响半径（米） */
  radius: number;
  /** 基础伤害值 */
  damage: number;
  /** 置信度 0~1（规则引擎较低） */
  confidence: number;
  /** 魔法特效三元组：实体 × 元素 × 运动（Worker 解析或运行时推断） */
  magic?: MagicVfxRecipe;
}

/** Worker 通信协议 */
export type WorkerRequest =
  | { type: 'init' }
  | { type: 'parse'; text: string };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'spell'; payload: SpellData }
  | { type: 'error'; message: string };

/** 元素反应表条目 */
export interface ReactionEntry {
  name: string;
  visualClass: string;
  damageTypes: string[];
  blendMode: 'additive' | 'normal' | 'multiply';
  lifeMultiplier: number;
}
