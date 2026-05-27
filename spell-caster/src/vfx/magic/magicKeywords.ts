import type { VfxEntityType, VfxMotionType } from './types';

/** 顺序优先：语义强的形状在前，避免「火墙」只命中环 */
const ENTITY_RULES: { type: VfxEntityType; pattern: RegExp }[] = [
  { type: 'barrier', pattern: /屏障|护盾|护壁|壁垒|守护罩|防护|盾墙|盾壁|(?:^|[\s，、])盾(?:$|[\s，、])/ },
  { type: 'barrier', pattern: /火墙|水墙|冰墙|土墙|岩墙|雷墙|风墙|石墙|魔墙|(?:^|[\s，、])墙(?:$|[\s，、])/ },
  { type: 'burst', pattern: /爆|轰|炸|爆裂|爆散|焰火|绽放|引爆/ },
  { type: 'shatter', pattern: /崩|碎裂|塌陷|震碎|龟裂|地裂|开裂/ },
  {
    type: 'beam',
    pattern:
      /[火水木风土雷炎冰霜焰气]束|(?:^|[\s，、])束(?:$|[\s，、])|束状|光束|射线|脉冲|激光|贯穿光|霆光|雷束|火束|冰束|水束/,
  },
  { type: 'sphere', pattern: /球体|球形|球状|(?:^|[\s，、])球(?:$|[\s，、弹珠])|弹丸|宝珠/ },
  { type: 'cone', pattern: /锥形|锥体|锥状|锥|矛|枪|刺|针|刃/ },
  { type: 'column', pattern: /柱形|柱体|气柱|水柱|火柱|岩柱|冰柱|雷柱|风暴|龙卷|飓风/ },
  { type: 'ring', pattern: /环状|环形|(?:^|[^风])环(?!流)|圈/ },
  { type: 'disk', pattern: /盘状|圆盘|盘|泊|潭|湖面|泥沼/ },
  { type: 'fluid', pattern: /流体|液流|水流|熔流|流体状|液体|气流|电浆|之雨|暴雨|倾盆|雨幕|洒落/ },
  { type: 'cloud', pattern: /云团|烟云|雾团|烟|汽|云雾|团雾|云$/ },
];

const MOTION_RULES: { type: VfxMotionType; pattern: RegExp }[] = [
  { type: 'linear', pattern: /直线|直射|平射|贯穿|飞行|射向|冲向|射击/ },
  { type: 'parabolic', pattern: /抛物|双曲线|投掷|掷出|抛出|抛射/ },
  { type: 'curve', pattern: /曲线|弧线|蜿蜒|弯曲|弧行|蛇形/ },
  { type: 'rotate', pattern: /旋转|回旋|旋绕|自转|绕转|打转|旋风|龙卷/ },
  { type: 'stationary', pattern: /定点|停留|不动|定住|原地/ },
  { type: 'fallFromAbove', pattern: /下落|降落|倾泻|从天而降|坠/ },
];

export function matchEntity(text: string): VfxEntityType | null {
  for (const { type, pattern } of ENTITY_RULES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

export function matchMotion(text: string): VfxMotionType | null {
  for (const { type, pattern } of MOTION_RULES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

/** 仅给出实体时，推断默认运动 */
export function defaultMotionForEntity(entity: VfxEntityType): VfxMotionType {
  switch (entity) {
    case 'beam':
    case 'cone':
    case 'fluid':
      return 'linear';
    case 'sphere':
      return 'parabolic';
    case 'column':
      return 'rotate';
    case 'barrier':
    case 'burst':
    case 'shatter':
    case 'ring':
    case 'disk':
    case 'cloud':
      return 'stationary';
    default:
      return 'linear';
  }
}
