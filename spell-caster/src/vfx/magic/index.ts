export type { MagicVfxRecipe, VfxEntityType, VfxMotionType } from './types';
export { ENTITY_LABELS, MOTION_LABELS, motionTravelsToTarget } from './types';
export { parseMagicLanguage } from './parseMagicLanguage';
export {
  ELEMENT_DEFAULT_RECIPE,
  NAMED_SPELLS,
  buildSingleElementMatrix,
  SINGLE_ELEMENT_MATRIX_SIZE,
} from './elementCatalog';
export { composeMagicVfx } from './MagicVfxComposer';
export { composeImpactBurst } from './buildMagicImpact';
export { MagicVfxEffect } from './MagicVfxEffect';
export {
  formatMagicLabel,
  resolveMagicRecipe,
  shouldUseMagicPipeline,
} from './resolveMagic';
