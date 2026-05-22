import type { ElementType } from '../../types';
import type { MagicVfxRecipe, VfxEntityType, VfxMotionType } from './types';

const L = (element: ElementType, entity: VfxEntityType, motion: VfxMotionType, label: string): MagicVfxRecipe => ({
  element,
  entity,
  motion,
  label,
});

/** 仅念元素名时的默认三元组（非火球式硬编码） */
export const ELEMENT_DEFAULT_RECIPE: Record<ElementType, MagicVfxRecipe> = {
  fire: L('fire', 'fluid', 'linear', '火流体·直线'),
  water: L('water', 'fluid', 'linear', '水流体·直线'),
  ice: L('ice', 'cone', 'linear', '冰锥·直线'),
  wind: L('wind', 'column', 'rotate', '风柱·旋转'),
  earth: L('earth', 'disk', 'stationary', '土盘·定点'),
  thunder: L('thunder', 'beam', 'linear', '雷束·直线'),
};

/** 各元素常用咒语名 → 完整三元组 */
export const NAMED_SPELLS: { pattern: RegExp; recipe: MagicVfxRecipe }[] = [
  // 火
  { pattern: /火球|炎弹/, recipe: L('fire', 'sphere', 'parabolic', '火球') },
  { pattern: /火柱|炎柱/, recipe: L('fire', 'column', 'linear', '火柱') },
  { pattern: /火环|焰环|火墙/, recipe: L('fire', 'ring', 'stationary', '火环') },
  { pattern: /火束|烈焰射/, recipe: L('fire', 'beam', 'linear', '火束') },
  { pattern: /火雨|焰雨/, recipe: L('fire', 'cloud', 'fallFromAbove', '火雨') },
  { pattern: /火云|焰云/, recipe: L('fire', 'cloud', 'stationary', '火云') },
  { pattern: /熔流|火焰流体/, recipe: L('fire', 'fluid', 'curve', '熔流') },
  // 水
  { pattern: /水球|水弹/, recipe: L('water', 'sphere', 'parabolic', '水球') },
  { pattern: /水柱|潮柱/, recipe: L('water', 'column', 'linear', '水柱') },
  { pattern: /水环|潮环|水墙/, recipe: L('water', 'ring', 'stationary', '水环') },
  { pattern: /水束|激流/, recipe: L('water', 'beam', 'linear', '水束') },
  { pattern: /暴雨|水雨|潮汐/, recipe: L('water', 'fluid', 'fallFromAbove', '暴雨') },
  { pattern: /水云|水雾/, recipe: L('water', 'cloud', 'stationary', '水云') },
  { pattern: /漩涡|水旋/, recipe: L('water', 'column', 'rotate', '水旋') },
  // 冰
  { pattern: /冰锥|冰枪|霜矛/, recipe: L('ice', 'cone', 'linear', '冰锥') },
  { pattern: /冰球|霜球/, recipe: L('ice', 'sphere', 'parabolic', '冰球') },
  { pattern: /冰柱|霜柱/, recipe: L('ice', 'column', 'linear', '冰柱') },
  { pattern: /冰环|霜环|冰墙/, recipe: L('ice', 'ring', 'stationary', '冰环') },
  { pattern: /冰束|寒束/, recipe: L('ice', 'beam', 'linear', '冰束') },
  { pattern: /冰雨|霜雨|暴雪/, recipe: L('ice', 'fluid', 'fallFromAbove', '冰雨') },
  { pattern: /冰云|霜雾/, recipe: L('ice', 'cloud', 'stationary', '冰云') },
  { pattern: /冰旋|霜旋/, recipe: L('ice', 'column', 'rotate', '冰旋') },
  // 风
  { pattern: /旋风|龙卷风|风旋/, recipe: L('wind', 'column', 'rotate', '旋风') },
  { pattern: /风球|气弹/, recipe: L('wind', 'sphere', 'parabolic', '风球') },
  { pattern: /风柱|气柱/, recipe: L('wind', 'column', 'linear', '风柱') },
  { pattern: /风环|气环/, recipe: L('wind', 'ring', 'rotate', '风环') },
  { pattern: /风束|疾风/, recipe: L('wind', 'beam', 'linear', '风束') },
  { pattern: /风刃/, recipe: L('wind', 'cone', 'linear', '风刃') },
  { pattern: /风云|气云/, recipe: L('wind', 'cloud', 'stationary', '风云') },
  { pattern: /气流|风流体/, recipe: L('wind', 'fluid', 'curve', '气流') },
  // 土
  { pattern: /岩球|石弹|土球/, recipe: L('earth', 'sphere', 'parabolic', '岩球') },
  { pattern: /岩柱|石柱|土柱/, recipe: L('earth', 'column', 'linear', '岩柱') },
  { pattern: /岩环|石环|土墙/, recipe: L('earth', 'ring', 'stationary', '岩环') },
  { pattern: /岩束|震束/, recipe: L('earth', 'beam', 'linear', '岩束') },
  { pattern: /岩锥|石矛/, recipe: L('earth', 'cone', 'linear', '岩锥') },
  { pattern: /泥沼|土盘/, recipe: L('earth', 'disk', 'stationary', '泥沼') },
  { pattern: /尘云|土云/, recipe: L('earth', 'cloud', 'stationary', '尘云') },
  { pattern: /石雨|岩雨/, recipe: L('earth', 'fluid', 'fallFromAbove', '石雨') },
  { pattern: /沙尘旋|土旋/, recipe: L('earth', 'column', 'rotate', '土旋') },
  // 雷
  { pattern: /雷束|闪电束|霆光/, recipe: L('thunder', 'beam', 'linear', '雷束') },
  { pattern: /雷球|电球/, recipe: L('thunder', 'sphere', 'parabolic', '雷球') },
  { pattern: /雷柱|电柱/, recipe: L('thunder', 'column', 'linear', '雷柱') },
  { pattern: /雷环|电环/, recipe: L('thunder', 'ring', 'rotate', '雷环') },
  { pattern: /闪电|雷击/, recipe: L('thunder', 'cone', 'linear', '闪电') },
  { pattern: /雷云|电云/, recipe: L('thunder', 'cloud', 'stationary', '雷云') },
  { pattern: /雷暴雨|电雨/, recipe: L('thunder', 'fluid', 'fallFromAbove', '雷暴雨') },
  { pattern: /等离子|电浆/, recipe: L('thunder', 'fluid', 'curve', '电浆') },
];

/** 单元素全矩阵：6 元素 × 8 实体 × 6 运动（供校验与工具） */
export function buildSingleElementMatrix(): MagicVfxRecipe[] {
  const elements: ElementType[] = ['fire', 'water', 'ice', 'wind', 'earth', 'thunder'];
  const entities: VfxEntityType[] = ['sphere', 'cone', 'ring', 'column', 'disk', 'beam', 'fluid', 'cloud'];
  const motions: VfxMotionType[] = ['linear', 'parabolic', 'curve', 'rotate', 'stationary', 'fallFromAbove'];
  const out: MagicVfxRecipe[] = [];
  for (const element of elements) {
    for (const entity of entities) {
      for (const motion of motions) {
        out.push({ element, entity, motion });
      }
    }
  }
  return out;
}

export const SINGLE_ELEMENT_MATRIX_SIZE = 6 * 8 * 6;
