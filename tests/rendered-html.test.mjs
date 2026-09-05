import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Reef Relay production worker and client", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/client/reef-entry-v4.webp", import.meta.url));
  await access(new URL("../dist/client/reef-cockpit-v2.png", import.meta.url));
  await access(new URL("../dist/client/models/acropora-hyacinthus.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-acropora-palmata.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-acropora-cervicornis.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-linckia-laevigata.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-tubipora-musica.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-tridacna-squamosa.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-chonelasma-oreia.glb", import.meta.url));
  await access(new URL("../dist/client/models/smithsonian-endoxocrinus-parrae.glb", import.meta.url));
  await access(new URL("../dist/client/models/polyhaven/rock_07/rock_07_1k.gltf", import.meta.url));
  await access(new URL("../dist/client/models/polyhaven/stone_01/stone_01_1k.gltf", import.meta.url));
});

test("publishes truthful product metadata and preview contract", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(layout, /Reef Relay — The Living City/);
  assert.match(layout, /"codex-preview": "development"/);
  assert.match(layout, /reef-cockpit-v2\.png/);
  assert.doesNotMatch(layout, /reef-entry-v4\.webp/);
  assert.match(page, /fallbackSrc="\/reef-cockpit-v2\.png"/);
  assert.match(scene, /fallbackSrc = "\/reef-cockpit-v2\.png"/);
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
  assert.match(data, /scan: "acropora-cervicornis"/);
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
  assert.match(scene, /event\.code === "Space"/);
  assert.match(scene, /event\.code === "AltLeft" \|\| event\.code === "AltRight"/);
  assert.match(scene, /nav\.keys\.has\("e"\) \|\| nav\.keys\.has\("space"\)/);
  assert.match(scene, /nav\.keys\.has\("q"\) \|\| nav\.keys\.has\("alt"\)/);
  assert.match(scene, /vertical \* 3\.6/);
});

