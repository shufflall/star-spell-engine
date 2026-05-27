import type { ConstantColor } from 'quarks.core';
import type { ElementType } from '../../types';
import { quarkColor } from '../builders/shared';
import { ELEMENT_STYLES } from './elementStyle';

export function rgbFromTint(tint: number): [number, number, number] {
  return [((tint >> 16) & 255) / 255, ((tint >> 8) & 255) / 255, (tint & 255) / 255];
}

/** 粒子起始色：贴近元素色调，避免发白 */
export function tintStartColor(tint: number, bright = 1.15, alpha = 0.92): ConstantColor {
  const [r, g, b] = rgbFromTint(tint);
  return quarkColor(
    Math.min(1, r * bright),
    Math.min(1, g * bright),
    Math.min(1, b * bright),
    alpha,
  );
}

export function elementStartColor(element: ElementType, bright = 1.15, alpha = 0.92): ConstantColor {
  return tintStartColor(ELEMENT_STYLES[element].tint, bright, alpha);
}

export function elementCoreColor(element: ElementType, alpha = 1): ConstantColor {
  return elementStartColor(element, 1.45, alpha);
}
