import * as THREE from 'three';
import { QuarksUtil } from 'three.quarks';
import type { Object3D } from 'three';
import type { SpellData } from '../../types';
import { BaseEffect } from '../../effects/BaseEffect';
import { vfxDuration } from '../builders/shared';
import {
  computeEffectDuration,
  computeFallDuration,
  computeFlightDuration,
  getMotionParams,
  usesDeferredCombat,
} from './motionConfig';
import {
  motionTravelsToTarget,
  motionUsesParticleVortex,
  motionUsesRainEmitter,
  type MagicVfxRecipe,
  type VfxMotionType,
} from './types';

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);
/** Quarks ConeEmitter 粒子沿局部 +Z 飞出（见 quarks.core ConeEmitter.initialize） */
const EMIT_FORWARD = new THREE.Vector3(0, 0, 1);
const _dir = new THREE.Vector3();
const _initialScale = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _right = new THREE.Vector3();
const _target = new THREE.Vector3();

export type ImpactHandler = (position: THREE.Vector3) => void;

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * 魔法特效：从施法起点 (origin) 按运动配方飞向目标落点 (target)
 */
export class MagicVfxEffect extends BaseEffect {
  private readonly instance: Object3D;
  private readonly motion: VfxMotionType;
  private readonly motionParams: ReturnType<typeof getMotionParams>;
  private readonly origin = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private readonly travelDir = new THREE.Vector3();
  private travelDistance = 1;
  private flightTime = 1;
  private flightT = 0;
  private impactFired = false;
  private flightComplete = false;
  private readonly initialScale: number;
  private readonly isBeamStrike: boolean;
  private readonly dropHeight: number;

  onImpact: ImpactHandler | null = null;

  readonly recipe: MagicVfxRecipe;
  readonly deferCombat: boolean;

  constructor(
    origin: THREE.Vector3,
    target: THREE.Vector3,
    spellData: SpellData,
    instance: Object3D,
    recipe: MagicVfxRecipe,
    baseDuration: number,
  ) {
    const defer = usesDeferredCombat(recipe.motion);
    const motionParams = getMotionParams(recipe.motion, spellData.potency);

    const originCopy = origin.clone();
    const targetCopy = target.clone();
    const travelDir = new THREE.Vector3().subVectors(targetCopy, originCopy);
    let travelDistance = travelDir.length();
    if (travelDistance < 0.05) {
      travelDistance = 0.05;
      travelDir.set(0, 0, 1);
    } else {
      travelDir.normalize();
    }

    let flightTime: number;
    if (recipe.motion === 'fallFromAbove') {
      flightTime = computeFallDuration(
        originCopy.y,
        targetCopy.y,
        spellData.potency,
        motionParams,
      );
    } else {
      flightTime = computeFlightDuration(travelDistance, recipe.motion, motionParams);
    }

    const effectDuration = computeEffectDuration(
      recipe.motion,
      spellData.potency,
      flightTime,
    );
    const maxLife = Math.max(vfxDuration(spellData, baseDuration), effectDuration);

    super(originCopy, spellData, maxLife);

    this.instance = instance;
    this.recipe = recipe;
    this.deferCombat = defer;
    this.motion = recipe.motion;
    this.motionParams = motionParams;
    this.isBeamStrike = recipe.entity === 'beam';
    _initialScale.copy(instance.scale);
    this.initialScale = instance.scale.x;
    this.flightTime = flightTime;
    this.dropHeight =
      recipe.motion === 'fallFromAbove'
        ? Math.max(originCopy.y, targetCopy.y) + 5 + spellData.potency
        : 0;

    this.origin.copy(originCopy);
    this.target.copy(targetCopy);
    this.travelDir.copy(travelDir);
    this.travelDistance = travelDistance;

    this.group.add(instance);
    this.placeInitial();
    this.alignBodyFacing();
  }

  private placeInitial(): void {
    if (this.isBeamStrike) {
      this.group.position.copy(this.origin);
      return;
    }
    switch (this.motion) {
      case 'stationary':
      case 'rotate':
        this.group.position.copy(this.target);
        break;
      case 'fallFromAbove':
        this.group.position.set(this.target.x, this.dropHeight, this.target.z);
        break;
      default:
        this.group.position.copy(this.origin);
    }
  }

  private alignBodyFacing(): void {
    if (motionUsesRainEmitter(this.recipe)) {
      this.group.quaternion.setFromUnitVectors(EMIT_FORWARD, DOWN);
      return;
    }

    const needsAlign =
      motionTravelsToTarget(this.motion) || this.isBeamStrike;
    if (!needsAlign) return;
    _dir.copy(this.travelDir);
    if (_dir.lengthSq() < 1e-6) return;

    const axis = this.usesConeEmitterAxis() ? EMIT_FORWARD : UP;
    this.group.quaternion.setFromUnitVectors(axis, _dir);

    if (this.isBeamStrike) {
      this.applyBeamLengthScale();
    }
  }

  /** 锥/柱/束使用 ConeEmitter，发射轴为 +Z */
  private usesConeEmitterAxis(): boolean {
    const e = this.recipe.entity;
    return e === 'beam' || e === 'cone' || e === 'column';
  }

