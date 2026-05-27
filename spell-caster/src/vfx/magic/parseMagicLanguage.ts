import type { ElementType } from '../../types';
import { ELEMENT_DEFAULT_RECIPE, NAMED_SPELLS } from './elementCatalog';
import {
  applyNamedSpellOverrides,
  applySemanticToRecipe,
  applyTextOverrides,
} from './spellSemantics';
import { matchEntity, matchMotion } from './magicKeywords';
import {
  ENTITY_LABELS,
  MOTION_LABELS,
  type MagicVfxRecipe,
  type VfxEntityType,
} from './types';

export { matchEntity, matchMotion } from './magicKeywords';

const ELEMENT_LABEL: Record<ElementType, string> = {
  fire: '火',
  water: '水',
  ice: '冰',
  wind: '风',
  earth: '土',
  thunder: '雷',
};

function buildLabel(recipe: MagicVfxRecipe): string {
  return `${ELEMENT_LABEL[recipe.element]}·${ENTITY_LABELS[recipe.entity]}·${MOTION_LABELS[recipe.motion]}`;
}

function withLabel(recipe: MagicVfxRecipe): MagicVfxRecipe {
  return { ...recipe, label: buildLabel(recipe) };
}

function resolveFromKeywords(
  text: string,
  element: ElementType,
): MagicVfxRecipe | null {
  const explicitEntity = matchEntity(text);
  const explicitMotion = matchMotion(text);
  if (!explicitEntity && !explicitMotion) return null;

  let recipe: MagicVfxRecipe = { ...ELEMENT_DEFAULT_RECIPE[element] };
  recipe = applyTextOverrides(recipe, text);

  if (explicitMotion === 'rotate' && !explicitEntity) {
    const ent: VfxEntityType =
      element === 'wind' || element === 'earth' ? 'column' : 'ring';
    recipe = { ...recipe, entity: ent, motion: explicitMotion };
  } else if (explicitMotion === 'fallFromAbove' && !explicitEntity) {
    const ent: VfxEntityType =
      element === 'water' || element === 'ice' ? 'fluid' : 'cloud';
    recipe = { ...recipe, entity: ent, motion: explicitMotion };
  } else if (explicitMotion === 'stationary' && !explicitEntity) {
    const ent: VfxEntityType = element === 'earth' ? 'disk' : 'cloud';
    recipe = { ...recipe, entity: ent, motion: explicitMotion };
  }

  return withLabel(recipe);
}

/**
 * 从咒语解析三元组：命名法术 > 咒文关键词 > 元素默认
 * 注意：Worker 的 form 只影响伤害/半径，不覆盖视觉（避免默认 form=burst 误伤全部咒语）
 */
export function parseMagicLanguage(text: string, element: ElementType): MagicVfxRecipe {
  const trimmed = text.trim();

  for (const { pattern, recipe } of NAMED_SPELLS) {
    if (pattern.test(trimmed) && recipe.element === element) {
      const out = applySemanticToRecipe({ ...recipe }, trimmed);
      return withLabel(applyNamedSpellOverrides(out, trimmed));
    }
  }

  const fromKeywords = resolveFromKeywords(trimmed, element);
  if (fromKeywords) {
    return fromKeywords;
  }

  let recipe: MagicVfxRecipe = { ...ELEMENT_DEFAULT_RECIPE[element] };
  recipe = applySemanticToRecipe(recipe, trimmed);
  return withLabel(recipe);
}
