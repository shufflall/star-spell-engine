import type { ElementType, FormType } from '../../types';
import type { VfxRecipe } from '../modules/types';

const ELEMENT_TINT: Record<ElementType, number> = {
  fire: 0xff6622,
  ice: 0xaaddff,
  water: 0x55aaff,
  wind: 0xaaddff,
  earth: 0x8a7355,
  thunder: 0xeeffff,
};

/** 非 burst 形态：用模块配方替代默认单元素预制 */
const FORM_RECIPES: Partial<Record<ElementType, Partial<Record<FormType, VfxRecipe>>>> = {
  fire: {
    orb: {
      layers: [{ module: 'orbBurst', tint: ELEMENT_TINT.fire, color: 'fire', count: 55 }],
    },
    beam: {
      layers: [{ module: 'narrowBeam', tint: ELEMENT_TINT.fire, color: 'fire', emission: 70 }],
    },
    storm: {
      layers: [
        { module: 'swirlColumn', tint: 0xff4400, color: 'fire', emission: 100, orbitSpeed: 4 },
        { module: 'emberBurst', color: 'fire' },
      ],
    },
    rain: {
      layers: [{ module: 'emberBurst', tint: ELEMENT_TINT.fire, color: 'fire', emission: 60 }],
    },
    wall: {
      layers: [{ module: 'wallRing', tint: 0xff4400, color: 'fire', emission: 75 }],
    },
  },
  ice: {
    orb: {
      layers: [{ module: 'orbBurst', tint: ELEMENT_TINT.ice, color: 'ice', count: 45 }],
    },
    rain: {
      layers: [{ module: 'blizzard', emission: 90, radius: 1.2 }],
    },
    wall: {
      layers: [{ module: 'wallRing', tint: 0x88ccff, color: 'ice', emission: 65 }],
    },
    storm: {
      layers: [
        { module: 'swirlColumn', tint: 0xaaddff, color: 'ice', emission: 90, orbitSpeed: 4.5 },
        { module: 'blizzard', emission: 40, radius: 0.9 },
      ],
    },
  },
  water: {
    orb: {
      layers: [{ module: 'orbBurst', tint: ELEMENT_TINT.water, color: 'water', count: 50 }],
    },
    rain: {
      layers: [{ module: 'rainFall', tint: ELEMENT_TINT.water, color: 'water', emission: 85 }],
    },
    storm: {
      layers: [
        { module: 'swirlColumn', tint: 0x2288ff, color: 'water', emission: 95, orbitSpeed: 5 },
        { module: 'groundPool', tint: 0x1155aa, color: 'water', emission: 40 },
      ],
    },
    wall: {
      layers: [{ module: 'wallRing', tint: 0x4488cc, color: 'water', emission: 70 }],
    },
  },
  wind: {
    orb: {
      layers: [{ module: 'orbBurst', tint: ELEMENT_TINT.wind, color: 'wind', count: 40 }],
    },
    beam: {
      layers: [{ module: 'narrowBeam', tint: ELEMENT_TINT.wind, color: 'wind', emission: 60 }],
    },
    storm: {
      layers: [
        { module: 'swirlColumn', tint: 0xccddff, color: 'wind', emission: 88, orbitSpeed: 6 },
        { module: 'swirlRing', tint: 0xaaddff, color: 'wind', emission: 50, orbitSpeed: 7 },
      ],
    },
    wall: {
      layers: [{ module: 'wallRing', tint: 0xbbddff, color: 'wind', emission: 60 }],
    },
  },
  earth: {
    orb: {
      layers: [{ module: 'orbBurst', tint: ELEMENT_TINT.earth, color: 'earth', count: 38 }],
    },
    wall: {
      layers: [
        { module: 'wallRing', tint: ELEMENT_TINT.earth, color: 'earth', emission: 72 },
        { module: 'rockSpray', emission: 35 },
      ],
    },
    burst: {
      layers: [
        { module: 'rockSpray', emission: 48 },
        { module: 'groundPool', tint: 0x887755, color: 'earth', emission: 38 },
      ],
    },
  },
  thunder: {
    orb: {
      layers: [{ module: 'lightningBurst', tint: ELEMENT_TINT.thunder, color: 'thunder', count: 70 }],
    },
    beam: {
      layers: [{ module: 'narrowBeam', tint: ELEMENT_TINT.thunder, color: 'thunder', emission: 55 }],
    },
    burst: {
      layers: [{ module: 'lightningBurst', tint: ELEMENT_TINT.thunder, color: 'thunder', count: 95 }],
    },
    storm: {
      layers: [
        { module: 'lightningBurst', tint: 0xeeffff, color: 'thunder', count: 60 },
        { module: 'swirlRing', tint: 0x8899ff, color: 'thunder', emission: 30, orbitSpeed: 9 },
      ],
    },
  },
};

/** 单元素 + 形态 → 配方；无则回退 JSON/代码预制 */
export function getElementFormRecipe(
  elem: ElementType,
  form: FormType,
): VfxRecipe | null {
  if (form === 'burst') {
    const earthBurst = FORM_RECIPES.earth?.burst;
    if (elem === 'earth' && earthBurst) return earthBurst;
    const thunderBurst = FORM_RECIPES.thunder?.burst;
    if (elem === 'thunder' && thunderBurst) return thunderBurst;
    return null;
  }
  return FORM_RECIPES[elem]?.[form] ?? null;
}

export function getElementFormDuration(elem: ElementType, form: FormType): number {
  const durations: Record<FormType, number> = {
    orb: 1.2,
    burst: 2.5,
    rain: 2.6,
    wall: 2.4,
    beam: 1.5,
    storm: 3.2,
  };
  const base: Record<ElementType, number> = {
    fire: 2.8,
    ice: 3,
    water: 2.5,
    wind: 1.8,
    earth: 2.2,
    thunder: 0.55,
  };
  const recipe = getElementFormRecipe(elem, form);
  if (recipe) return durations[form] ?? base[elem];
  return base[elem];
}