  /** 沿施法方向拉长粒子体积，使束状从起点铺到终点 */
  private applyBeamLengthScale(): void {
    const along = Math.max(0.8, this.travelDistance * 0.48);
    this.instance.scale.set(
      _initialScale.x,
      _initialScale.y,
      _initialScale.z * along,
    );
  }

  private restoreInstanceScale(): void {
    this.instance.scale.copy(_initialScale);
  }

  update(dt: number): void {
    if (this.dead) return;

    if (!this.flightComplete) {
      if (this.isBeamStrike) {
        this.updateBeamStrike(dt);
      } else {
      switch (this.motion) {
        case 'linear':
          this.updateLinear(dt);
          break;
        case 'parabolic':
          this.updateParabolic(dt);
          break;
        case 'curve':
          this.updateCurve(dt);
          break;
        case 'rotate':
          this.updateRotate(dt);
          break;
        case 'stationary':
          this.updateStationary(dt);
          break;
        case 'fallFromAbove':
          this.updateFall(dt);
          break;
      }
      }
    }

    if (this.tickLife(dt) && !this.impactFired && this.deferCombat && !this.flightComplete) {
      this.fireImpact(this.target);
    }
  }

  /** 束状：固定在起点，沿 +Z（已对齐到目标）铺满射线，计时后命中 */
  private updateBeamStrike(dt: number): void {
    this.flightT += dt / this.flightTime;
    if (this.flightT >= 1) this.finishFlight();
  }

  private updateLinear(dt: number): void {
    this.flightT += dt / this.flightTime;
    const t = smoothstep(Math.min(1, this.flightT));
    this.group.position.lerpVectors(this.origin, this.target, t);
    if (this.flightT >= 1) this.finishFlight();
  }

  private updateParabolic(dt: number): void {
    this.flightT += dt / this.flightTime;
    const t = Math.min(1, this.flightT);
    _mid.lerpVectors(this.origin, this.target, 0.5);
    const lift = Math.max(
      this.motionParams.arcHeight,
      (this.origin.y - this.target.y) * 0.28 + this.travelDistance * 0.12,
    );
    _mid.y += lift;

    _pos.x = (1 - t) * (1 - t) * this.origin.x + 2 * (1 - t) * t * _mid.x + t * t * this.target.x;
    _pos.y = (1 - t) * (1 - t) * this.origin.y + 2 * (1 - t) * t * _mid.y + t * t * this.target.y;
    _pos.z = (1 - t) * (1 - t) * this.origin.z + 2 * (1 - t) * t * _mid.z + t * t * this.target.z;
    this.group.position.copy(_pos);

    if (t >= 1) this.finishFlight();
  }

  private updateCurve(dt: number): void {
    this.flightT += dt / this.flightTime;
    const t = Math.min(1, this.flightT);
    const eased = smoothstep(t);
    this.group.position.lerpVectors(this.origin, this.target, eased);

    _right.crossVectors(this.travelDir, UP);
    if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
    _right.normalize();
    const wave = Math.sin(t * Math.PI) * this.motionParams.curveAmplitude;
    this.group.position.addScaledVector(_right, wave);
    this.group.position.y +=
      Math.sin(t * Math.PI * 2) * this.motionParams.arcHeight * 0.35;

    if (t >= 1) this.finishFlight();
  }

  private updateRotate(dt: number): void {
    this.group.position.copy(this.target);
    void dt;
    if (!motionUsesParticleVortex(this.recipe)) {
      this.group.rotation.y += this.motionParams.spinSpeed * dt;
    }
    const pulse = motionUsesParticleVortex(this.recipe)
      ? 1 + 0.05 * Math.sin(this.life * 3.5)
      : 1 + 0.1 * Math.sin(this.life * 9);
    if (motionUsesParticleVortex(this.recipe)) {
      this.instance.scale.set(
        _initialScale.x * pulse,
        _initialScale.y * pulse,
        _initialScale.z * pulse,
      );
    } else {
      this.instance.scale.setScalar(this.initialScale * pulse);
    }
  }

  private updateStationary(dt: number): void {
    this.group.position.copy(this.target);
    const breathe = 1 + 0.06 * Math.sin(this.life * 5);
    this.instance.scale.setScalar(this.initialScale * breathe);
    void dt;
  }

  private updateFall(dt: number): void {
    const accel = 1.12;
    this.flightT += dt;
    const t = Math.min(1, this.flightT / this.flightTime);
    const eased = t * t * accel / (accel + t * (t - 1));
    const y = this.dropHeight + (this.target.y - this.dropHeight) * eased;
    this.group.position.set(this.target.x, y, this.target.z);

    if (t >= 1) this.finishFlight();
  }

  private finishFlight(): void {
    if (this.flightComplete) return;
    this.flightComplete = true;
    if (!this.isBeamStrike) {
      this.group.position.copy(this.target);
    }
    this.restoreInstanceScale();
    this.fireImpact(this.target);
  }

  private fireImpact(at: THREE.Vector3): void {
    if (this.impactFired) return;
    this.impactFired = true;
    _target.copy(at);
    this.onImpact?.(_target);
  }

  dispose(): void {
    this.restoreInstanceScale();
    QuarksUtil.stop(this.instance);
    this.group.remove(this.instance);
    this.instance.traverse((child) => {
      const obj = child as { dispose?: () => void };
      obj.dispose?.();
    });
  }
}