test("updates the visible depth readout from live vertical movement", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(page, /const \[diveDepth, setDiveDepth\] = useState\("22 m"\)/);
  assert.match(page, /onZoneChange=\{\(_, depth\) => setDiveDepth\(depth\)\}/);
  assert.match(page, /<strong>\{diveDepth\}<\/strong>/);
  assert.match(scene, /const MIN_DIVE_DEPTH_METERS = 10/);
  assert.match(scene, /const DEPTH_METERS_PER_WORLD_UNIT = 0\.65/);
  assert.match(scene, /depth: ""/);
  assert.match(scene, /const nominalDepth = Math\.max\(\s*MIN_DIVE_DEPTH_METERS,\s*Number\.parseFloat\(nextZone\.depth\) \|\| 18,\s*\)/);
  assert.match(scene, /const maxHeightAboveSeabed =\s*\(nominalDepth - MIN_DIVE_DEPTH_METERS\) \/ DEPTH_METERS_PER_WORLD_UNIT/);
  assert.match(scene, /const surfaceLimitedY = Math\.min\(\s*WORLD_BOUNDS\.yMax,\s*terrainY \+ Math\.max\(0, maxHeightAboveSeabed\),\s*\)/);
  assert.match(scene, /Math\.max\(WORLD_BOUNDS\.yMin, surfaceLimitedY\)/);
  assert.match(scene, /const heightAboveSeabed = Math\.max\(0, camera\.position\.y - terrainY\)/);
  assert.match(scene, /Math\.round\(nominalDepth - heightAboveSeabed \* DEPTH_METERS_PER_WORLD_UNIT\)/);
  assert.match(scene, /MIN_DIVE_DEPTH_METERS,\s*36/);
  assert.match(scene, /Bendera Bay reef flat", depth: "10 m"/);
  assert.match(scene, /Elkhorn reef crest", depth: "10 m"/);
  assert.match(scene, /callbacksRef\.current\.onZoneChange\?\.\(nextZone\.name, liveDepthLabel\)/);
});

test("starts every reef dive inside the coral field", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const BIOME_SPAWNS: Record/);
  assert.match(scene, /"great-barrier": \{ x: -6, z: -122, height: 6\.4/);
  assert.match(scene, /"sisters-islands": \{ x: -4, z: -128, height: 6/);
  assert.match(scene, /"coral-triangle": \{ x: -8, z: -174, height: 6\.6/);
  assert.match(scene, /"caribbean-reef": \{ x: 4, z: -142, height: 6\.2/);
  assert.match(scene, /camera\.position\.set\(\s*spawn\.x,\s*seabedHeight\(spawn\.x, spawn\.z\) \+ spawn\.height,\s*spawn\.z,\s*\)/);
  assert.match(scene, /const spawnDirection = new THREE\.Vector3\(\)/);
  assert.match(scene, /yaw: Math\.atan2\(-spawnDirection\.x, -spawnDirection\.z\)/);
  assert.match(scene, /const look = spawnLookAt\.clone\(\)/);
  assert.doesNotMatch(scene, /camera\.position\.set\(0, 5\.2, 17\)/);
});

test("sculpts visible biome terrain instead of a flat seabed", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const basin = biomeConfig\.clusters\.reduce/);
  assert.match(scene, /const microRelief =/);
  assert.match(scene, /basin \* 0\.82/);
  assert.match(scene, /const shoals =/);
  assert.match(scene, /const limestoneSteps =/);
  assert.match(scene, /wallDrop = -Math\.max\(0, \(-z - 210\) \/ 210\) \* 3\.35/);
  assert.match(scene, /floorPosition\.setXYZ\(index, x, seabedHeight\(x, z\), z\)/);
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
  assert.match(css, /v40 - sourced briefing icons/);
  assert.match(css, /\.briefing-points i\s*{[\s\S]*?background: transparent/);
  assert.match(css, /\.briefing-points i\s*{[\s\S]*?box-shadow: none/);
  await access(new URL("../public/icons/reef-find-colonies.png", import.meta.url));
  await access(new URL("../public/icons/reef-shape-first.png", import.meta.url));
  await access(new URL("../public/icons/reef-evidence-id.png", import.meta.url));
  const sourcedIcon = await readFile(new URL("../public/icons/reef-find-colonies.svg", import.meta.url), "utf8");
  assert.match(sourcedIcon, /icon-tabler/);
  assert.match(sourcedIcon, /reefIconStroke/);
  await access(new URL("../public/icons/TABLER_ICONS_MIT.md", import.meta.url));
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
  assert.match(scene, /polyhaven\/rock_07\/rock_07_1k\.gltf/);
  assert.match(scene, /polyhaven\/stone_01\/stone_01_1k\.gltf/);
  assert.match(scene, /smithsonian-tubipora-musica\.glb/);
  assert.match(scene, /smithsonian-tridacna-squamosa\.glb/);
  assert.match(scene, /smithsonian-chonelasma-oreia\.glb/);
  assert.match(scene, /smithsonian-endoxocrinus-parrae\.glb/);
  assert.match(scene, /const makeSeagrassShootGeometry = \(\) =>/);
  assert.match(scene, /const makeKelpStipeGeometry = \(\) =>/);
  assert.match(scene, /const makeSeaFanStemGeometry = \(\) =>/);
  assert.match(scene, /const makeBranchingPolypGeometry = \(\) =>/);
  assert.match(scene, /countFor\(230, 92, biomeConfig\.rockDensity \* 0\.72\)/);
  assert.match(scene, /countFor\(980, 420, biomeConfig\.rockDensity \+ biomeConfig\.coralHeadDensity \* 0\.62\)/);
  assert.match(scene, /countFor\(980, 380, biomeConfig\.grassDensity \* 0\.78\)/);
  assert.match(scene, /countFor\(270, 110, biomeConfig\.kelpDensity \* 0\.72\)/);
  assert.match(scene, /countFor\(215, 86, biomeConfig\.seaFanDensity \* 0\.72\)/);
  assert.match(scene, /countFor\(720, 290, biomeConfig\.softPolypDensity \* 0\.82\)/);
  assert.match(scene, /smithsonian-linckia-laevigata\.glb/);
  assert.doesNotMatch(scene, /const makeBladeGeometry =/);
  assert.doesNotMatch(scene, /new THREE\.PlaneGeometry\(1, 1\.8, 1, 5\)/);
  assert.doesNotMatch(scene, /new THREE\.IcosahedronGeometry\(1, 1\)/);
  assert.doesNotMatch(scene, /new THREE\.DodecahedronGeometry\(1, 1\)/);
  assert.doesNotMatch(scene, /const coralHeads = new THREE\.InstancedMesh/);
  assert.doesNotMatch(scene, /new THREE\.SphereGeometry\(1, 16, 8, 0, Math\.PI \* 2, 0, Math\.PI \/ 2\)/);
});

test("anchors scan colonies to the seabed instead of fixed floating heights", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /SCAN_MOUNT_PROFILES/);
  assert.match(scene, /"heliopora-blue": \{ displayScale: 0\.56/);
  assert.match(scene, /const scanDisplaySize = \(hotspot: ReefSceneHotspot\)/);
  assert.match(scene, /const hotspotMarkerLifts = new Map<string, number>\(\)/);
  assert.match(scene, /filterDarkDisplayBase/);
  assert.match(scene, /displayBaseLuma/);
  assert.match(scene, /discard/);
  assert.match(scene, /model\.scale\.multiplyScalar\(mount\.displayScale\)/);
  assert.match(scene, /const groundedBounds = new THREE\.Box3\(\)\.setFromObject\(model\)/);
  assert.match(scene, /model\.position\.y -= visibleBottom/);
  assert.match(scene, /model\.position\.y -= mount\?\.settle \?\? 0/);
  assert.match(scene, /hotspotMarkerLifts\.set\(hotspot\.id, markerLift\)/);
  assert.match(scene, /pedestal\.position\.set\(\s*hotspot\.position\[0\],\s*seabedHeight\(hotspot\.position\[0\], hotspot\.position\[2\]\) \+ 0\.02,\s*hotspot\.position\[2\],\s*\)/);
  assert.match(scene, /const focusSize = scanDisplaySize\(focused\)/);
  assert.match(scene, /hotspotMarkerLifts\.get\(hotspot\.id\) \?\?/);
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

test("keeps the intro modal visually half its previous size", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v52 - truly half-size intro modal/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?width: min\(480px, 46vw\) !important/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?max-height: min\(560px, calc\(100vh - 72px\)\) !important/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?padding: clamp\(20px, 2\.1vw, 28px\) !important/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?font-size: clamp\(25px, 2\.35vw, 38px\) !important/);
  assert.match(css, /\.expedition-entry p\s*{[\s\S]*?font-size: clamp\(11px, 0\.88vw, 14px\) !important/);
  assert.match(css, /\.begin-button,[\s\S]*?\.expedition-entry form\s*{[\s\S]*?min-height: clamp\(38px, 3\.2vw, 46px\) !important/);
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

test("uses balanced normal timeline dots without shine reflections", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v41 - balanced quiet timeline markers/);
  assert.match(css, /\.time-current nav\s*{[\s\S]*?padding-inline: var\(--timeline-edge\)/);
  assert.match(css, /\.time-current nav::before,[\s\S]*?\.time-current nav::after\s*{[\s\S]*?left: var\(--timeline-edge\)/);
  assert.match(css, /\.time-current nav::after\s*{[\s\S]*?animation: none !important/);
  assert.match(css, /\.time-current nav button\s*{[\s\S]*?grid-template-rows: 30px 1fr/);
  assert.match(css, /\.time-current nav button i,[\s\S]*?\.time-current nav button\.is-active i\s*{[\s\S]*?transform: none !important/);
  assert.match(css, /\.time-current nav button i::before,[\s\S]*?\.time-current nav button i::after\s*{[\s\S]*?display: none !important/);
});

test("uses disciplined HUD spacing with softer corners", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v27 - disciplined HUD spacing and softer corners/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /v36 - tighter compact tool dock/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?width: min\(680px, calc\(100vw - 48px\)\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?gap: clamp\(3px, 0\.45vw, 6px\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?padding: 4px/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?border-radius: 18px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 40px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?padding: 4px 8px 3px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?border-radius: 12px/);
  assert.match(css, /v37 - compact lower stress trigger/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?bottom: clamp\(86px, 10\.5vh, 118px\)/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?min-height: 38px/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?padding-inline: 16px/);
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

test("renders surface reflection effects on the underside of the water", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /const surfaceReflectionMaterial = new THREE\.MeshBasicMaterial/);
  assert.match(scene, /side: THREE\.BackSide/);
  assert.match(scene, /opacity: lowPower \? 0\.12 : 0\.18/);
  assert.match(scene, /surfaceReflections\.position\.set\(0, biomeConfig\.waterY - 0\.08, FLOOR_CENTER_Z \+ 20\)/);
  assert.doesNotMatch(scene, /side: THREE\.DoubleSide,[\s\S]*?\}\);\s*const surfaceReflections = new THREE\.Mesh/);
});

test("flips the water surface and underside ripples upside down", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /waterNormals\.center\.set\(0\.5, 0\.5\)/);
  assert.match(scene, /waterNormals\.rotation = Math\.PI/);
  assert.match(scene, /water\.rotation\.set\(-Math\.PI \/ 2, Math\.PI, 0\)/);
  assert.match(scene, /surfaceReflectionTexture\.center\.set\(0\.5, 0\.5\)/);
  assert.match(scene, /surfaceReflectionTexture\.rotation = Math\.PI/);
  assert.match(scene, /surfaceReflections\.rotation\.set\(-Math\.PI \/ 2, Math\.PI, 0\)/);
});

test("keeps colony reticles steady without the green glow state", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v34 - quiet colony markers without alternating green glow/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?animation: none !important/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?background: transparent/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?box-shadow: none/);
  assert.match(css, /\.reef-scene__marker\.is-mapped \.reef-scene__reticle i svg\s*{[\s\S]*?display: none/);
});

test("uses a small transparent plus reticle for coral targets", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v46 - compact transparent colony plus reticle/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?width: 34px/);
  assert.match(css, /\.reef-scene__reticle,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle\s*{[\s\S]*?background: rgb\(255 255 255 \/ 0\.055\)/);
  assert.match(css, /\.reef-scene__reticle::before\s*{[\s\S]*?width: 22px/);
  assert.match(css, /\.reef-scene__reticle::after\s*{[\s\S]*?height: 22px/);
  assert.match(css, /\.reef-scene__reticle i,[\s\S]*?\.reef-scene__marker\.is-mapped \.reef-scene__reticle i\s*{[\s\S]*?width: 0/);
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

test("gives each reef region a distinct researched habitat signature", async () => {
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(scene, /rockColor: 0x6f7768/);
  assert.match(scene, /rockColor: 0x5e6857/);
  assert.match(scene, /rockColor: 0x4e625c/);
  assert.match(scene, /rockColor: 0x777062/);
  assert.match(scene, /spongeHue: 0\.13/);
  assert.match(scene, /seaFanHue: 0\.78/);
  assert.match(scene, /fishCruiseHeight: \[2\.5, 5\.8\]/);
  assert.match(scene, /fishCruiseHeight: \[4\.1, 9\.8\]/);
  assert.match(scene, /biomeConfig\.spongeHue \+ random\(\) \* 0\.055/);
  assert.match(scene, /biomeConfig\.benthicOpacity/);
  assert.match(scene, /biomeConfig\.reefLifeSize/);
  assert.match(scene, /const particleColor = biomeConfig\.terrain === "turbid-lagoon"/);
  assert.match(scene, /height: biomeConfig\.fishCruiseHeight\[0\] \+ random\(\) \* \(biomeConfig\.fishCruiseHeight\[1\] - biomeConfig\.fishCruiseHeight\[0\]\)/);
  assert.match(scene, /"sisters-islands": \[[\s\S]*?smithsonian-chonelasma-oreia\.glb[\s\S]*?count: countFor\(22, 9, 1\)/);
  assert.match(scene, /"coral-triangle": \[[\s\S]*?smithsonian-tridacna-squamosa\.glb[\s\S]*?count: countFor\(18, 7, 1\)/);
  assert.match(scene, /"caribbean-reef": \[[\s\S]*?smithsonian-lactophrys-bicaudalis\.glb/);
});

test("uses DHW-informed timeline and species-specific bleaching response", async () => {
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(data, /title: "Recovery watch"/);
  assert.match(data, /phase: "heat"/);
  assert.match(data, /title: "Low-stress scenario"/);
  assert.match(data, /DHW near 4 can trigger bleaching/);
  assert.match(scene, /pressure: 0\.68/);
  assert.match(scene, /visiblePhase\.pressure \* profile\.sensitivity/);
  assert.match(scene, /profile\.recovery \* 0\.16/);
  assert.match(scene, /visiblePhase\.structureLoss \* \(profile\?\.sensitivity/);
  assert.match(scene, /const visiblePhase =/);
  assert.match(scene, /visiblePhase\.pressure = THREE\.MathUtils\.lerp\(visiblePhase\.pressure, currentPhase\.pressure, phaseEase\)/);
  assert.match(scene, /transitionLag: 0\.62 \+ random\(\) \* 0\.72/);
});

test("keeps the live mission masthead compact and aligned", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(page, /className="mission-brand"/);
  assert.doesNotMatch(page, /REEF RELAY<small>Living Reef Lab<\/small>/);
  assert.match(page, /className="sub-title__brand"/);
  assert.match(page, /<strong>REEF RELAY<\/strong>/);
  assert.match(page, /className="sub-title__stack"/);
  assert.match(page, /<span>EXPEDITION 01<\/span>/);
  assert.doesNotMatch(page, /SCAN · SELECT ANY COLONY TO OPEN ITS EVIDENCE CARD/);
  assert.match(css, /v28 - compact aligned mission masthead/);
  assert.match(css, /v51 - editorial live masthead lockup/);
  assert.match(css, /v54 - remove duplicate story masthead and timeline clutter/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?grid-template-columns: auto minmax\(170px, 1fr\)/);
  assert.match(css, /\.sub-title__brand strong\s*{[\s\S]*?font-weight: 320/);
});

test("keeps the objective card small and the center masthead refined", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v35 - compact objective card and refined mission hierarchy/);
  assert.match(css, /v38 - compact live reef relay heading/);
  assert.match(css, /\.mission-bar\s*{[\s\S]*?grid-template-columns: minmax\(220px, 0\.82fr\) minmax\(220px, 0\.82fr\) !important/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?top: clamp\(58px, 6\.4vh, 76px\)/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?width: min\(860px, calc\(100vw - 620px\)\)/);
  assert.match(css, /\.sub-title strong\s*{[\s\S]*?font-weight: 300/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?width: min\(300px, 20vw\)/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?max-height: min\(440px, calc\(100vh - 310px\)\)/);
  assert.match(css, /\.field-lesson strong\s*{[\s\S]*?font-size: clamp\(20px, 1\.55vw, 27px\)/);
});

test("fits the field objective copy into a compact corner panel", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v42 - compact corner objective copy fit/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?width: min\(270px, 18vw\)/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?max-height: min\(388px, calc\(100vh - 250px\)\)/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?padding: 14px 15px 13px/);
  assert.match(css, /\.field-lesson\s*{[\s\S]*?overflow-y: auto/);
  assert.match(css, /\.field-lesson::-webkit-scrollbar\s*{[\s\S]*?display: none/);
  assert.match(css, /\.field-lesson strong\s*{[\s\S]*?font-size: clamp\(17px, 1\.18vw, 22px\)/);
  assert.match(css, /\.field-lesson p\s*{[\s\S]*?font-size: clamp\(10\.5px, 0\.76vw, 13px\)/);
  assert.match(css, /\.field-lesson li\s*{[\s\S]*?line-height: 1\.28/);
});

test("keeps the living city selector compact and less white", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v43 - slimmer darker living-city selector/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?width: min\(430px, calc\(100vw - 44px\)\)/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?max-height: min\(610px, calc\(100vh - 140px\)\)/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?padding: 12px/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?rgb\(3 15 18 \/ 0\.34\)/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?padding: 14px 16px/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?font-size: clamp\(19px, 1\.5vw, 24px\)/);
  assert.match(css, /\.world-drawer > button em\s*{[\s\S]*?max-width: 42ch/);
  assert.match(css, /v48 - compact living-city drawer copy/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?width: min\(360px, calc\(100vw - 40px\)\)/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?max-height: min\(480px, calc\(100vh - 124px\)\)/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?padding: 10px 12px/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?font-size: clamp\(15px, 1\.06vw, 18px\)/);
  assert.match(css, /\.world-drawer > button small\s*{[\s\S]*?font-size: clamp\(8\.5px, 0\.62vw, 10px\)/);
  assert.match(css, /\.world-drawer > button em\s*{[\s\S]*?max-width: 34ch/);
});

test("keeps the living-city drawer readable without clipped edges", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v53 - cleaner living-city drawer copy and spacing/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?top: clamp\(82px, 10vh, 104px\) !important/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?width: min\(520px, calc\(100vw - 72px\)\) !important/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?max-height: min\(560px, calc\(100vh - 132px\)\) !important/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?padding: 12px 12px 18px !important/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?font-size: clamp\(18px, 1\.22vw, 21px\) !important/);
  assert.match(css, /\.world-drawer > button small\s*{[\s\S]*?font-size: clamp\(9px, 0\.62vw, 11px\) !important/);
  assert.match(css, /\.world-drawer > button em\s*{[\s\S]*?max-width: none !important/);
  assert.match(css, /\.world-drawer > button em\s*{[\s\S]*?font-size: clamp\(8\.5px, 0\.56vw, 10px\) !important/);
});

test("turns every scanned coral into a clickable evolving library entry", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");
  const library = await readFile(new URL("../app/components/CoralLibrary.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(data, /export type Tool = "scan" \| "mark" \| "note" \| "restore" \| "library" \| "story"/);
  assert.match(data, /export const createLibraryColonyFromHotspot/);
  assert.match(scene, /export const BIOME_AMBIENT_SCAN_COLONIES/);
  assert.match(scene, /interactiveHotspotIds/);
  assert.match(scene, /\.filter\(\(hotspot\) => !interactiveHotspotIds\.has\(hotspot\.id\)\)/);
  assert.match(page, /BIOME_AMBIENT_SCAN_COLONIES/);
  assert.match(page, /new globalThis\.Map/);
  assert.match(page, /createLibraryColonyFromHotspot\(hotspot, activeWorld\)/);
  assert.match(page, /hotspots=\{activeColonies\}/);
  assert.match(page, /sceneMappedIds/);
  assert.match(page, /!selected && tool !== "story" && tool !== "library"/);
  assert.match(page, /\["library", BookOpen, "Library"\]/);
  assert.match(page, /<CoralLibrary/);
  assert.match(library, /Coral Library/);
  assert.match(library, /Unscanned/);
  assert.match(library, /Discovered/);
  assert.match(css, /v29 - evolving coral library/);
  assert.match(css, /\.coral-library\s*{/);
});

test("provides a full scan mark note restore user flow", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const monitor = await readFile(new URL("../app/components/SpecimenMonitor.tsx", import.meta.url), "utf8");
  const library = await readFile(new URL("../app/components/CoralLibrary.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /type FieldRecord =/);
  assert.match(page, /const \[fieldRecords, setFieldRecords\]/);
  assert.match(page, /const markColony = \(colony: Colony\) =>/);
  assert.match(page, /const restoreColony = \(colony: Colony\) =>/);
  assert.match(page, /if \(activeTool === "mark"\)/);
  assert.match(page, /if \(activeTool === "note"\)/);
  assert.match(page, /if \(activeTool === "restore"\)/);
  assert.match(page, /Observation saved to the coral library/);
  assert.match(monitor, /specimen-status/);
  assert.match(monitor, /tool-card/);
  assert.match(monitor, /Mark health/);
  assert.match(monitor, /Restore preview/);
  assert.match(monitor, /saved-note/);
  assert.match(library, /coral-library__summary/);
  assert.match(library, /Noted/);
  assert.match(css, /v39 - actionable field workflow/);
});

test("adds an educational storytelling mode with free exploration exit", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");

  assert.match(data, /"story"/);
  assert.match(page, /const storySteps: StoryStep\[\] = \[/);
  assert.match(page, /anchorScans: \["acro-table", "agaricia-plate", "pavona-lettuce"\]/);
  assert.match(page, /\["story", Route, "Story"\]/);
  assert.match(page, /const \[storyStep, setStoryStep\]/);
  assert.match(page, /const storyColonyFor = \(index: number\) =>/);
  assert.match(page, /const activeStoryColony = storyColonyFor\(storyStep\)/);
  assert.match(page, /const storyFocusId = tool === "story" && !showBriefing/);
  assert.match(page, /setTool\("story"\)/);
  assert.match(page, /const chooseStoryStep = \(index: number\) =>/);
  assert.match(page, /Moving through the reef to/);
  assert.match(page, /const exitStory = \(\) =>/);
  assert.match(page, /Explore freely/);
  assert.match(page, /focusId=\{selected\?\.id \|\| storyFocusId\}/);
  assert.match(page, /guidedFocus=\{Boolean\(storyFocusId\)\}/);
  assert.match(page, /className="story-panel"/);
  assert.match(page, /className="story-panel__anchor"/);
  assert.match(page, /\["story", Route, "Story"\]/);
  assert.match(scene, /guidedFocus\?: boolean/);
  assert.match(scene, /guidedFocusRef/);
  assert.match(scene, /nav\.focusTransit = 1/);
  assert.match(scene, /const travelArc = isGuidedFocus \? Math\.sin\(nav\.focusTransit \* Math\.PI\) : 0/);
  assert.match(css, /v44 - educational story mode with free exploration exit/);
  assert.match(css, /v49 - coral-anchored story tour/);
  assert.match(css, /\.story-panel\s*{/);
  assert.match(css, /\.story-panel__anchor\s*{/);
  assert.match(css, /\.reef-scene__marker\.is-focused \.reef-scene__reticle::before/);
  assert.doesNotMatch(page, /className="story-panel__rail"/);
  assert.match(css, /\.story-panel__rail\s*{[\s\S]*?display: none !important/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);
});

test("keeps onboarding drifting through the reef with a calmer centered masthead", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /ambientDrift=\{showBriefing\}/);
  assert.match(scene, /ambientDrift\?: boolean/);
  assert.match(scene, /ambientDriftRef/);
  assert.match(scene, /nav\.yaw \+= delta \* 0\.026/);
  assert.match(scene, /desired\.addScaledVector\(direction, 1\.05\)/);
  assert.match(css, /v47 - quiet unified glass system and onboarding reef drift/);
  assert.match(css, /--reef-glass-bg:/);
  assert.match(css, /v54 - remove duplicate story masthead and timeline clutter/);
  assert.match(css, /\.world-button,[\s\S]*?\.note-form button\s*{[\s\S]*?background: var\(--reef-glass-bg\)/);
  assert.match(css, /\.mission-briefing\s*{[\s\S]*?rgb\(4 24 31 \/ 0\.42\)/);
});

test("uses a left-brand live masthead without tool instruction copy", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /className="sub-title__brand"/);
  assert.match(page, /<strong>REEF RELAY<\/strong>/);
  assert.match(page, /className="sub-title__stack"/);
  assert.match(page, /<span>EXPEDITION 01<\/span>/);
  assert.doesNotMatch(page, /SCAN · SELECT ANY COLONY/);
  assert.doesNotMatch(page, /toolDirections/);
  assert.match(css, /v51 - editorial live masthead lockup/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?grid-template-columns: auto minmax\(170px, 1fr\)/);
  assert.match(css, /\.sub-title__brand strong\s*{[\s\S]*?font-size: clamp\(34px, 4\.4vw, 70px\)/);
  assert.match(css, /\.sub-title__stack\s*{[\s\S]*?border-left: 1px solid rgb\(255 255 255 \/ 0\.2\)/);
});

test("keeps the bottom research dock near half width", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v45 - half-width research tool dock/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?width: min\(50vw, 760px\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?min-width: 560px/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 39px/);
  assert.match(css, /\.tool-console svg\s*{[\s\S]*?width: 16px/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*?\.tool-console\s*{[\s\S]*?width: min\(620px, calc\(100vw - 36px\)\)/);
  assert.match(css, /v50 - aligned compact lower HUD edges/);
  assert.match(css, /--bottom-hud-width: min\(35vw, 532px\)/);
  assert.match(css, /--bottom-hud-right: calc\(100vw - \(var\(--bottom-hud-left\) \+ max\(var\(--bottom-hud-width\), var\(--bottom-hud-min\)\)\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?left: var\(--bottom-hud-left\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?width: var\(--bottom-hud-width\)/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 36px/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?right: max\(18px, var\(--bottom-hud-right\)\)/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?bottom: var\(--bottom-hud-bottom\)/);
  assert.match(css, /\.time-current\s*{[\s\S]*?right: max\(18px, var\(--bottom-hud-right\)\)/);
});

test("keeps specimen signals compact and aligned with calmer panels", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v55 - compact, calmer specimen signal spacing/);
  assert.match(css, /\.specimen-monitor\s*{[\s\S]*?display: grid !important/);
  assert.match(css, /\.specimen-monitor\s*{[\s\S]*?gap: 8px !important/);
  assert.match(css, /\.specimen-monitor\s*{[\s\S]*?width: min\(330px, calc\(100vw - 36px\)\) !important/);
  assert.match(css, /\.specimen-monitor::after,[\s\S]*?\.stress-menu::after\s*{[\s\S]*?display: none !important/);
  assert.match(css, /\.signal-button\s*{[\s\S]*?width: auto !important/);
  assert.match(css, /\.signal-button\s*{[\s\S]*?height: 34px !important/);
  assert.match(css, /\.signal-chart\s*{[\s\S]*?padding: 8px 9px 9px !important/);
  assert.match(css, /\.signal-chart \.recharts-responsive-container\s*{[\s\S]*?height: 86px !important/);
  assert.match(css, /\.evidence-card p,[\s\S]*?\.tool-card p,[\s\S]*?\.saved-note,[\s\S]*?\.signal-chart p,[\s\S]*?\.effect-note\s*{[\s\S]*?line-height: 1\.32 !important/);
});

test("keeps the top-right mission chips slim", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v56 - tighter top-right mission chips/);
  assert.match(css, /\.mission-room\s*{[\s\S]*?gap: 7px !important/);
  assert.match(css, /\.mission-room button,[\s\S]*?\.mission-room > strong\s*{[\s\S]*?height: 42px !important/);
  assert.match(css, /\.mission-room button,[\s\S]*?\.mission-room > strong\s*{[\s\S]*?padding: 0 13px !important/);
  assert.match(css, /\.mission-room button\s*{[\s\S]*?min-width: 118px !important/);
  assert.match(css, /\.mission-room > strong\s*{[\s\S]*?min-width: 70px !important/);
});

test("keeps the specimen header sticky above compact metric boxes", async () => {
  const monitor = await readFile(new URL("../app/components/SpecimenMonitor.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(monitor, /className="specimen-monitor__header"/);
  assert.match(css, /v57 - sticky specimen header and compact health metric boxes/);
  assert.match(css, /\.specimen-monitor__header\s*{[\s\S]*?position: sticky !important/);
  assert.match(css, /\.specimen-monitor__header\s*{[\s\S]*?top: 0 !important/);
  assert.match(css, /\.specimen-monitor__header button\s*{[\s\S]*?width: 30px !important/);
  assert.match(css, /\.specimen-monitor dl\s*{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
  assert.match(css, /\.specimen-monitor dl div\s*{[\s\S]*?align-content: space-between !important/);
});
