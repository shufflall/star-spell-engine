import type { ElementType } from '../../types';
import { ELEMENT_DEFAULT_RECIPE, NAMED_SPELLS } from './elementCatalog';
import {
  ENTITY_LABELS,
  MOTION_LABELS,
  type MagicVfxRecipe,
  type VfxEntityType,
  type VfxMotionType,
} from './types';

const ELEMENT_LABEL: Record<ElementType, string> = {
  fire: '火',
  water: '水',
  ice: '冰',
  wind: '风',
  earth: '土',
  thunder: '雷',
};

const ENTITY_RULES: { type: VfxEntityType; pattern: RegExp }[] = [
  { type: 'sphere', pattern: /球体|球形|球状|(?:^|[\s，、])球(?:$|[\s，、弹珠])|弹丸|宝珠/ },
  { type: 'cone', pattern: /锥形|锥体|锥状|锥|矛|枪|刺|针|刃/ },
  { type: 'column', pattern: /柱形|柱体|气柱|水柱|火柱|岩柱|冰柱|雷柱/ },
  { type: 'ring', pattern: /环状|环形|环|圈|壁|墙|盾|屏障/ },
  { type: 'disk', pattern: /盘状|圆盘|盘|泊|潭|湖面|沼/ },
  { type: 'beam', pattern: /束状|光束|射线|光柱|激光|霆光/ },
  { type: 'fluid', pattern: /流体|液流|水流|熔流|流体状|液体|气流|电浆/ },
  { type: 'cloud', pattern: /云团|烟云|雾团|烟|汽|云雾|团雾|云$/ },
];

const MOTION_RULES: { type: VfxMotionType; pattern: RegExp }[] = [
  { type: 'linear', pattern: /直线|直射|平射|贯穿|飞行|射向|冲向|射击/ },
  { type: 'parabolic', pattern: /抛物|双曲线|投掷|掷出|抛出|抛射/ },
  { type: 'curve', pattern: /曲线|弧线|蜿蜒|弯曲|弧行|蛇形/ },
  { type: 'rotate', pattern: /旋转|回旋|旋绕|自转|绕转|打转/ },
  { type: 'stationary', pattern: /定点|停留|不动|定住|原地/ },
  { type: 'fallFromAbove', pattern: /下落|降落|倾泻|从天而降|坠|暴雨|之雨/ },
];

function matchEntity(text: string): VfxEntityType | null {
  for (const { type, pattern } of ENTITY_RULES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

function matchMotion(text: string): VfxMotionType | null {
  for (const { type, pattern } of MOTION_RULES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

function buildLabel(entity: VfxEntityType, element: ElementType, motion: VfxMotionType): string {
  return `${ELEMENT_LABEL[element]}·${ENTITY_LABELS[entity]}·${MOTION_LABELS[motion]}`;
}

/**
 * 从咒语解析三元组：命名法术 > 显式实体/运动 > 元素默认
 */
export function parseMagicLanguage(text: string, element: ElementType): MagicVfxRecipe {
  const trimmed = text.trim();

  for (const { pattern, recipe } of NAMED_SPELLS) {
    if (pattern.test(trimmed) && recipe.element === element) {
      return { ...recipe };
    }
  }

  const explicitEntity = matchEntity(trimmed);
  const explicitMotion = matchMotion(trimmed);

  if (!explicitEntity && !explicitMotion) {
    return { ...ELEMENT_DEFAULT_RECIPE[element] };
  }

  const entity = explicitEntity ?? 'fluid';
  const motion = explicitMotion ?? 'linear';

  if (motion === 'rotate' && !explicitEntity) {
    const ent: VfxEntityType =
      element === 'wind' || element === 'earth' ? 'column' : 'ring';
    return { entity: ent, element, motion, label: buildLabel(ent, element, motion) };
  }

  if (motion === 'fallFromAbove' && !explicitEntity) {
    const ent: VfxEntityType =
      element === 'water' || element === 'ice' ? 'fluid' : 'cloud';
    return { entity: ent, element, motion, label: buildLabel(ent, element, motion) };
  }

  if (motion === 'stationary' && !explicitEntity) {
    const ent: VfxEntityType = element === 'earth' ? 'disk' : 'cloud';
    return { entity: ent, element, motion, label: buildLabel(ent, element, motion) };
  }

  return {
    entity,
    element,
    motion,
    label: buildLabel(entity, element, motion),
  };
}
