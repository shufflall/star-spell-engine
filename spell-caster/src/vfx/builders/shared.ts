import * as THREE from 'three';
import {
  ConstantValue,
  IntervalValue,
  ConstantColor,
  PiecewiseBezier,
  Bezier,
  ColorOverLife,
  SizeOverLife,
  Gradient,
  Vector3,
  Vector4,
} from 'quarks.core';
import type { SpellData } from '../../types';

export function vfxScale(spell: SpellData): number {
  return 0.45 + spell.radius * 0.22 + spell.potency * 0.08;
}

export function vfxDuration(spell: SpellData, base: number): number {
  return base + spell.potency * 0.35;
}

export function quarkColor(r: number, g: number, b: number, a = 1): ConstantColor {
  return new ConstantColor(new Vector4(r, g, b, a));
}

export function additiveMaterial(tint = 0xffffff): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: tint,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function normalMaterial(tint: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: tint,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function fireColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient(
      [
        [new Vector3(1, 0.9, 0.6), 0],
        [new Vector3(1, 0.4, 0.1), 0.5],
        [new Vector3(0.2, 0.05, 0.02), 1],
      ],
      [
        [1, 0],
        [0.85, 0.4],
        [0, 1],
      ],
    ),
  );
}

export function fireSizeOverLife(): SizeOverLife {
  return new SizeOverLife(
    new PiecewiseBezier([[new Bezier(0.2, 0.7, 1, 0.4), 0]]),
  );
}

export function fadeSizeOverLife(): SizeOverLife {
  return new SizeOverLife(
    new PiecewiseBezier([[new Bezier(1, 0.6, 0.15, 0), 0]]),
  );
}

export function iceColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient(
      [
        [new Vector3(0.9, 0.95, 1), 0],
        [new Vector3(0.5, 0.75, 1), 1],
      ],
      [
        [0.95, 0],
        [0.5, 1],
      ],
    ),
  );
}

export function waterColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient(
      [
        [new Vector3(0.3, 0.6, 1), 0],
        [new Vector3(0.1, 0.35, 0.85), 1],
      ],
      [
        [0.9, 0],
        [0.35, 1],
      ],
    ),
  );
}

export function windColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient([[new Vector3(0.9, 0.95, 1), 0]], [[0.85, 0]]),
  );
}

export function earthColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient([[new Vector3(0.6, 0.5, 0.4), 0]], [[0.8, 0]]),
  );
}

export function thunderColorOverLife(): ColorOverLife {
  return new ColorOverLife(
    new Gradient(
      [
        [new Vector3(1, 1, 1), 0],
        [new Vector3(0.4, 0.6, 1), 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
    ),
  );
}

export {
  ConstantValue,
  IntervalValue,
  ConstantColor,
  ColorOverLife,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
};
