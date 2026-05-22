import * as THREE from 'three';
import gsap from 'gsap';
import type { ElementType, SpellData } from '../types';
import type { ReactionDef } from '../vfx/reactions/ReactionTable';
import type { CameraMode } from '../core/CameraController';

const RUNE_LABELS: Record<ElementType, string> = {
  fire: '火',
  water: '水',
  wind: '风',
  earth: '土',
  thunder: '雷',
  ice: '冰',
};

const ELEMENT_PATTERNS: Record<ElementType, RegExp> = {
  fire: /火|炎|烈|燃|焰/,
  water: /水|潮|流|涌/,
  ice: /冰|霜|寒|冻/,
  wind: /风|气|岚|飓|旋/,
  earth: /土|地|岩|石|山/,
  thunder: /雷|电|霆|闪/,
};

export class UIManager {
  private loadingEl: HTMLElement;
  private gameUiEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private castBtnEl: HTMLButtonElement;
  private summaryEl: HTMLElement;
  private errorEl: HTMLElement;
  private runeEls: Map<ElementType, HTMLElement>;
  private floatContainer: HTMLElement;
  private camera: THREE.Camera | null = null;
  private castHandler: ((text: string) => void) | null = null;
  private hintEl: HTMLElement;
  private crosshairEl: HTMLElement;
  private cameraModeBtn: HTMLButtonElement;
  private pointerLockHintEl: HTMLElement;
  private cameraModeToggleHandler: (() => void) | null = null;
  private inputCaptureHandler: ((captured: boolean) => void) | null = null;

  constructor() {
    this.loadingEl = document.getElementById('loading')!;
    this.gameUiEl = document.getElementById('game-ui')!;
    this.inputEl = document.getElementById('spell-input') as HTMLInputElement;
    this.castBtnEl = document.getElementById('cast-btn') as HTMLButtonElement;
    this.summaryEl = document.getElementById('spell-summary')!;
    this.errorEl = document.getElementById('spell-error')!;
    this.floatContainer = document.getElementById('damage-floats')!;
    this.hintEl = document.getElementById('hint-text')!;
    this.crosshairEl = document.getElementById('crosshair')!;
    this.cameraModeBtn = document.getElementById('camera-mode-btn') as HTMLButtonElement;
    this.pointerLockHintEl = document.getElementById('pointer-lock-hint')!;

    this.runeEls = new Map();
    document.querySelectorAll<HTMLElement>('[data-rune]').forEach((el) => {
      const key = el.dataset.rune as ElementType;
      this.runeEls.set(key, el);
    });

    this.inputEl.addEventListener('input', () => this.updateRunes(this.inputEl.value));
    this.castBtnEl.addEventListener('click', () => this.triggerCast());
    this.cameraModeBtn.addEventListener('click', () => this.cameraModeToggleHandler?.());

    this.inputEl.addEventListener('focus', () => this.inputCaptureHandler?.(true));
    this.inputEl.addEventListener('blur', () => this.inputCaptureHandler?.(false));

    window.addEventListener('keydown', this.onWindowKeyDown);
  }

  private onWindowKeyDown = (e: KeyboardEvent): void => {
    if (e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
    if (!this.loadingEl.classList.contains('hidden')) return;
    if (this.gameUiEl.classList.contains('hidden')) return;
    if (e.repeat) return;

    e.preventDefault();
    this.triggerCast();
  };

  onCast(handler: (text: string) => void): void {
    this.castHandler = handler;
  }

  bindCameraModeToggle(handler: () => void): void {
    this.cameraModeToggleHandler = handler;
  }

  bindInputCapture(handler: (captured: boolean) => void): void {
    this.inputCaptureHandler = handler;
  }

  setCameraMode(mode: CameraMode, pointerLocked: boolean): void {
    const isFp = mode === 'firstPerson';
    document.body.classList.toggle('mode-fp', isFp);
    document.body.classList.toggle('mode-orbit', !isFp);
    document.body.classList.toggle('pointer-locked', isFp && pointerLocked);

    this.cameraModeBtn.textContent = isFp ? '鸟瞰视角' : '第一人称';
    this.crosshairEl.classList.toggle('hidden', !isFp || !pointerLocked);
    this.pointerLockHintEl.classList.toggle('hidden', !isFp || pointerLocked);

    if (isFp) {
      this.hintEl.textContent = pointerLocked
        ? 'WASD 移动 · 准星瞄准 · 回车确认施法 · Esc 释放鼠标'
        : '点击画面进入第一人称 · 输入咒语后回车确认施法';
    } else {
      this.hintEl.textContent =
        '起点=南侧高空蓝台 · 俯射场地中心 · 如「火」「火球」「冰锥直线」· 回车施法';
    }
  }

  private triggerCast(): void {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.castHandler?.(text);
    this.hideError();
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onWindowKeyDown);
  }

  hideLoading(): void {
    this.loadingEl.classList.add('hidden');
    this.gameUiEl.classList.remove('hidden');
    this.inputEl.focus();
  }

  updateRunes(text: string): void {
    for (const [type, el] of this.runeEls) {
      const active = ELEMENT_PATTERNS[type].test(text);
      el.classList.toggle('active', active);
    }
  }

  showSpellSummary(
    spell: SpellData,
    reaction: ReactionDef | null = null,
    magicLabel?: string,
  ): void {
    const elemStr = spell.elems.map((e) => RUNE_LABELS[e]).join(' · ');
    const reactionStr = reaction
      ? ` ⚗ ${reaction.name}（${reaction.damageTypes.join('+')}）`
      : '';
    const magicStr = magicLabel ? ` ✦ ${magicLabel}` : '';
    this.summaryEl.textContent = `${elemStr}${reactionStr}${magicStr} | ${spell.form} | 威力 ${spell.potency} | 半径 ${spell.radius.toFixed(1)}m | ${spell.damage} 伤害`;
    this.summaryEl.classList.toggle('has-reaction', !!reaction);
  }

  showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.classList.add('visible');
  }

  hideError(): void {
    this.errorEl.classList.remove('visible');
  }

  showDamageNumber(worldPos: THREE.Vector3, damage: number, color: number): void {
    const el = document.createElement('div');
    el.className = 'damage-float';
    el.textContent = `-${damage}`;
    el.style.color = `#${(color & 0xffffff).toString(16).padStart(6, '0')}`;
    this.floatContainer.appendChild(el);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    if (this.camera) {
      const p = worldPos.clone().project(this.camera);
      const x = ((p.x + 1) / 2) * rect.width + rect.left;
      const y = ((-p.y + 1) / 2) * rect.height + rect.top;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    } else {
      el.style.left = '50%';
      el.style.top = '40%';
    }

    gsap.fromTo(
      el,
      { opacity: 1, y: 0, scale: 1.2 },
      {
        opacity: 0,
        y: -48,
        scale: 0.8,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      },
    );
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }
}
