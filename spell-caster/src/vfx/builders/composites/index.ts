import type { ReactionId } from '../../reactions/ReactionTable';
import type { QuarksPrefab } from 'three.quarks';
import { composeVfx } from '../../VfxComposer';
import { REACTION_RECIPES } from '../../recipes/reactionRecipes';

/** 由配方合成；供 vfx:export 与旧引用兼容 */
export const COMPOSITE_BUILDERS: Record<ReactionId, () => QuarksPrefab> = Object.fromEntries(
  (Object.keys(REACTION_RECIPES) as ReactionId[]).map((id) => [
    id,
    () => composeVfx(REACTION_RECIPES[id]),
  ]),
) as Record<ReactionId, () => QuarksPrefab>;

/** 复合特效 JSON 备份路径（运行时以代码配方为准） */
export const COMPOSITE_JSON_PATHS: Partial<Record<ReactionId, string>> = {
  'fire+wind': '/vfx/reactions/fire-wind.json',
  'water+wind': '/vfx/reactions/water-wind.json',
  'water+thunder': '/vfx/reactions/water-thunder.json',
  'fire+ice': '/vfx/reactions/fire-ice.json',
  'water+ice': '/vfx/reactions/water-ice.json',
  'fire+earth': '/vfx/reactions/fire-earth.json',
  'fire+water': '/vfx/reactions/fire-water.json',
  'ice+wind': '/vfx/reactions/ice-wind.json',
  'earth+thunder': '/vfx/reactions/earth-thunder.json',
  'fire+wind+thunder': '/vfx/reactions/fire-wind-thunder.json',
  'fire+thunder': '/vfx/reactions/fire-thunder.json',
  'water+earth': '/vfx/reactions/water-earth.json',
  'earth+wind': '/vfx/reactions/earth-wind.json',
  'earth+ice': '/vfx/reactions/earth-ice.json',
  'ice+thunder': '/vfx/reactions/ice-thunder.json',
  'wind+thunder': '/vfx/reactions/wind-thunder.json',
};
