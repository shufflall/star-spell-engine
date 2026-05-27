import type { MagicVfxRecipe } from './types';
import { defaultMotionForEntity, matchEntity, matchMotion } from './magicKeywords';

/** 咒文关键词 → 覆盖配方（仅当文本里真的出现对应词） */
export function applyTextOverrides(recipe: MagicVfxRecipe, text: string): MagicVfxRecipe {
  const entity = matchEntity(text);
  const motion = matchMotion(text);
  if (!entity && !motion) return recipe;

  const next = { ...recipe };
  if (entity) {
    next.entity = entity;
    next.motion = motion ?? defaultMotionForEntity(entity);
  } else if (motion) {
    next.motion = motion;
  }
  return next;
}

/** 命名法术：只允许后缀改运动，避免「火球」里的字误触实体规则 */
export function applyNamedSpellOverrides(recipe: MagicVfxRecipe, text: string): MagicVfxRecipe {
  const motion = matchMotion(text);
  if (!motion) return recipe;
  return { ...recipe, motion };
}

export function applySemanticToRecipe(recipe: MagicVfxRecipe, text: string): MagicVfxRecipe {
  return applyTextOverrides(recipe, text);
}
