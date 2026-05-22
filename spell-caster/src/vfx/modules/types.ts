/** 颜色渐变预设（对应 shared.ts 中的 ColorOverLife 工厂） */
export type ColorPreset = 'fire' | 'ice' | 'water' | 'wind' | 'earth' | 'thunder';

/** 可组装的粒子模块 ID */
export type VfxModuleId =
  | 'swirlColumn'
  | 'swirlRing'
  | 'lightningBurst'
  | 'groundPool'
  | 'steamCloud'
  | 'lavaFountain'
  | 'rockSpray'
  | 'emberBurst'
  | 'blizzard'
  | 'orbBurst'
  | 'narrowBeam'
  | 'rainFall'
  | 'wallRing';

export interface SwirlColumnParams {
  module: 'swirlColumn';
  tint: number;
  color: ColorPreset;
  radius?: number;
  emission?: number;
  orbitSpeed?: number;
  height?: number;
}

export interface SwirlRingParams {
  module: 'swirlRing';
  tint: number;
  color: ColorPreset;
  emission?: number;
  orbitSpeed?: number;
}

export interface LightningBurstParams {
  module: 'lightningBurst';
  tint: number;
  color: ColorPreset;
  count?: number;
}

export interface GroundPoolParams {
  module: 'groundPool';
  tint: number;
  color: ColorPreset;
  radius?: number;
  emission?: number;
}

export interface SteamCloudParams {
  module: 'steamCloud';
  emission?: number;
}

export interface LavaFountainParams {
  module: 'lavaFountain';
  tint: number;
  color: ColorPreset;
}

export interface RockSprayParams {
  module: 'rockSpray';
  emission?: number;
}

export interface EmberBurstParams {
  module: 'emberBurst';
  tint?: number;
  color?: ColorPreset;
  emission?: number;
}

export interface BlizzardParams {
  module: 'blizzard';
  emission?: number;
  radius?: number;
}

export interface OrbBurstParams {
  module: 'orbBurst';
  tint: number;
  color: ColorPreset;
  count?: number;
}

export interface NarrowBeamParams {
  module: 'narrowBeam';
  tint: number;
  color: ColorPreset;
  emission?: number;
}

export interface RainFallParams {
  module: 'rainFall';
  tint: number;
  color: ColorPreset;
  emission?: number;
}

export interface WallRingParams {
  module: 'wallRing';
  tint: number;
  color: ColorPreset;
  emission?: number;
}

export type VfxLayer =
  | SwirlColumnParams
  | SwirlRingParams
  | LightningBurstParams
  | GroundPoolParams
  | SteamCloudParams
  | LavaFountainParams
  | RockSprayParams
  | EmberBurstParams
  | BlizzardParams
  | OrbBurstParams
  | NarrowBeamParams
  | RainFallParams
  | WallRingParams;

/** 运行时粒子配方：按层叠放模块 */
export interface VfxRecipe {
  layers: VfxLayer[];
}
