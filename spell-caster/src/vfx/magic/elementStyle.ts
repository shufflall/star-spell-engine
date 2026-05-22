import type { ElementType } from '../../types';
import type { ColorPreset } from '../modules/types';
import {
  fireColorOverLife,
  iceColorOverLife,
  waterColorOverLife,
  windColorOverLife,
  earthColorOverLife,
  thunderColorOverLife,
} from '../builders/shared';
import type { ColorOverLife } from 'quarks.core';

export interface ElementStyle {
  preset: ColorPreset;
  tint: number;
  additive: boolean;
  colorLife: () => ColorOverLife;
}

export const ELEMENT_STYLES: Record<ElementType, ElementStyle> = {
  fire: { preset: 'fire', tint: 0xff6622, additive: true, colorLife: fireColorOverLife },
  ice: { preset: 'ice', tint: 0xaaddff, additive: false, colorLife: iceColorOverLife },
  water: { preset: 'water', tint: 0x55aaff, additive: false, colorLife: waterColorOverLife },
  wind: { preset: 'wind', tint: 0xaaddff, additive: true, colorLife: windColorOverLife },
  earth: { preset: 'earth', tint: 0x8a7355, additive: false, colorLife: earthColorOverLife },
  thunder: { preset: 'thunder', tint: 0xeeffff, additive: true, colorLife: thunderColorOverLife },
};
