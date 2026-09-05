import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Reef Relay production worker and client", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/client/reef-entry-v4.webp", import.meta.url));
  await access(new URL("../dist/client/models/acropora-hyacinthus.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-acropora-palmata.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-linckia-laevigata.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-tubipora-musica.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-tridacna-squamosa.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-chonelasma-oreia.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-endoxocrinus-parrae.glb", import.meta.url));
});

test("publishes truthful product metadata and preview contract", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /Reef Relay — The Living City/);
  assert.match(layout, /"codex-preview": "development"/);
  assert.match(layout, /reef-entry-v4\.webp/);
});

test("keeps live voice gated behind explicit server configuration", async () => {
  const route = await readFile(new URL("../app/api/realtime/route.ts", import.meta.url), "utf8");
  assert.match(route, /ENABLE_REALTIME_GUIDE/);
  assert.match(route, /gpt-realtime-2\.1/);
  assert.match(route, /REALTIME_NOT_CONFIGURED/);
});

test("uses a broader scan-based coral survey without cone light meshes", async () => {
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");
  const colonyCount = data.match(/label: "Colony /g)?.length ?? 0;

  assert.ok(colonyCount >= 12);
  assert.match(data, /scan: "acro-table"/);
  assert.match(data, /scan: "acro-compact"/);
  assert.match(data, /scan: "massive-star"/);
  assert.match(data, /scan: "acropora-palmata"/);
  assert.match(data, /scan: "pavona-lettuce"/);
  assert.match(scene, /AMBIENT_SCAN_COLONIES/);
  assert.match(scene, /smithsonian-diodon-hystrix\.glb/);
  assert.match(scene, /const FLOOR_WIDTH = 560/);
  assert.match(scene, /new WaterMesh\(new THREE\.PlaneGeometry\(FLOOR_WIDTH \* 1\.42, FLOOR_DEPTH \* 1\.18\)/);
  assert.doesNotMatch(scene, /ConeGeometry\(5 \+ random\(\) \* 9, 62/);
});

test("loads research-based biome terrains from the global navigator", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(data, /id: "sisters-islands"/);
  assert.match(data, /name: "Coral Triangle"/);
  assert.match(data, /NOAA identifies elkhorn, staghorn, and star corals/);
  assert.match(data, /NParks and Singapore reef studies/);
  assert.match(page, /biome=\{activeWorld\.id\}/);
  assert.match(page, /activeWorld\.objectiveSteps\.map/);
  assert.match(scene, /BIOME_CONFIG/);
  assert.match(scene, /terrain: "caribbean-spur"/);
  assert.match(scene, /floorTexture: "shelf-rubble"/);
  assert.match(scene, /floorTexture: "silt-lagoon"/);
  assert.match(scene, /floorTexture: "coral-wall"/);
  assert.match(scene, /floorTexture: "spur-groove"/);
  assert.match(scene, /const makeFloorTexture = \(\) =>/);
  assert.match(scene, /BIOME_AMBIENT_SCAN_COLONIES/);
});

test("uses distinct procedural seabed textures and faster movement", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /"shelf-rubble":/);
  assert.match(scene, /"silt-lagoon":/);
  assert.match(scene, /"coral-wall":/);
  assert.match(scene, /"spur-groove":/);
  assert.match(scene, /textureLoader\.loadAsync\("\/textures\/coral-gravel-diffuse\.jpg"\)/);
  assert.match(scene, /const floorTexture = biomeConfig\.floorTexture === "shelf-rubble" \? gravel : makeFloorTexture\(\)/);
  assert.match(scene, /new THREE\.CanvasTexture\(canvas\)/);
  assert.match(scene, /texture\.wrapS = texture\.wrapT = THREE\.ClampToEdgeWrapping/);
  assert.match(scene, /texture\.repeat\.set\(1, 1\)/);
  assert.match(scene, /map: floorTexture/);
  assert.match(scene, /-event\.deltaY \* 0\.0027/);
  assert.match(scene, /nav\.keys\.has\("shift"\) \? 12\.4 : 6\.8/);
  assert.match(scene, /vertical \* 3\.6/);
});

