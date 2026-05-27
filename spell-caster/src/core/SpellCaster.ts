import * as THREE from 'three';
import SpellWorker from '../worker/spell.worker.ts?worker';
import type { ElementType, SpellData, WorkerResponse } from '../types';
import type { CombatSystem } from '../combat/CombatSystem';
import type { Engine } from './Engine';
import type { UIManager } from '../ui/UIManager';
import { createSpellVfx } from '../effects/effectFactory';
import { MagicVfxEffect } from '../vfx/magic/MagicVfxEffect';
import { formatMagicLabel } from '../vfx/magic/resolveMagic';
import { VfxLibrary } from '../vfx/VfxLibrary';
import { entityNeedsInstantImpact, motionNeedsImpact } from '../vfx/magic/types';

const ELEMENT_COLORS: Record<ElementType, number> = {
  fire: 0xff5522,
  water: 0x3388ff,
  wind: 0xaaddff,
  earth: 0x887755,
  thunder: 0xffee44,
  ice: 0xaaeeff,
};

export class SpellCaster {
  private worker: Worker;
  private ready = false;
  private engine: Engine;
  private combat: CombatSystem;
  private ui: UIManager;

  constructor(engine: Engine, combat: CombatSystem, ui: UIManager, onReady: () => void) {
    this.engine = engine;
    this.combat = combat;
    this.ui = ui;
    this.worker = new SpellWorker();
    this.worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(ev.data, onReady);
    };
    this.worker.onerror = () => {
      this.ui.showError('魔网连接异常');
    };
    this.worker.postMessage({ type: 'init' });

    this.ui.onCast((text) => this.cast(text));
  }

  private handleWorkerMessage(msg: WorkerResponse, onReady: () => void): void {
    if (msg.type === 'ready') {
      this.ready = true;
      onReady();
      return;
    }
    if (msg.type === 'error') {
      this.ui.showError(msg.message);
      return;
    }
    if (msg.type === 'spell') {
      this.executeSpell(msg.payload);
    }
  }

  cast(text: string): void {
    if (!this.ready) {
      this.ui.showError('魔网尚未就绪');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    this.worker.postMessage({ type: 'parse', text: trimmed });
  }

  private executeSpell(spell: SpellData): void {
    const target = this.engine.getCastPosition();
    const origin = this.engine.getCastOrigin(target);
    const direction = this.engine.getCastDirection();
    const { effects, reaction, deferCombat, magicLabel } = createSpellVfx(
      spell,
      origin,
      target,
      direction,
    );

    const dmgColor = reaction?.color ?? ELEMENT_COLORS[spell.elems[0] ?? 'fire'];
    const label =
      magicLabel ?? (spell.magic ? formatMagicLabel(spell.magic) : undefined);

    const applyHits = (at: THREE.Vector3) => {
      const hits = this.combat.applySpell(at, spell, reaction);
      for (const { target, damage } of hits) {
        this.ui.showDamageNumber(
          target.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
          damage,
          dmgColor,
        );
      }
    };

    if (!deferCombat) {
      applyHits(target);
    }

    const vfxLib = VfxLibrary.get();
    for (const effect of effects) {
      if (effect instanceof MagicVfxEffect) {
        const recipe = effect.recipe;
        const instantAoE = entityNeedsInstantImpact(recipe.entity);
        if (instantAoE) {
          this.engine.addEffect(vfxLib.spawnMagicImpact(recipe, spell, target));
        }
        effect.onImpact = (impactPos) => {
          if (recipe && motionNeedsImpact(recipe.motion) && !instantAoE) {
            this.engine.addEffect(vfxLib.spawnMagicImpact(recipe, spell, impactPos));
          }
          applyHits(impactPos);
        };
      }
      this.engine.addEffect(effect);
    }

    this.ui.showSpellSummary(spell, reaction, label);
  }

  dispose(): void {
    this.worker.terminate();
  }
}
