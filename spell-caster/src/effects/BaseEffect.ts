import * as THREE from 'three';
import type { SpellData } from '../types';

export abstract class BaseEffect {
  protected group: THREE.Group;
  protected life = 0;
  protected maxLife: number;
  protected dead = false;

  protected spellData: SpellData;

  constructor(position: THREE.Vector3, spellData: SpellData, maxLife = 2) {
    this.spellData = spellData;
    this.maxLife = maxLife;
    this.group = new THREE.Group();
    this.group.position.copy(position);
  }

  abstract update(dt: number): void;
  abstract dispose(): void;

  get mesh(): THREE.Group {
    return this.group;
  }

  get isDead(): boolean {
    return this.dead;
  }

  protected tickLife(dt: number): boolean {
    this.life += dt;
    if (this.life >= this.maxLife) {
      this.dead = true;
      return true;
    }
    return false;
  }
}
