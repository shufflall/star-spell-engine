import './style.css';
import { Engine } from './core/Engine';
import { SpellCaster } from './core/SpellCaster';
import { CombatSystem } from './combat/CombatSystem';
import { UIManager } from './ui/UIManager';

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas);
  const ui = new UIManager();
  ui.setCamera(engine.camera);

  const combat = new CombatSystem(engine.scene);

  ui.bindCameraModeToggle(() => {
    engine.toggleCameraMode();
  });
  ui.bindInputCapture((captured) => {
    engine.setInputCaptured(captured);
  });
  engine.setCameraModeListener((mode, locked) => {
    ui.setCameraMode(mode, locked);
  });

  let workerReady = false;
  let vfxReady = false;

  const tryHideLoading = (): void => {
    if (workerReady && vfxReady) {
      ui.hideLoading();
    }
  };

  try {
    await engine.initVfx();
    vfxReady = true;
  } catch (err) {
    console.error('VFX init failed', err);
    ui.showError('特效库加载失败');
    vfxReady = true;
  }

  new SpellCaster(engine, combat, ui, () => {
    workerReady = true;
    tryHideLoading();
  });

  if (vfxReady) tryHideLoading();

  engine.start();
}

bootstrap();
