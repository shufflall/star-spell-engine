import { QuarksPrefab } from 'three.quarks';
import { spawnModule } from './modules/VfxModuleRegistry';
import type { VfxRecipe } from './modules/types';

/** 将配方合成为可克隆的 Quarks 预制 */
export function composeVfx(recipe: VfxRecipe): QuarksPrefab {
  const prefab = new QuarksPrefab();
  for (const layer of recipe.layers) {
    prefab.add(spawnModule(layer).emitter);
  }
  return prefab;
}
