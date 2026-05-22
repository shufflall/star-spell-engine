import type { ElementType, ReactionEntry } from '../../types';

export type ReactionId =
  | 'fire+wind+thunder'
  | 'fire+wind'
  | 'water+wind'
  | 'water+thunder'
  | 'fire+ice'
  | 'water+ice'
  | 'fire+earth'
  | 'fire+water'
  | 'ice+wind'
  | 'earth+thunder'
  | 'fire+thunder'
  | 'water+earth'
  | 'earth+wind'
  | 'earth+ice'
  | 'ice+thunder'
  | 'wind+thunder';

export interface ReactionDef extends ReactionEntry {
  id: ReactionId;
  elements: ElementType[];
  baseDuration: number;
  scaleMul: number;
  damageMultiplier: number;
  color: number;
}

export const REACTIONS: Record<ReactionId, ReactionDef> = {
  'fire+wind+thunder': {
    id: 'fire+wind+thunder',
    elements: ['fire', 'wind', 'thunder'],
    name: '雷火旋风',
    visualClass: 'StormInferno',
    damageTypes: ['burn', 'shock', 'slashing'],
    blendMode: 'additive',
    lifeMultiplier: 1.6,
    baseDuration: 3.5,
    scaleMul: 1.4,
    damageMultiplier: 1.45,
    color: 0xff8844,
  },
  'fire+wind': {
    id: 'fire+wind',
    elements: ['fire', 'wind'],
    name: '烈焰旋风',
    visualClass: 'FireTornado',
    damageTypes: ['burn', 'slashing'],
    blendMode: 'additive',
    lifeMultiplier: 1.5,
    baseDuration: 3.2,
    scaleMul: 1.35,
    damageMultiplier: 1.35,
    color: 0xff6622,
  },
  'water+wind': {
    id: 'water+wind',
    elements: ['water', 'wind'],
    name: '海啸旋风',
    visualClass: 'Typhoon',
    damageTypes: ['wet', 'slashing'],
    blendMode: 'additive',
    lifeMultiplier: 1.45,
    baseDuration: 3.2,
    scaleMul: 1.35,
    damageMultiplier: 1.3,
    color: 0x44aaff,
  },
  'water+thunder': {
    id: 'water+thunder',
    elements: ['water', 'thunder'],
    name: '感电风暴',
    visualClass: 'ElectroPulse',
    damageTypes: ['shock', 'wet'],
    blendMode: 'additive',
    lifeMultiplier: 1.3,
    baseDuration: 2.8,
    scaleMul: 1.25,
    damageMultiplier: 1.3,
    color: 0x66ccff,
  },
  'fire+ice': {
    id: 'fire+ice',
    elements: ['fire', 'ice'],
    name: '冰火消融',
    visualClass: 'SteamBurst',
    damageTypes: ['burn', 'frost'],
    blendMode: 'normal',
    lifeMultiplier: 1.25,
    baseDuration: 2.8,
    scaleMul: 1.2,
    damageMultiplier: 1.25,
    color: 0xccddee,
  },
  'water+ice': {
    id: 'water+ice',
    elements: ['water', 'ice'],
    name: '暴雪',
    visualClass: 'Blizzard',
    damageTypes: ['frost', 'wet'],
    blendMode: 'normal',
    lifeMultiplier: 1.4,
    baseDuration: 3.4,
    scaleMul: 1.3,
    damageMultiplier: 1.2,
    color: 0xaaeeff,
  },
  'fire+earth': {
    id: 'fire+earth',
    elements: ['fire', 'earth'],
    name: '熔岩喷发',
    visualClass: 'MagmaBurst',
    damageTypes: ['burn', 'crush'],
    blendMode: 'additive',
    lifeMultiplier: 1.35,
    baseDuration: 3,
    scaleMul: 1.25,
    damageMultiplier: 1.3,
    color: 0xff5522,
  },
  'fire+water': {
    id: 'fire+water',
    elements: ['fire', 'water'],
    name: '高温蒸汽',
    visualClass: 'VaporCloud',
    damageTypes: ['burn', 'wet'],
    blendMode: 'normal',
    lifeMultiplier: 1.2,
    baseDuration: 2.8,
    scaleMul: 1.15,
    damageMultiplier: 1.15,
    color: 0x99bbcc,
  },
  'ice+wind': {
    id: 'ice+wind',
    elements: ['ice', 'wind'],
    name: '冰霜旋风',
    visualClass: 'FrostCyclone',
    damageTypes: ['frost', 'slashing'],
    blendMode: 'normal',
    lifeMultiplier: 1.35,
    baseDuration: 3.2,
    scaleMul: 1.3,
    damageMultiplier: 1.25,
    color: 0xbbddff,
  },
  'earth+thunder': {
    id: 'earth+thunder',
    elements: ['earth', 'thunder'],
    name: '震雷',
    visualClass: 'SeismicBolt',
    damageTypes: ['shock', 'crush'],
    blendMode: 'additive',
    lifeMultiplier: 1.3,
    baseDuration: 2.5,
    scaleMul: 1.2,
    damageMultiplier: 1.35,
    color: 0xddcc88,
  },
  'fire+thunder': {
    id: 'fire+thunder',
    elements: ['fire', 'thunder'],
    name: '雷火闪爆',
    visualClass: 'PlasmaFlare',
    damageTypes: ['burn', 'shock'],
    blendMode: 'additive',
    lifeMultiplier: 1.25,
    baseDuration: 2.4,
    scaleMul: 1.2,
    damageMultiplier: 1.3,
    color: 0xffaa66,
  },
  'water+earth': {
    id: 'water+earth',
    elements: ['water', 'earth'],
    name: '泥沼洪流',
    visualClass: 'Mudslide',
    damageTypes: ['wet', 'crush'],
    blendMode: 'normal',
    lifeMultiplier: 1.3,
    baseDuration: 2.9,
    scaleMul: 1.2,
    damageMultiplier: 1.2,
    color: 0x668855,
  },
  'earth+wind': {
    id: 'earth+wind',
    elements: ['earth', 'wind'],
    name: '沙尘旋风',
    visualClass: 'DustDevil',
    damageTypes: ['crush', 'slashing'],
    blendMode: 'normal',
    lifeMultiplier: 1.3,
    baseDuration: 3,
    scaleMul: 1.25,
    damageMultiplier: 1.22,
    color: 0xbb9988,
  },
  'earth+ice': {
    id: 'earth+ice',
    elements: ['earth', 'ice'],
    name: '冻土裂隙',
    visualClass: 'Permafrost',
    damageTypes: ['frost', 'crush'],
    blendMode: 'normal',
    lifeMultiplier: 1.35,
    baseDuration: 3.1,
    scaleMul: 1.25,
    damageMultiplier: 1.22,
    color: 0x99bbcc,
  },
  'ice+thunder': {
    id: 'ice+thunder',
    elements: ['ice', 'thunder'],
    name: '冰雷碎击',
    visualClass: 'FrostShock',
    damageTypes: ['frost', 'shock'],
    blendMode: 'additive',
    lifeMultiplier: 1.28,
    baseDuration: 2.6,
    scaleMul: 1.22,
    damageMultiplier: 1.28,
    color: 0xbbeeff,
  },
  'wind+thunder': {
    id: 'wind+thunder',
    elements: ['wind', 'thunder'],
    name: '风雷裂空',
    visualClass: 'StormShear',
    damageTypes: ['shock', 'slashing'],
    blendMode: 'additive',
    lifeMultiplier: 1.3,
    baseDuration: 2.5,
    scaleMul: 1.25,
    damageMultiplier: 1.32,
    color: 0xccddee,
  },
};

