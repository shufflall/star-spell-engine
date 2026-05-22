import { QuarksPrefab } from 'three.quarks';
import type { SpellData } from '../../types';
import { buildMagicBody } from './buildMagicBody';
import { getMotionParams, usesDeferredCombat } from './motionConfig';
import type { MagicVfxRecipe } from './types';

export interface ComposedMagicVfx {
  prefab: QuarksPrefab;
  duration: number;
  deferCombat: boolean;
  recipe: MagicVfxRecipe;
}

export function composeMagicVfx(
  recipe: MagicVfxRecipe,
  spell: SpellData,
): ComposedMagicVfx {
  const prefab = new QuarksPrefab();
  const systems = buildMagicBody(recipe, spell);

  for (const ps of systems) {
    prefab.add(ps.emitter);
  }

  const motion = getMotionParams(recipe.motion, spell.potency);

  return {
    prefab,
    duration: motion.baseDuration,
    deferCombat: usesDeferredCombat(recipe.motion),
    recipe,
  };
}
