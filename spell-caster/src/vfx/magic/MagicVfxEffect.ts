import * as THREE from 'three';
import { QuarksUtil } from 'three.quarks';
import type { Object3D } from 'three';
import type { SpellData } from '../../types';
import { BaseEffect } from '../../effects/BaseEffect';
import { vfxDuration } from '../builders/shared';
import {
  computeFlightDuration,
  getMotionParams,
  usesDeferredCombat,
} from './motionConfig';
import { motionTravelsToTarget, type MagicVfxRecipe, type VfxMotionType } from './types';

const UP = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _right = new THREE.Vector3();
const _target = new THREE.Vector3();

export type ImpactHandler = (position: THREE.Vector3) => void;

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
  private readonly initialScale: number;

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
    super(origin, spellData, vfxDuration(spellData, baseDuration));
    this.instance = instance;
    this.recipe = recipe;
    this.deferCombat = defer;
    this.motion = recipe.motion;
    this.motionParams = getMotionParams(recipe.motion, spellData.potency);
    this.initialScale = instance.scale.x;

    this.origin.copy(origin);
    this.target.copy(target);
    this.travelDir.subVectors(target, origin);
    this.travelDistance = this.travelDir.length();
    if (this.travelDistance < 0.05) {
      this.travelDistance = 0.05;
      this.travelDir.set(0, 0, 1);
    } else {
      this.travelDir.normalize();
    }

    this.flightTime = computeFlightDuration(
      this.travelDistance,
      recipe.motion,
      this.motionParams,
    );

    this.group.add(instance);
    this.placeInitial();
    this.alignBodyFacing();
  }

  private placeInitial(): void {
    switch (this.motion) {
      case 'stationary':
      case 'rotate':
        this.group.position.copy(this.target);
        break;
      case 'fallFromAbove': {
        const dropH =
          Math.max(this.origin.y, this.target.y) + 4 + this.spellData.potency * 0.9;
        this.group.position.set(this.target.x, dropH, this.target.z);
        break;
      }
      default:
        this.group.position.copy(this.origin);
    }
  }

  private alignBodyFacing(): void {
    if (!motionTravelsToTarget(this.motion)) return;
    _dir.copy(this.travelDir);
    if (_dir.lengthSq() < 1e-6) return;
    this.group.quaternion.setFromUnitVectors(UP, _dir);
  }

  update(dt: number): void {
    if (this.dead) return;

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
        this.group.position.copy(this.target);
        this.group.rotation.y += this.motionParams.spinSpeed * dt;
        break;
      case 'stationary':
        this.group.position.copy(this.target);
        break;
      case 'fallFromAbove':
        this.updateFall(dt);
        break;
    }

    if (this.tickLife(dt) && !this.impactFired && this.deferCombat) {
      this.fireImpact(this.target);
    }
  }

  private updateLinear(dt: number): void {
    this.flightT += dt / this.flightTime;
    const t = Math.min(1, this.flightT);
    this.group.position.lerpVectors(this.origin, this.target, t);
    if (t >= 1) this.finishFlight();
  }

  private updateParabolic(dt: number): void {
    this.flightT += dt / this.flightTime;
    const t = Math.min(1, this.flightT);
    _mid.lerpVectors(this.origin, this.target, 0.5);
    const lift = Math.max(
      this.motionParams.arcHeight,
      (this.origin.y - this.target.y) * 0.28 + this.travelDistance * 0.1,
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
    this.group.position.lerpVectors(this.origin, this.target, t);

    _right.crossVectors(this.travelDir, UP);
    if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
    _right.normalize();
    const wave = Math.sin(t * Math.PI) * this.motionParams.curveAmplitude;
    this.group.position.addScaledVector(_right, wave);

    if (t >= 1) this.finishFlight();
  }

  private updateFall(dt: number): void {
    const speed = this.motionParams.speed;
    this.group.position.y -= speed * dt;
    if (this.group.position.y <= this.target.y + 0.05) {
      this.group.position.y = this.target.y;
      this.finishFlight();
    }
  }

  private finishFlight(): void {
    this.group.position.copy(this.target);
    this.fireImpact(this.target);
    this.dead = true;
  }

  private fireImpact(at: THREE.Vector3): void {
    if (this.impactFired) return;
    this.impactFired = true;
    _target.copy(at);
    this.onImpact?.(_target);
  }

  dispose(): void {
    this.instance.scale.setScalar(this.initialScale);
    QuarksUtil.stop(this.instance);
    this.group.remove(this.instance);
    this.instance.traverse((child) => {
      const obj = child as { dispose?: () => void };
      obj.dispose?.();
    });
  }
}
