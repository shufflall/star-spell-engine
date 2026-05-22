import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export type CameraMode = 'orbit' | 'firstPerson';

const CAST_NDC_CENTER = new THREE.Vector2(0, 0);
/** 鸟瞰模式固定施法落点（场地中心） */
export const ORBIT_CAST_CENTER = new THREE.Vector3(0, 0, 0);
/** 鸟瞰模式固定施法起点（南侧高空，俯射向场地中心） */
export const ORBIT_CAST_ORIGIN = new THREE.Vector3(0, 9.5, -16);
const CAST_MAX_DIST = 48;
const FP_EYE_HEIGHT = 1.65;
const FP_MOVE_SPEED = 14;

export interface CameraController {
  readonly mode: CameraMode;
  update(dt: number): void;
  getCastRay(raycaster: THREE.Raycaster, camera: THREE.PerspectiveCamera): void;
  resolveCastPoint(
    raycaster: THREE.Raycaster,
    ground: THREE.Object3D,
    fallback: THREE.Vector3,
    out?: THREE.Vector3,
  ): THREE.Vector3;
  onResize(): void;
  setInputCaptured(byUi: boolean): void;
  dispose(): void;
}

function applyCastRay(
  raycaster: THREE.Raycaster,
  camera: THREE.PerspectiveCamera,
  ndc: THREE.Vector2,
): void {
  raycaster.setFromCamera(ndc, camera);
}

function resolveGroundHit(
  raycaster: THREE.Raycaster,
  ground: THREE.Object3D,
  fallback: THREE.Vector3,
  out = new THREE.Vector3(),
): THREE.Vector3 {
  const hits = raycaster.intersectObject(ground, false);
  if (hits.length > 0 && hits[0].point) {
    return out.copy(hits[0].point);
  }

  const ray = raycaster.ray;
  if (Math.abs(ray.direction.y) > 1e-5) {
    const t = -ray.origin.y / ray.direction.y;
    if (t > 0 && t < CAST_MAX_DIST) {
      return ray.at(t, out);
    }
  }

  return out.copy(fallback);
}

export class OrbitCameraController implements CameraController {
  readonly mode: CameraMode = 'orbit';
  readonly controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.target.copy(ORBIT_CAST_CENTER);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 28;
  }

  update(_dt: number): void {
    this.controls.update();
  }

  /** 屏幕中心射线，用于弹道朝向场地中心 */
  getCastRay(raycaster: THREE.Raycaster, camera: THREE.PerspectiveCamera): void {
    applyCastRay(raycaster, camera, CAST_NDC_CENTER);
  }

  /** 鸟瞰施法落点固定为场地中心，不随鼠标移动 */
  resolveCastPoint(
    _raycaster: THREE.Raycaster,
    _ground: THREE.Object3D,
    _fallback: THREE.Vector3,
    out = new THREE.Vector3(),
  ): THREE.Vector3 {
    return out.copy(ORBIT_CAST_CENTER);
  }

  onResize(): void {
    this.controls.update();
  }

  setInputCaptured(byUi: boolean): void {
    this.controls.enabled = !byUi;
  }

  dispose(): void {
    this.controls.dispose();
  }
}

export class FirstPersonCameraController implements CameraController {
  readonly mode: CameraMode = 'firstPerson';
  readonly controls: PointerLockControls;
  private readonly keys = { w: false, a: false, s: false, d: false };
  private uiCapturing = false;
  private readonly moveDir = new THREE.Vector3();
  private onLockChange?: (locked: boolean) => void;

  constructor(
    camera: THREE.PerspectiveCamera,
    canvas: HTMLElement,
    onLockChange?: (locked: boolean) => void,
  ) {
    this.onLockChange = onLockChange;
    camera.position.set(0, FP_EYE_HEIGHT, 10);
    camera.rotation.set(0, 0, 0);

    this.controls = new PointerLockControls(camera, canvas);

    this.controls.addEventListener('lock', () => this.onLockChange?.(true));
    this.controls.addEventListener('unlock', () => this.onLockChange?.(false));

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.uiCapturing) return;
    switch (e.code) {
      case 'KeyW':
        this.keys.w = true;
        break;
      case 'KeyA':
        this.keys.a = true;
        break;
      case 'KeyS':
        this.keys.s = true;
        break;
      case 'KeyD':
        this.keys.d = true;
        break;
      default:
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'KeyW':
        this.keys.w = false;
        break;
      case 'KeyA':
        this.keys.a = false;
        break;
      case 'KeyS':
        this.keys.s = false;
        break;
      case 'KeyD':
        this.keys.d = false;
        break;
      default:
        break;
    }
  };

  requestPointerLock(): void {
    if (!this.uiCapturing) {
      this.controls.lock();
    }
  }

  get isLocked(): boolean {
    return this.controls.isLocked;
  }

  update(dt: number): void {
    if (!this.controls.isLocked || this.uiCapturing) return;

    this.moveDir.set(0, 0, 0);
    if (this.keys.w) this.moveDir.z -= 1;
    if (this.keys.s) this.moveDir.z += 1;
    if (this.keys.a) this.moveDir.x -= 1;
    if (this.keys.d) this.moveDir.x += 1;

    if (this.moveDir.lengthSq() > 0) {
      this.moveDir.normalize();
      const dist = FP_MOVE_SPEED * dt;
      this.controls.moveForward(-this.moveDir.z * dist);
      this.controls.moveRight(this.moveDir.x * dist);
    }

    this.controls.object.position.y = FP_EYE_HEIGHT;
  }

  getCastRay(raycaster: THREE.Raycaster, camera: THREE.PerspectiveCamera): void {
    applyCastRay(raycaster, camera, CAST_NDC_CENTER);
  }

  resolveCastPoint(
    raycaster: THREE.Raycaster,
    ground: THREE.Object3D,
    fallback: THREE.Vector3,
    out?: THREE.Vector3,
  ): THREE.Vector3 {
    return resolveGroundHit(raycaster, ground, fallback, out);
  }

  onResize(): void {
    /* PointerLock 使用相机宽高比即可 */
  }

  setInputCaptured(byUi: boolean): void {
    this.uiCapturing = byUi;
    if (byUi && this.controls.isLocked) {
      this.controls.unlock();
    }
  }

  dispose(): void {
    this.controls.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