test("uses the clean Google Sans entry action system", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /className="entry-actions"/);
  assert.match(css, /--reef-ui-font: "Google Sans"/);
  assert.match(css, /\.entry-actions\s*{[^}]*grid-template-columns:/s);
  assert.match(css, /\.expedition-entry h1[\s\S]*?font-weight: 500/);
});

test("styles the time current as a smooth y2k glass timeline", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /--timeline-fill/);
  assert.match(page, /data-phase=\{activeMoment\.phase\}/);
  assert.match(css, /v11 - smooth Y2K glass time-current/);
  assert.match(css, /timeline-sheen/);
  assert.match(css, /timeline-dot-pulse/);
  assert.match(css, /\.time-current nav::after[\s\S]*?width: var\(--timeline-fill\)/);
});

test("uses a white frosted glass HUD instead of blue panels", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v13 - white frosted glass HUD/);
  assert.match(css, /--frost-fill: rgb\(255 255 255 \/ 0\.15\)/);
  assert.match(css, /--frost-warm: rgb\(255 255 255 \/ 0\.94\)/);
  assert.match(css, /--hud: #ffffff/);
  assert.match(css, /\.world-drawer,[\s\S]*?\.expedition-entry\s*{/);
  assert.match(css, /backdrop-filter: blur\(34px\) saturate\(1\.12\) brightness\(1\.03\)/);
  assert.match(css, /border: 0;[\s\S]*?linear-gradient\(135deg, rgb\(255 255 255 \/ 0\.19\)/);
  assert.match(css, /\.guide-toggle,[\s\S]*?\.stress-trigger\s*{[\s\S]*?color: #ffffff !important/);
});

test("keeps the frosted specimen panel scrollbar invisible", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.specimen-monitor\s*{[\s\S]*?scrollbar-width: none/);
  assert.match(css, /\.specimen-monitor\s*{[\s\S]*?-ms-overflow-style: none/);
  assert.match(css, /\.specimen-monitor::-webkit-scrollbar\s*{[\s\S]*?display: none/);
});

test("rounds the crew-code join control as a single capsule", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v14 - polished crew-code capsule/);
  assert.match(css, /\.expedition-entry form\s*{[\s\S]*?gap: 8px/);
  assert.match(css, /\.expedition-entry form\s*{[\s\S]*?padding: 8px/);
  assert.match(css, /\.expedition-entry form button\s*{[\s\S]*?border-radius: 999px/);
  assert.match(css, /\.expedition-entry form button\s*{[\s\S]*?min-height: 56px/);
});

test("keeps the intro glass transparent enough to show the reef", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v15 - clearer intro glass/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?rgb\(5 18 24 \/ 0\.26\)/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?backdrop-filter: blur\(26px\) saturate\(1\.1\) brightness\(0\.98\)/);
  assert.match(css, /\.begin-button,[\s\S]*?\.expedition-entry form\s*{[\s\S]*?rgb\(255 255 255 \/ 0\.045\)/);
});

test("uses an animated Frutiger Aero timeline without a harsh selected block", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v16 - fluid Frutiger Aero timeline/);
  assert.match(css, /\.time-current nav::after\s*{[\s\S]*?width: calc\(var\(--timeline-progress\) \* 0\.8\)/);
  assert.match(css, /\.time-current nav::after\s*{[\s\S]*?animation: timeline-flow 2\.8s ease-in-out infinite/);
  assert.match(css, /\.time-current nav button::after,[\s\S]*?\.time-current nav button\.is-active::after\s*{[\s\S]*?opacity: 0/);
  assert.match(css, /\.time-current nav button i\s*{[\s\S]*?radial-gradient\(circle at 34% 28%, #ffffff/);
  assert.match(css, /@keyframes timeline-orb-breathe/);
});

test("keeps intro action capsules the same width", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v18 - equal intro action capsules/);
  assert.match(css, /\.entry-actions\s*{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.begin-button,[\s\S]*?\.expedition-entry form\s*{[\s\S]*?width: 100%/);
});

test("keeps the intro panel compact on desktop", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v19 - compact intro panel/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?width: min\(1180px, calc\(100vw - 140px\)\)/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?font-size: clamp\(58px, 6\.2vw, 116px\)/);
  assert.match(css, /@media \(min-width: 1600px\)[\s\S]*?width: min\(1120px, calc\(100vw - 220px\)\)/);
});

test("uses icon lenses for briefing points instead of numeric dots", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /const briefingPointIcons =/);
  assert.match(page, /\/icons\/reef-find-colonies\.png/);
  assert.match(page, /\/icons\/reef-shape-first\.png/);
  assert.match(page, /\/icons\/reef-evidence-id\.png/);
  assert.match(page, /<img src=\{iconSrc\} alt="" \/>/);
  assert.match(css, /v20 - briefing point icons/);
  assert.match(css, /v30 - polished briefing image icons/);
  assert.match(css, /\.briefing-points i img\s*{[\s\S]*?object-fit: contain/);
  assert.match(css, /v32 - transparent PNG briefing icons without lens chrome/);
  assert.match(css, /\.briefing-points i\s*{[\s\S]*?background: transparent/);
  assert.match(css, /\.briefing-points i\s*{[\s\S]*?box-shadow: none/);
  await access(new URL("../public/icons/reef-find-colonies.png", import.meta.url));
  await access(new URL("../public/icons/reef-shape-first.png", import.meta.url));
  await access(new URL("../public/icons/reef-evidence-id.png", import.meta.url));
});

test("separates the bottom tool dock from the timeline", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v21 - separated sleek bottom HUD/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?bottom: clamp\(128px, 15\.5vh, 164px\)/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 58px/);
  assert.match(css, /\.time-current\s*{[\s\S]*?height: 72px/);
  assert.match(css, /\.time-current\s*{[\s\S]*?bottom: 18px/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?bottom: clamp\(132px, 15\.7vh, 168px\)/);
});

test("replaces fake reef-floor blobs with modeled rubble and benthic life", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const makeRubbleGeometry = \(\) =>/);
  assert.match(scene, /const makeTubeSpongeGeometry = \(\) =>/);
  assert.match(scene, /const reefRubble = new THREE\.InstancedMesh/);
  assert.match(scene, /floorScannedHabitatsByBiome/);
  assert.match(scene, /smithsonian-tubipora-musica\.glb/);
  assert.match(scene, /smithsonian-tridacna-squamosa\.glb/);
  assert.match(scene, /smithsonian-chonelasma-oreia\.glb/);
  assert.match(scene, /smithsonian-endoxocrinus-parrae\.glb/);
  assert.match(scene, /countFor\(1560, 680, biomeConfig\.grassDensity\)/);
  assert.match(scene, /countFor\(430, 175, biomeConfig\.kelpDensity\)/);
  assert.match(scene, /countFor\(340, 140, biomeConfig\.seaFanDensity\)/);
  assert.match(scene, /countFor\(1080, 430, biomeConfig\.softPolypDensity\)/);
  assert.match(scene, /smithsonian-linckia-laevigata\.glb/);
  assert.doesNotMatch(scene, /const coralHeads = new THREE\.InstancedMesh/);
  assert.doesNotMatch(scene, /new THREE\.SphereGeometry\(1, 16, 8, 0, Math\.PI \* 2, 0, Math\.PI \/ 2\)/);
});

test("anchors scan colonies to the seabed instead of fixed floating heights", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const groundedBounds = new THREE\.Box3\(\)\.setFromObject\(model\)/);
  assert.match(scene, /model\.position\.y -= visibleBottom/);
  assert.match(scene, /pedestal\.position\.set\(\s*hotspot\.position\[0\],\s*seabedHeight\(hotspot\.position\[0\], hotspot\.position\[2\]\) \+ 0\.02,\s*hotspot\.position\[2\],\s*\)/);
  assert.match(scene, /const lowFlatDisplayBase =/);
  assert.doesNotMatch(scene, /pedestal\.position\.set\(\.\.\.hotspot\.position\)/);
});

test("uses a lighter field objective type hierarchy", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v24 - clean field objective type hierarchy/);
  assert.match(css, /\.field-lesson strong\s*{[\s\S]*?font-weight: 360/);
  assert.match(css, /\.field-lesson strong\s*{[\s\S]*?letter-spacing: 0/);
  assert.match(css, /\.field-lesson p\s*{[\s\S]*?font-weight: 300/);
  assert.match(css, /\.field-lesson > small\s*{[\s\S]*?font-size: clamp\(12px, 1vw, 15px\)/);
});

test("keeps the main intro modal near half the page width", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v25 - half-page intro modal/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?width: min\(960px, 50vw\)/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?max-height: min\(720px, calc\(100vh - 96px\)\)/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?font-size: clamp\(42px, 4\.4vw, 76px\)/);
  assert.match(css, /\.entry-actions\s*{[\s\S]*?margin-top: clamp\(28px, 3vw, 42px\)/);
  assert.match(css, /@media \(max-width: 1100px\)[\s\S]*?\.entry-actions\s*{[\s\S]*?grid-template-columns: 1fr/);
});

test("uses a sleek rail-only timeline selection", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v26 - sleek mapped timeline rail/);
  assert.match(css, /\.time-current\s*{[\s\S]*?height: 62px/);
  assert.match(css, /\.time-current nav::before,[\s\S]*?\.time-current nav::after\s*{[\s\S]*?top: 18px/);
  assert.match(css, /\.time-current nav button,[\s\S]*?\.time-current nav button\.is-active\s*{[\s\S]*?background: transparent/);
  assert.match(css, /\.time-current nav button::after,[\s\S]*?\.time-current nav button\.is-active::after\s*{[\s\S]*?content: none/);
  assert.match(css, /\.time-current nav button i\s*{[\s\S]*?transform: translateY\(4px\)/);
  assert.match(css, /\.timeline-metrics,[\s\S]*?\.timeline-metrics span,[\s\S]*?\.timeline-metrics b\s*{[\s\S]*?font-family: var\(--reef-ui-font\)/);
});

test("keeps the time current dots distributed across the full rail", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v31 - stable full-width time current rail/);
  assert.match(css, /\.time-current\s*{[\s\S]*?display: grid/);
  assert.match(css, /\.time-current nav\s*{[\s\S]*?display: grid !important/);
  assert.match(css, /\.time-current nav\s*{[\s\S]*?grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.time-current nav\s*{[\s\S]*?width: 100%/);
  assert.match(css, /\.time-current nav button::before\s*{[\s\S]*?content: none !important/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*?\.time-current\s*{[\s\S]*?grid-template-columns: 1fr/);
});

test("keeps the selected time current dot steady without a growing outer ring", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v33 - steady timeline orbs without pulsing outer rings/);
  assert.match(css, /\.time-current nav button i,[\s\S]*?\.time-current nav button\.is-active i\s*{[\s\S]*?animation: none !important/);
  assert.doesNotMatch(css.match(/v33 - steady timeline orbs[\s\S]*$/)?.[0] ?? "", /0 0 0 10px/);
  assert.match(css, /\.time-current nav button i::before,[\s\S]*?\.time-current nav button i::after\s*{[\s\S]*?content: none !important/);
});

test("uses disciplined HUD spacing with softer corners", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v27 - disciplined HUD spacing and softer corners/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?width: min\(760px, calc\(100vw - 48px\)\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?border-radius: 20px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 48px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?border-radius: 14px/);
  assert.match(css, /\.time-current\s*{[\s\S]*?height: 58px/);
  assert.match(css, /\.timeline-metrics span\s*{[\s\S]*?border-radius: 12px/);
});

test("keeps water ambience free of straight line overlays", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const surfaceGlints = new THREE\.Points/);
  assert.match(scene, /const surfaceReflectionTexture = new THREE\.CanvasTexture\(reflectionCanvas\)/);
  assert.match(scene, /const surfaceReflections = new THREE\.Mesh/);
  assert.match(scene, /surfaceReflectionTexture\.offset\.x/);
  assert.match(scene, /surfaceReflectionMaterial\.opacity/);
  assert.doesNotMatch(scene, /surfaceRipples/);
  assert.doesNotMatch(scene, /new THREE\.LineSegments/);
  assert.doesNotMatch(scene, /new THREE\.LineBasicMaterial/);
});

test("keeps colony reticles steady without the green glow state", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v34 - quiet colony markers without alternating green glow/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?animation: none !important/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?background: transparent/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?box-shadow: none/);
  assert.match(css, /\.reef-scene__marker\.is-mapped \.reef-scene__reticle i svg\s*{[\s\S]*?display: none/);
});

test("scopes scanned coral and animal models to researched reef regions", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /sensitivity: 0\.96/);
  assert.match(scene, /recovery: 0\.7/);
  assert.match(scene, /"great-barrier": makeAmbientScanColonies\("gbr"/);
  assert.doesNotMatch(scene, /"great-barrier": AMBIENT_SCAN_COLONIES/);
  assert.match(scene, /"caribbean-reef": \[/);
  assert.match(scene, /smithsonian-lactophrys-bicaudalis\.glb/);
  assert.match(scene, /"coral-triangle": \[/);
  assert.match(scene, /smithsonian-linckia-laevigata\.glb/);
  assert.match(scene, /scanKey: ScanAssetKey/);
});

test("uses DHW-informed timeline and species-specific bleaching response", async () => {
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(data, /title: "Recovery watch"/);
  assert.match(data, /phase: "heat"/);
  assert.match(data, /title: "Low-stress scenario"/);
  assert.match(data, /DHW near 4 can trigger bleaching/);
  assert.match(scene, /pressure: 0\.68/);
  assert.match(scene, /currentPhase\.pressure \* profile\.sensitivity/);
  assert.match(scene, /profile\.recovery \* 0\.16/);
  assert.match(scene, /currentPhase\.structureLoss \* \(profile\?\.sensitivity/);
});

test("keeps the live mission masthead compact and aligned", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /<span>REEF RELAY<\/span>/);
  assert.doesNotMatch(page, /REEF RELAY<small>Living Reef Lab<\/small>/);
  assert.match(page, /EXPEDITION 01 · \{selected \? selected\.zone : activeWorld\.expedition\}/);
  assert.match(page, /MOVE FREELY · SELECT A RESEARCH-BASED COLONY/);
  assert.match(css, /v28 - compact aligned mission masthead/);
  assert.match(css, /\.mission-brand span\s*{[\s\S]*?font-weight: 360/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?top: clamp\(76px, 8vh, 98px\)/);
  assert.match(css, /\.sub-title strong\s*{[\s\S]*?font-weight: 360/);
});

test("keeps the objective card small and the center masthead refined", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v35 - compact objective card and refined mission hierarchy/);
  assert.match(css, /\.mission-bar\s*{[\s\S]*?grid-template-columns: minmax\(220px, 0\.86fr\) minmax\(420px, auto\) minmax\(220px, 0\.86fr\)/);
  assert.match(css, /\.mission-brand span\s*{[\s\S]*?font-size: clamp\(38px, 3\.8vw, 62px\)/);
  assert.match(css, /\.mission-brand span\s*{[\s\S]*?font-weight: 300/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?width: min\(860px, calc\(100vw - 620px\)\)/);
  assert.match(css, /\.sub-title strong\s*{[\s\S]*?font-weight: 300/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?width: min\(300px, 20vw\)/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?max-height: min\(440px, calc\(100vh - 310px\)\)/);
  assert.match(css, /\.field-lesson strong\s*{[\s\S]*?font-size: clamp\(20px, 1\.55vw, 27px\)/);
});

test("turns every scanned coral into a clickable evolving library entry", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");
  const library = await readFile(new URL("../app/components/CoralLibrary.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(data, /export type Tool = "scan" \| "mark" \| "note" \| "restore" \| "library"/);
  assert.match(data, /export const createLibraryColonyFromHotspot/);
  assert.match(scene, /export const BIOME_AMBIENT_SCAN_COLONIES/);
  assert.match(scene, /interactiveHotspotIds/);
  assert.match(scene, /\.filter\(\(hotspot\) => !interactiveHotspotIds\.has\(hotspot\.id\)\)/);
  assert.match(page, /BIOME_AMBIENT_SCAN_COLONIES/);
  assert.match(page, /new globalThis\.Map/);
  assert.match(page, /createLibraryColonyFromHotspot\(hotspot, activeWorld\)/);
  assert.match(page, /hotspots=\{activeColonies\}/);
  assert.match(page, /sceneMappedIds/);
  assert.match(page, /\["library", BookOpen, "Library"\]/);
  assert.match(page, /<CoralLibrary/);
  assert.match(library, /Coral Library/);
  assert.match(library, /Unscanned/);
  assert.match(library, /Discovered/);
  assert.match(css, /v29 - evolving coral library/);
  assert.match(css, /\.coral-library\s*{/);
});
