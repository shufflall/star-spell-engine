import * as THREE from 'three';
import {
  BatchedRenderer,
  QuarksLoader,
  QuarksUtil,
  registerShaderChunks,
} from 'three.quarks';
import type { ElementType, SpellData } from '../types';
import type { BaseEffect } from '../effects/BaseEffect';
import { MagicVfxEffect } from './magic/MagicVfxEffect';
import { composeImpactBurst } from './magic/buildMagicImpact';
import { composeMagicVfx } from './magic/MagicVfxComposer';
import type { MagicVfxRecipe } from './magic/types';
import { formatMagicLabel, resolveMagicRecipe, shouldUseMagicPipeline } from './magic/resolveMagic';
import { QuarksSpellEffect } from './QuarksSpellEffect';
import { ELEMENT_BUILDERS, VFX_JSON_PATHS } from './builders/index';
import { vfxDuration, vfxScale } from './builders/shared';
import { composeVfx } from './VfxComposer';
import { REACTION_RECIPES } from './recipes/reactionRecipes';
import {
  getElementFormDuration,
  getElementFormRecipe,
} from './recipes/elementFormRecipes';
import {
  findReaction,
  type ReactionDef,
  type ReactionId,
} from './reactions/ReactionTable';

const ELEMENT_BASE_DURATION: Record<ElementType, number> = {
  fire: 2.8,
  ice: 3,
  water: 2.5,
  wind: 1.8,
  earth: 2.2,
  thunder: 0.55,
};

export interface SpellVfxResult {
  effects: BaseEffect[];
  reaction: ReactionDef | null;
  /** 弹道类魔法：伤害在落地/命中时结算 */
  deferCombat: boolean;
  magicLabel?: string;
}

export class VfxLibrary {
  private static instance: VfxLibrary | null = null;

  static get(): VfxLibrary {
    if (!VfxLibrary.instance) {
      VfxLibrary.instance = new VfxLibrary();
    }
    return VfxLibrary.instance;
  }

  private readonly elementTemplates = new Map<ElementType, THREE.Object3D>();
  /** 复合特效始终用代码预制，避免 JSON clone 后粒子不播放 */
  private readonly reactionTemplates = new Map<ReactionId, THREE.Object3D>();
  private readonly loader = new QuarksLoader();
  private batchRenderer: BatchedRenderer | null = null;
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  async init(batchRenderer: BatchedRenderer): Promise<void> {
    registerShaderChunks();
    this.batchRenderer = batchRenderer;

    const elements = Object.keys(ELEMENT_BUILDERS) as ElementType[];
    await Promise.all(elements.map((elem) => this.loadElement(elem)));

    for (const id of Object.keys(REACTION_RECIPES) as ReactionId[]) {
      this.reactionTemplates.set(id, composeVfx(REACTION_RECIPES[id]));
    }

    this._ready = true;
  }

