import type { SpellData } from '../../types';
import { parseMagicLanguage } from './parseMagicLanguage';
import { ENTITY_LABELS, MOTION_LABELS, type MagicVfxRecipe } from './types';

const ELEMENT_LABEL: Record<string, string> = {
  fire: '火',
  water: '水',
  ice: '冰',
  wind: '风',
  earth: '土',
  thunder: '雷',
};

export function resolveMagicRecipe(spell: SpellData, castText = ''): MagicVfxRecipe | null {
  if (spell.magic) return spell.magic;
  if (spell.elems.length !== 1) return null;
  return parseMagicLanguage(castText, spell.elems[0]);
}

export function formatMagicLabel(recipe: MagicVfxRecipe): string {
  return (
    recipe.label ??
    `${ELEMENT_LABEL[recipe.element] ?? recipe.element}·${ENTITY_LABELS[recipe.entity]}·${MOTION_LABELS[recipe.motion]}`
  );
}

export function shouldUseMagicPipeline(spell: SpellData, hasReaction: boolean): boolean {
  if (hasReaction) return false;
  if (spell.magic) return true;
  return spell.elems.length === 1;
}