/** 优先级：更具体、更常见的双元素组合靠前 */
const MATCH_ORDER: ReactionId[] = [
  'fire+wind+thunder',
  'fire+wind',
  'water+wind',
  'water+thunder',
  'water+ice',
  'fire+ice',
  'ice+wind',
  'fire+earth',
  'fire+water',
  'earth+thunder',
  'fire+thunder',
  'wind+thunder',
  'ice+thunder',
  'earth+wind',
  'earth+ice',
  'water+earth',
];

function elemSet(elems: ElementType[]): Set<ElementType> {
  return new Set(elems);
}

function matches(def: ReactionDef, set: Set<ElementType>): boolean {
  return def.elements.every((e) => set.has(e));
}

/**
 * 匹配元素反应：
 * - 2 元素咒语 → 优先精确双元素反应
 * - 3+ 元素 → 先找完全匹配，否则取优先级最高的双元素子集
 */
export function findReaction(elems: ElementType[]): ReactionDef | null {
  const unique = [...new Set(elems)];
  if (unique.length < 2) return null;
  const set = elemSet(unique);

  if (unique.length === 2) {
    const key = [...unique].sort().join('+') as ReactionId;
    if (key in REACTIONS) return REACTIONS[key as ReactionId];
  }

  for (const id of MATCH_ORDER) {
    const def = REACTIONS[id];
    if (def.elements.length === unique.length && matches(def, set)) {
      return def;
    }
  }

  for (const id of MATCH_ORDER) {
    const def = REACTIONS[id];
    if (def.elements.length === 2 && matches(def, set)) {
      return def;
    }
  }

  return null;
}
