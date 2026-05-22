import type { ElementType } from '../../types';
import type { QuarksPrefab } from 'three.quarks';
import { createFirePrefab } from './fire';
import { createIcePrefab } from './ice';
import { createWaterPrefab } from './water';
import { createWindPrefab } from './wind';
import { createEarthPrefab } from './earth';
import { createThunderPrefab } from './thunder';

export const VFX_JSON_PATHS: Record<ElementType, string> = {
  fire: '/vfx/fire.json',
  ice: '/vfx/ice.json',
  water: '/vfx/water.json',
  wind: '/vfx/wind.json',
  earth: '/vfx/earth.json',
  thunder: '/vfx/thunder.json',
};

export const ELEMENT_BUILDERS: Record<ElementType, () => QuarksPrefab> = {
  fire: createFirePrefab,
  ice: createIcePrefab,
  water: createWaterPrefab,
  wind: createWindPrefab,
  earth: createEarthPrefab,
  thunder: createThunderPrefab,
};