  private async loadElement(elem: ElementType): Promise<void> {
    const url = VFX_JSON_PATHS[elem];
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const obj = this.loader.parse<THREE.Object3D>(json);
        this.loader.linkReference(obj);
        this.elementTemplates.set(elem, obj);
        return;
      }
    } catch {
      /* fallback */
    }
    this.elementTemplates.set(elem, ELEMENT_BUILDERS[elem]());
  }

  resolveReaction(spell: SpellData): ReactionDef | null {
    return findReaction(spell.elems);
  }

  spawnSpell(
    spell: SpellData,
    origin: THREE.Vector3,
    target: THREE.Vector3,
  ): SpellVfxResult {
    if (!this.batchRenderer) {
      return { effects: [], reaction: null, deferCombat: false };
    }

    const reaction = findReaction(spell.elems);

    if (shouldUseMagicPipeline(spell, !!reaction)) {
      const recipe = resolveMagicRecipe(spell);
      if (recipe) {
        return this.spawnMagic(recipe, spell, origin, target);
      }
    }

    if (reaction) {
      return {
        ...this.spawnComposite(reaction, spell, target),
        deferCombat: false,
      };
    }

    return {
      ...this.spawnElements(spell, target),
      deferCombat: false,
    };
  }

  private spawnMagic(
    recipe: NonNullable<ReturnType<typeof resolveMagicRecipe>>,
    spell: SpellData,
    origin: THREE.Vector3,
    target: THREE.Vector3,
  ): SpellVfxResult {
    const composed = composeMagicVfx(recipe, spell);
    const instance = composed.prefab.clone();
    this.loader.linkReference(instance);
    instance.position.set(0, 0, 0);

    const scale = vfxScale(spell);
    instance.scale.setScalar(scale);

    QuarksUtil.addToBatchRenderer(instance, this.batchRenderer!);
    QuarksUtil.setAutoDestroy(instance, true);
    QuarksUtil.restart(instance);

    const effect = new MagicVfxEffect(
      origin,
      target,
      spell,
      instance,
      recipe,
      composed.duration,
    );

    return {
      effects: [effect],
      reaction: null,
      deferCombat: composed.deferCombat,
      magicLabel: formatMagicLabel(recipe),
    };
  }

  /** 弹道命中时的爆发粒子（由 SpellCaster 在 onImpact 中调用） */
  spawnMagicImpact(recipe: MagicVfxRecipe, spell: SpellData, position: THREE.Vector3): BaseEffect {
    const prefab = composeImpactBurst(recipe, spell);
    const instance = prefab.clone();
    this.loader.linkReference(instance);
    instance.position.set(0, 0, 0);
    const scale = vfxScale(spell) * 0.9;
    instance.scale.setScalar(scale);
    QuarksUtil.addToBatchRenderer(instance, this.batchRenderer!);
    QuarksUtil.setAutoDestroy(instance, true);
    QuarksUtil.restart(instance);
    return new QuarksSpellEffect(position, spell, instance, 0.85);
  }

  private spawnComposite(
    reaction: ReactionDef,
    spell: SpellData,
    position: THREE.Vector3,
  ): Pick<SpellVfxResult, 'effects' | 'reaction'> {
    const template = this.reactionTemplates.get(reaction.id);
    if (!template) return { effects: [], reaction };

    const instance = this.spawnInstance(template, spell, reaction.scaleMul);
    const duration = vfxDuration(spell, reaction.baseDuration);

    return {
      effects: [new QuarksSpellEffect(position, spell, instance, duration)],
      reaction,
    };
  }

  private spawnElements(
    spell: SpellData,
    position: THREE.Vector3,
  ): Pick<SpellVfxResult, 'effects' | 'reaction'> {
    const elems = spell.elems.length > 0 ? spell.elems : (['earth'] as ElementType[]);
    const effects: BaseEffect[] = [];
    const multi = elems.length > 1 ? 0.88 : 1;

    for (const elem of elems) {
      const formRecipe = elems.length === 1 ? getElementFormRecipe(elem, spell.form) : null;

      if (formRecipe) {
        const composed = composeVfx(formRecipe);
        const instance = this.spawnInstance(composed, spell, multi);
        effects.push(
          new QuarksSpellEffect(
            position,
            spell,
            instance,
            getElementFormDuration(elem, spell.form),
          ),
        );
        continue;
      }

      const template = this.elementTemplates.get(elem);
      if (!template) continue;

      const instance = this.spawnInstance(template, spell, multi);
      effects.push(
        new QuarksSpellEffect(
          position,
          spell,
          instance,
          ELEMENT_BASE_DURATION[elem],
        ),
      );
    }

    return { effects, reaction: null };
  }

  private spawnInstance(
    template: THREE.Object3D,
    spell: SpellData,
    scaleMul: number,
  ): THREE.Object3D {
    const instance = template.clone();
    this.loader.linkReference(instance);
    instance.position.set(0, 0, 0);

    let scale = vfxScale(spell) * scaleMul;
    if (spell.form === 'storm') scale *= 1.3;
    else if (spell.form === 'orb') scale *= 0.75;
    else if (spell.form === 'rain') scale *= 1.15;
    else if (spell.form === 'beam') scale *= 0.9;
    else if (spell.form === 'wall') scale *= 1.1;
    instance.scale.setScalar(scale);

    QuarksUtil.addToBatchRenderer(instance, this.batchRenderer!);
    QuarksUtil.setAutoDestroy(instance, true);
    QuarksUtil.restart(instance);

    return instance;
  }
}
