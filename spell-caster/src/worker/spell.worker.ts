import type { ElementType, FormType, SpellData, WorkerRequest, WorkerResponse } from '../types';
import { parseMagicLanguage } from '../vfx/magic/parseMagicLanguage';

const ELEMENT_RULES: { type: ElementType; pattern: RegExp }[] = [
  { type: 'fire', pattern: /火|炎|烈|燃|焰/ },
  { type: 'water', pattern: /水|潮|流|涌/ },
  { type: 'ice', pattern: /冰|霜|寒|冻|雪/ },
  { type: 'wind', pattern: /风|气|岚|飓|旋/ },
  { type: 'earth', pattern: /土|地|岩|石|山|泥|沼/ },
  { type: 'thunder', pattern: /雷|电|霆|闪/ },
];

const MAX_RADIUS = 12;
const MAX_DAMAGE = 200;
const MAX_TEXT_LEN = 64;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function inferForm(text: string): FormType {
  if (/风暴|龙卷|旋风|飓风/.test(text)) return 'storm';
  if (/墙|壁|盾|屏障|守护/.test(text)) return 'wall';
  if (/雨|倾泻|降落|之雨/.test(text)) return 'rain';
  if (/束|射线|光柱|激光/.test(text)) return 'beam';
  if (/球|珠|弹|orb/i.test(text)) return 'orb';
  if (/爆|轰|炸|碎|崩/.test(text)) return 'burst';
  return 'orb';
}

function baseDamage(potency: number, form: FormType): number {
  const formMul: Record<FormType, number> = {
    orb: 1,
    burst: 1.2,
    rain: 0.9,
    wall: 0.7,
    beam: 1.1,
    storm: 1.4,
  };
  return Math.round(20 * potency * (formMul[form] ?? 1));
}

function baseRadius(potency: number, form: FormType): number {
  const formMul: Record<FormType, number> = {
    orb: 1.5,
    burst: 2.5,
    rain: 3,
    wall: 2,
    beam: 1.2,
    storm: 4,
  };
  return clamp(1.5 + potency * 0.8 * (formMul[form] ?? 2), 1, MAX_RADIUS);
}

/**
 * 双元素复合咒（不含单元素命名法术：暴雪/泥沼等走 magic 管线）
 */
const COMPOUND_HINTS: { pattern: RegExp; add: ElementType[] }[] = [
  { pattern: /风水|水龙卷|海啸|潮旋|水旋风/, add: ['water', 'wind'] },
  { pattern: /烈焰风暴|火龙卷|火旋风|风火/, add: ['fire', 'wind'] },
  { pattern: /雷火|火雷|雷霆火焰/, add: ['fire', 'thunder'] },
  { pattern: /感电|水雷|雷电之水/, add: ['water', 'thunder'] },
  { pattern: /冰雪|霜雨|冰暴雪/, add: ['water', 'ice'] },
  { pattern: /冰火|火冰|蒸汽爆炸/, add: ['fire', 'ice'] },
  { pattern: /熔岩|岩浆|火土/, add: ['fire', 'earth'] },
  { pattern: /冰霜旋风|冰风|风冰/, add: ['ice', 'wind'] },
  { pattern: /震雷|雷土|大地之雷/, add: ['earth', 'thunder'] },
  { pattern: /雷火闪|火雷爆|焰雷/, add: ['fire', 'thunder'] },
  { pattern: /水土|洪流/, add: ['water', 'earth'] },
  { pattern: /沙尘|土风|尘旋/, add: ['earth', 'wind'] },
  { pattern: /冻土|冰土|霜裂/, add: ['earth', 'ice'] },
  { pattern: /冰雷|霜雷|碎冰雷/, add: ['ice', 'thunder'] },
  { pattern: /风雷|雷风裂/, add: ['wind', 'thunder'] },
];

export function parseByRules(text: string): SpellData {
  const trimmed = text.trim().slice(0, MAX_TEXT_LEN);
  const elems: ElementType[] = [];

  for (const { type, pattern } of ELEMENT_RULES) {
    if (pattern.test(trimmed) && !elems.includes(type)) {
      elems.push(type);
    }
  }

  for (const { pattern, add } of COMPOUND_HINTS) {
    if (pattern.test(trimmed)) {
      for (const e of add) {
        if (!elems.includes(e)) elems.push(e);
      }
    }
  }

  if (elems.length === 0) {
    elems.push('earth');
  }

  const form = inferForm(trimmed);
  const potency = clamp(
    Math.max(1, elems.length + Math.floor(trimmed.length / 8)),
    1,
    5,
  );
  const radius = baseRadius(potency, form);
  const damage = clamp(baseDamage(potency, form), 1, MAX_DAMAGE);

  const base: SpellData = {
    elems,
    form,
    potency,
    radius,
    damage,
    confidence: 0.35,
  };

  if (elems.length === 1) {
    base.magic = parseMagicLanguage(trimmed, elems[0]);
  }

  return base;
}

function sanitize(data: SpellData): SpellData {
  const elems = data.elems.length > 0 ? [...new Set(data.elems)] : (['earth'] as ElementType[]);
  return {
    elems,
    form: data.form,
    potency: clamp(Math.round(data.potency), 1, 5),
    radius: clamp(data.radius, 0.5, MAX_RADIUS),
    damage: clamp(Math.round(data.damage), 1, MAX_DAMAGE),
    confidence: clamp(data.confidence, 0, 1),
    magic: data.magic,
  };
}

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const msg = ev.data;

  try {
    if (msg.type === 'init') {
      const ready: WorkerResponse = { type: 'ready' };
      self.postMessage(ready);
      return;
    }

    if (msg.type === 'parse') {
      const raw = parseByRules(msg.text);
      const payload = sanitize(raw);
      const spell: WorkerResponse = { type: 'spell', payload };
      self.postMessage(spell);
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    const error: WorkerResponse = { type: 'error', message };
    self.postMessage(error);
  }
};
