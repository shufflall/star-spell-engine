import type { ReactionId } from '../reactions/ReactionTable';
import type { VfxRecipe } from '../modules/types';

/** 元素反应 → 粒子层配方（运行时组装） */
export const REACTION_RECIPES: Record<ReactionId, VfxRecipe> = {
  'fire+wind': {
    layers: [
      { module: 'swirlColumn', tint: 0xff4400, color: 'fire', emission: 110, orbitSpeed: 4.5 },
      { module: 'swirlRing', tint: 0xffaa44, color: 'fire', emission: 60, orbitSpeed: 6.5 },
    ],
  },
  'water+wind': {
    layers: [
      { module: 'swirlColumn', tint: 0x2288ff, color: 'water', radius: 0.6, emission: 105, orbitSpeed: 5.5 },
      { module: 'swirlRing', tint: 0x66ccff, color: 'water', emission: 65, orbitSpeed: 7 },
      { module: 'groundPool', tint: 0x1155aa, color: 'water', radius: 1, emission: 45 },
    ],
  },
  'water+thunder': {
    layers: [
      { module: 'lightningBurst', tint: 0xccffff, color: 'thunder', count: 100 },
      { module: 'groundPool', tint: 0x2266ff, color: 'water', radius: 0.9, emission: 55 },
      { module: 'swirlRing', tint: 0x88bbff, color: 'water', emission: 35, orbitSpeed: 4 },
    ],
  },
  'fire+ice': {
    layers: [
      { module: 'steamCloud', emission: 90 },
      { module: 'emberBurst', tint: 0xff6622, color: 'fire', emission: 45 },
    ],
  },
  'water+ice': {
    layers: [{ module: 'blizzard', emission: 120, radius: 1.6 }],
  },
  'fire+earth': {
    layers: [
      { module: 'lavaFountain', tint: 0xff4400, color: 'fire' },
      { module: 'rockSpray', emission: 50 },
    ],
  },
  'fire+water': {
    layers: [
      { module: 'steamCloud', emission: 100 },
      { module: 'lavaFountain', tint: 0xff5522, color: 'fire' },
    ],
  },
  'ice+wind': {
    layers: [
      { module: 'swirlColumn', tint: 0xaaddff, color: 'ice', emission: 95, orbitSpeed: 5 },
      { module: 'swirlRing', tint: 0xddffff, color: 'ice', emission: 50, orbitSpeed: 6 },
    ],
  },
  'earth+thunder': {
    layers: [
      { module: 'lightningBurst', tint: 0xffeeaa, color: 'thunder', count: 90 },
      { module: 'rockSpray', emission: 55 },
      { module: 'groundPool', tint: 0x887755, color: 'earth', radius: 0.75, emission: 40 },
    ],
  },
  'fire+wind+thunder': {
    layers: [
      { module: 'swirlColumn', tint: 0xff4400, color: 'fire', emission: 115, orbitSpeed: 5 },
      { module: 'swirlRing', tint: 0xffaa55, color: 'fire', emission: 65, orbitSpeed: 7 },
      { module: 'lightningBurst', tint: 0xeeffff, color: 'thunder', count: 50 },
    ],
  },
  'fire+thunder': {
    layers: [
      { module: 'lightningBurst', tint: 0xffcc88, color: 'thunder', count: 85 },
      { module: 'emberBurst', tint: 0xff4400, color: 'fire', emission: 55 },
      { module: 'orbBurst', tint: 0xff6622, color: 'fire', count: 40 },
    ],
  },
  'water+earth': {
    layers: [
      { module: 'groundPool', tint: 0x2266cc, color: 'water', radius: 1.1, emission: 60 },
      { module: 'rockSpray', emission: 45 },
      { module: 'rainFall', tint: 0x4488aa, color: 'water', emission: 50 },
    ],
  },
  'earth+wind': {
    layers: [
      { module: 'swirlColumn', tint: 0x998877, color: 'earth', emission: 85, orbitSpeed: 4 },
      { module: 'rockSpray', emission: 50 },
      { module: 'swirlRing', tint: 0xccbb99, color: 'wind', emission: 40, orbitSpeed: 5.5 },
    ],
  },
  'earth+ice': {
    layers: [
      { module: 'blizzard', emission: 70, radius: 1.1 },
      { module: 'groundPool', tint: 0xaaccff, color: 'ice', radius: 0.8, emission: 35 },
    ],
  },
  'ice+thunder': {
    layers: [
      { module: 'lightningBurst', tint: 0xddffff, color: 'thunder', count: 75 },
      { module: 'blizzard', emission: 45, radius: 0.7 },
      { module: 'orbBurst', tint: 0x88ccff, color: 'ice', count: 35 },
    ],
  },
  'wind+thunder': {
    layers: [
      { module: 'lightningBurst', tint: 0xeeffff, color: 'thunder', count: 70 },
      { module: 'narrowBeam', tint: 0xaaddff, color: 'wind', emission: 55 },
      { module: 'swirlRing', tint: 0xccddff, color: 'wind', emission: 45, orbitSpeed: 8 },
    ],
  },
};
