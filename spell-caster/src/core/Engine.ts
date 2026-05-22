import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BatchedRenderer } from 'three.quarks';
import type { BaseEffect } from '../effects/BaseEffect';
import { VfxLibrary } from '../vfx/VfxLibrary';
import {
  type CameraMode,
  type CameraController,
  OrbitCameraController,
  FirstPersonCameraController,
  ORBIT_CAST_CENTER,
  ORBIT_CAST_ORIGIN,
} from './CameraController';

export class Engine {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly ground: THREE.Mesh;
  /** 鸟瞰模式下标示固定施法起点 */
  readonly orbitCastMarker: THREE.Group;
  readonly composer: EffectComposer;
  readonly batchRenderer: BatchedRenderer;

  private readonly canvas: HTMLCanvasElement;
  private orbitController: OrbitCameraController;
  private fpController: FirstPersonCameraController;
  private activeController: CameraController;
  private effects: BaseEffect[] = [];
  private readonly raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();
  private readonly castFallback = new THREE.Vector3(0, 0, 0);
  private readonly _castAim = new THREE.Vector3();
  private readonly _castOrigin = new THREE.Vector3();
  private animationId = 0;
  private onCameraModeChange?: (mode: CameraMode, locked: boolean) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a12);
    this.scene.fog = new THREE.Fog(0x0a0a12, 12, 55);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    );
    this.camera.position.set(6, 7, 10);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffeedd, 1.1);
    dir.position.set(8, 14, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    this.scene.add(dir);

    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a35,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    const grid = new THREE.GridHelper(40, 40, 0x444466, 0x222233);
    grid.position.y = 0.01;
    this.scene.add(grid);

    this.orbitController = new OrbitCameraController(this.camera, canvas);
    this.fpController = new FirstPersonCameraController(
      this.camera,
      canvas,
      (locked) => this.onCameraModeChange?.('firstPerson', locked),
    );
    this.activeController = this.orbitController;

    this.orbitCastMarker = this.createOrbitCastMarker();
    this.scene.add(this.orbitCastMarker);

    canvas.addEventListener('click', this.onCanvasClick);

    this.batchRenderer = new BatchedRenderer();
    this.scene.add(this.batchRenderer);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,
      0.4,
      0.85,
    );
    this.composer.addPass(bloom);

    window.addEventListener('resize', this.onResize);
  }

  get cameraMode(): CameraMode {
    return this.activeController.mode;
  }

  get isPointerLocked(): boolean {
    return this.fpController.isLocked;
  }

  setCameraModeListener(listener: (mode: CameraMode, locked: boolean) => void): void {
    this.onCameraModeChange = listener;
    listener(this.cameraMode, this.isPointerLocked);
  }

  setCameraMode(mode: CameraMode): void {
    if (mode === this.cameraMode) return;

    if (mode === 'firstPerson') {
      this.fpController.controls.unlock();
      this.activeController = this.fpController;
      this.camera.fov = 70;
      this.camera.position.set(0, 1.65, 10);
      this.camera.lookAt(0, 1.65, 0);
    } else {
      this.fpController.controls.unlock();
      this.activeController = this.orbitController;
      this.camera.fov = 60;
      this.camera.position.set(6, 7, 10);
      this.orbitController.controls.target.set(0, 0, 0);
      this.orbitController.controls.update();
    }

    this.camera.updateProjectionMatrix();
    this.syncOrbitCastMarkerVisibility();
    this.onCameraModeChange?.(mode, this.isPointerLocked);
  }

  toggleCameraMode(): CameraMode {
    const next = this.cameraMode === 'orbit' ? 'firstPerson' : 'orbit';
    this.setCameraMode(next);
    return next;
  }

  private onCanvasClick = (): void => {
    if (this.activeController.mode === 'firstPerson' && !this.fpController.isLocked) {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
        return;
      }
      this.fpController.requestPointerLock();
    }
  };

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.activeController.onResize();
  };

  /** 准星/屏幕中心射线落点（第一人称）或鼠标落点（鸟瞰） */
  getCastPosition(out = new THREE.Vector3()): THREE.Vector3 {
    this.activeController.getCastRay(this.raycaster, this.camera);
    return this.activeController.resolveCastPoint(
      this.raycaster,
      this.ground,
      this.castFallback,
      out,
    );
  }

  /** 施法方向：起点 → 目标落点 */
  getCastDirection(target = new THREE.Vector3()): THREE.Vector3 {
    if (this.cameraMode === 'orbit') {
      return target.subVectors(ORBIT_CAST_CENTER, ORBIT_CAST_ORIGIN).normalize();
    }
    const aim = this.getCastPosition(this._castAim);
    const origin = this.getCastOrigin(aim, this._castOrigin);
    return target.subVectors(aim, origin).normalize();
  }

  /** 施法起点（特效实体出发位置） */
  getCastOrigin(_castTarget: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
    if (this.cameraMode === 'firstPerson') {
      out.copy(this.camera.position);
      out.y -= 0.2;
      return out;
    }
    return out.copy(ORBIT_CAST_ORIGIN);
  }

  private createOrbitCastMarker(): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(ORBIT_CAST_ORIGIN);
    group.visible = true;

    const toCenter = new THREE.Vector3()
      .subVectors(ORBIT_CAST_CENTER, ORBIT_CAST_ORIGIN)
      .normalize();

    const platformGeo = new THREE.CircleGeometry(0.85, 32);
    const platformMat = new THREE.MeshBasicMaterial({
      color: 0x5577cc,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.rotation.x = -Math.PI / 2;
    group.add(platform);

    const ringGeo = new THREE.RingGeometry(0.7, 0.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    const aimGeo = new THREE.ConeGeometry(0.14, 0.45, 8);
    const aimMat = new THREE.MeshBasicMaterial({
      color: 0xccddff,
      transparent: true,
      opacity: 0.85,
    });
    const aim = new THREE.Mesh(aimGeo, aimMat);
    aim.position.copy(toCenter).multiplyScalar(0.55);
    aim.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toCenter);
    group.add(aim);

    const trailGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      ORBIT_CAST_CENTER.clone().sub(ORBIT_CAST_ORIGIN),
    ]);
    const trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({
        color: 0x4466aa,
        transparent: true,
        opacity: 0.25,
      }),
    );
    group.add(trail);

    return group;
  }

  private syncOrbitCastMarkerVisibility(): void {
    this.orbitCastMarker.visible = this.cameraMode === 'orbit';
  }

  setInputCaptured(byUi: boolean): void {
    this.orbitController.setInputCaptured(byUi);
    this.fpController.setInputCaptured(byUi);
  }

  async initVfx(): Promise<void> {
    await VfxLibrary.get().init(this.batchRenderer);
  }

  addEffect(effect: BaseEffect): void {
    this.effects.push(effect);
    this.scene.add(effect.mesh);
  }

  start(): void {
    const loop = (): void => {
      this.animationId = requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      this.activeController.update(dt);
      this.batchRenderer.update(dt);

      for (let i = this.effects.length - 1; i >= 0; i--) {
        const fx = this.effects[i];
        fx.update(dt);
        if (fx.isDead) {
          this.scene.remove(fx.mesh);
          fx.dispose();
          this.effects.splice(i, 1);
        }
      }

      this.composer.render();
    };
    loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.orbitController.dispose();
    this.fpController.dispose();
    for (const fx of this.effects) {
      this.scene.remove(fx.mesh);
      fx.dispose();
    }
    this.effects = [];
    this.renderer.dispose();
  }
}
