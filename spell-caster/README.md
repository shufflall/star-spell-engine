# spell-caster

Web-based spell casting demo: natural language → **Web Worker 规则解析** → **实体×元素×运动** 3D VFX + element reactions + area damage.

- **Stack**: Vite, TypeScript, Three.js, three.quarks, GSAP
- **Parsing**: keyword rules + named spell table (`confidence ≈ 0.35`); ONNX LM planned
- **VFX**: 396 single-element combos (6×11×6), 16 reaction recipes, ballistic impact

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run vfx:export   # regenerate public/vfx/*.json
```

See [`../README.md`](../README.md) for the full magic system design and roadmap, and [`../spell-caster.md`](../spell-caster.md) for architecture details.
