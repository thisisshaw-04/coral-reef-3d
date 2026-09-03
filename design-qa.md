# Reef Relay v5 Design QA

- Source visual truth: `design/reef-relay-v5-reference.png`
- Browser implementation capture: `design/implementation-v5.jpg`
- Combined comparison: `design/qa-comparison-v5.jpg`
- Viewport: 1363 × 936 CSS px, desktop, device scale 1
- Source pixels: 1536 × 1024, center-cropped to 1363 × 936
- Implementation pixels: 1363 × 936
- State: expedition entered; Colony A7 selected; Note active; 2035 recovery

## Full-view comparison evidence

The implementation preserves the curved submarine viewport, reef-first composition, globe navigator, room/depth, mission label, collaborator pointer, coral markers, specimen monitor, scan/mark/note/restore console, stress trigger and full-width time current. The coded console is intentionally shallower so the live 3D scene remains explorable.

## Focused region comparison evidence

The specimen monitor and bottom interaction zone remain readable at original resolution. Coral image, health readout, note affordance, tool selection and timeline states all have direct functional counterparts. No extra crop was needed.

## Required fidelity surfaces

- Fonts and typography: monospaced instrument labels and humanist display hierarchy match the source.
- Spacing and layout rhythm: persistent controls remain visible and mirror the source placement.
- Colors and tokens: abyss navy, living teal, heat amber, bleaching ivory and recovery green are semantic and paired with text.
- Image quality and assets: fallback uses the full-resolution cinematic reef asset; capable browsers render Smithsonian coral scans, fish geometry, PBR gravel, volumetric rays, particles, caustics and WaterMesh. No placeholders.
- Copy and content: concise expedition language replaces dashboard noise; DHW, pH, restoration limits and stress effects are bounded.

## Interaction verification

- Began the expedition; selected Colony A7; activated Note and saved an observation.
- Opened Stress Test and applied heat; moved the time current to recovery.
- Confirmed the specimen panel and environment phase update.
- Checked console. No app runtime errors. The cloud browser provides no usable WebGPU/WebGL context, so it correctly used the cinematic fallback; Three.js and extension warnings were non-blocking.

## Comparison history

- P2: “1 DIVERS” copy. Fixed singular pluralization.
- P2: fast Note saves could race Mark. Fixed the endpoint so Note atomically creates its annotation record.
- Post-fix comparison: no actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: add native WebGPU bloom when deployment browser support is known.
- P3: replace in-memory rooms with durable storage for production installations.

final result: passed
