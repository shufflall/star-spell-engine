/**
 * 导出单元素 + 元素反应复合特效 JSON
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ELEMENT_BUILDERS } from '../src/vfx/builders/index';
import { COMPOSITE_BUILDERS } from '../src/vfx/builders/composites/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const elementDir = path.join(__dirname, '../public/vfx');
const reactionDir = path.join(elementDir, 'reactions');

fs.mkdirSync(reactionDir, { recursive: true });

for (const [elem, build] of Object.entries(ELEMENT_BUILDERS)) {
  const json = build().toJSON();
  fs.writeFileSync(path.join(elementDir, `${elem}.json`), JSON.stringify(json, null, 2));
  console.log('wrote', elem);
}

const reactionFileNames: Record<string, string> = {
  'fire+wind': 'fire-wind',
  'water+wind': 'water-wind',
  'water+thunder': 'water-thunder',
  'fire+ice': 'fire-ice',
  'water+ice': 'water-ice',
  'fire+earth': 'fire-earth',
  'fire+water': 'fire-water',
  'ice+wind': 'ice-wind',
  'earth+thunder': 'earth-thunder',
  'fire+wind+thunder': 'fire-wind-thunder',
  'fire+thunder': 'fire-thunder',
  'water+earth': 'water-earth',
  'earth+wind': 'earth-wind',
  'earth+ice': 'earth-ice',
  'ice+thunder': 'ice-thunder',
  'wind+thunder': 'wind-thunder',
};

for (const [id, build] of Object.entries(COMPOSITE_BUILDERS)) {
  const json = build().toJSON();
  const name = reactionFileNames[id] ?? id.replace(/\+/g, '-');
  fs.writeFileSync(path.join(reactionDir, `${name}.json`), JSON.stringify(json, null, 2));
  console.log('wrote reaction', name);
}
