# Reef Relay — The Living City

An oceanarium-grade, first-person coral reef expedition for learners ages 8–13. Reef Relay replaces the usual wall of text with a living underwater field lesson: swim through three nursery zones, inspect real digitized coral skeletons, identify colonies from shape, and watch the same reef respond to heat, bleaching, and recovery.

**Live site:** https://reef-relay.arnz.chatgpt.site

## What is inside

- WebGPU-first Three.js renderer with automatic WebGL 2 fallback
- Continuous first-person movement by drag + `W A S D`, arrow keys, scroll, or a mobile hold-to-swim control
- Three CC0 Smithsonian coral scans, with lighter 20k-triangle versions selected on mobile
- Blender-optimized CC0 Barramundi fish, PBR seabed textures, moving caustics, suspended matter, fog, surface water, and restrained museum lighting
- Visual coral identification and uncertainty-aware feedback
- A four-stage Time Dive that transforms the same scene: partnership, heat stress, bleaching, and recovery
- Shareable expedition rooms with quiet best-effort collaboration; the core lesson remains fully usable solo
- Optional `gpt-realtime-2.1` voice-guide bridge, with local caption/speech fallback when the server feature is not configured

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run lint
npm test
```

## Controls

| Input | Action |
|---|---|
| Drag / touch-drag | Look around |
| `W A S D` / arrow keys | Swim |
| `Q` / `E` | Descend / rise |
| `Shift` | Swim faster |
| Scroll | Nudge forward or back |
| Colony marker or coral | Observe |

## Realtime guide

The default public build never requests microphone access. Without configuration, the Guide button uses deterministic browser captions and speech synthesis.

To develop the live WebRTC guide, bind `OPENAI_API_KEY` as a server-side Cloudflare secret and set `ENABLE_REALTIME_GUIDE=true`. Never expose the key to browser code. Before enabling voice in a public experience for children under 13, complete the applicable child-privacy review, Zero Data Retention setup, abuse protection, rate limits, and consent flow. Prompt instructions are not a compliance control.

## Architecture

- `app/components/ReefScene.tsx` — lazy WebGPU engine, navigation, models, water, state transforms, and resilient fallback
- `app/components/ReefTimeline.tsx` — science-correct temporal story controlling the shared scene
- `app/hooks/useReefGuide.ts` — WebRTC Realtime client and local guide fallback
- `app/api/realtime/route.ts` — server-only unified SDP exchange
- `app/api/room/route.ts` — ephemeral collaborative room state
- `ASSET_LICENSES.md` — exact asset provenance and reuse terms
- `SCIENCE.md` — claims, learning guardrails, and primary sources

## License

Code is MIT licensed. Third-party and generated media keep their own terms; see [ASSET_LICENSES.md](ASSET_LICENSES.md).
