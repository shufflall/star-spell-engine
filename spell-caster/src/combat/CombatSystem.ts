import * as THREE from 'three';
import type { SpellData } from '../types';
import type { ReactionDef } from '../vfx/reactions/ReactionTable';

export interface CombatTarget {
  id: string;
  mesh: THREE.Mesh;
  hp: number;
  maxHp: number;
}

export interface HitResult {
  target: CombatTarget;
  damage: number;
}

const TARGET_COLORS = [0x6b4c9a, 0x3d6b8c, 0x8c5a3d];

export class CombatSystem {
  readonly targets: CombatTarget[] = [];
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnDummies();
  }

  private spawnDummies(): void {
    const positions = [
      new THREE.Vector3(-4, 0.75, -2),
      new THREE.Vector3(3, 0.75, 1),
      new THREE.Vector3(0, 0.75, -5),
    ];

    positions.forEach((pos, i) => {
      const geo = new THREE.CapsuleGeometry(0.45, 1, 8, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: TARGET_COLORS[i % TARGET_COLORS.length],
        emissive: 0x111122,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.targets.push({
        id: `dummy-${i}`,
        mesh,
        hp: 100,
        maxHp: 100,
      });
    });
  }

  applySpell(
    position: THREE.Vector3,
    spell: SpellData,
    reaction: ReactionDef | null = null,
  ): HitResult[] {
    const hits: HitResult[] = [];
    const radius = spell.radius * (reaction ? 1.08 : 1);
    const dmgMul = reaction?.damageMultiplier ?? 1;

    for (const target of this.targets) {
      if (target.hp <= 0) continue;

      const dist = position.distanceTo(target.mesh.position);
      if (dist <= radius) {
        const falloff = 1 - dist / (radius + 0.001);
        const damage = Math.round(spell.damage * dmgMul * (0.5 + 0.5 * falloff));
        target.hp = Math.max(0, target.hp - damage);
        hits.push({ target, damage });
        this.flashHit(target);
      }
    }

    return hits;
  }

  private flashHit(target: CombatTarget): void {
    const mat = target.mesh.material as THREE.MeshStandardMaterial;
    const orig = mat.emissive.getHex();
    mat.emissive.setHex(0xff4422);
    setTimeout(() => {
      if (target.hp > 0) mat.emissive.setHex(orig);
      else mat.emissive.setHex(0x222222);
    }, 120);
  }
}
