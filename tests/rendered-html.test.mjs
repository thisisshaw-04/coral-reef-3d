import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("builds the Reef Relay production worker and client", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/client/reef-entry-v4.webp", import.meta.url));
  await access(new URL("../dist/client/reef-cockpit-v2.png", import.meta.url));
  await access(new URL("../dist/client/reef-default-background.png", import.meta.url));
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

  const assetNames = await readdir(new URL("../dist/client/assets/", import.meta.url));
  const stylesheet = assetNames.find((name) => name.endsWith(".css"));
  assert.ok(stylesheet, "expected a compiled client stylesheet");
  const builtCss = await readFile(new URL(`../dist/client/assets/${stylesheet}`, import.meta.url), "utf8");
  assert.match(
    builtCss,
    /\.sub-title\{margin-inline:0!important;left:50%!important;right:auto!important;transform:none!important\}/,
  );
});

test("publishes truthful product metadata and preview contract", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(layout, /Reef Relay — The Living City/);
  assert.match(layout, /"codex-preview": "development"/);
  assert.match(layout, /reef-default-background\.png/);
  assert.doesNotMatch(layout, /reef-entry-v4\.webp/);
  assert.match(layout, /width: 1672, height: 941/);
  assert.match(page, /fallbackSrc="\/reef-default-background\.png"/);
  assert.match(scene, /fallbackSrc = "\/reef-default-background\.png"/);
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
  assert.match(scene, /const FREE_SWIM_SPEED = 9\.6/);
  assert.match(scene, /const FREE_SWIM_SHIFT_SPEED = 17\.2/);
  assert.match(scene, /const VERTICAL_SWIM_SPEED = 5\.4/);
  assert.match(scene, /nav\.keys\.has\("shift"\) \? FREE_SWIM_SHIFT_SPEED : FREE_SWIM_SPEED/);
  assert.match(scene, /event\.code === "Space"/);
  assert.match(scene, /event\.code === "AltLeft" \|\| event\.code === "AltRight"/);
  assert.match(scene, /nav\.keys\.has\("e"\) \|\| nav\.keys\.has\("space"\)/);
  assert.match(scene, /nav\.keys\.has\("q"\) \|\| nav\.keys\.has\("alt"\)/);
  assert.match(scene, /vertical \* VERTICAL_SWIM_SPEED/);
  assert.match(scene, /lifePositions\[offset \+ 1\] = lifeBase\[offset \+ 1\]/);
  assert.match(scene, /actor\.object\.scale\.setScalar\(actor\.baseScale\)/);
  assert.doesNotMatch(scene, /const buoyancy =/);
  assert.doesNotMatch(scene, /actor\.baseScale \* pulse/);
  assert.doesNotMatch(scene, /grass\.rotation\.z = reduced/);
  assert.doesNotMatch(scene, /kelp\.rotation\.z = reduced/);
  assert.doesNotMatch(scene, /seaFans\.rotation\.z = reduced/);
  assert.doesNotMatch(scene, /softPolyps\.rotation\.z = reduced/);
});

test("updates the visible depth readout from live vertical movement", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(page, /const \[diveDepth, setDiveDepth\] = useState\("22 m"\)/);
  assert.match(page, /onZoneChange=\{\(_, depth\) => setDiveDepth\(depth\)\}/);
  assert.match(page, /<strong>\{diveDepth\}<\/strong>/);
  assert.match(scene, /depth: ""/);
  assert.doesNotMatch(scene, /MIN_DIVE_DEPTH_METERS/);
  assert.doesNotMatch(scene, /maxHeightAboveSeabed/);
  assert.match(scene, /camera\.position\.y = THREE\.MathUtils\.clamp\(camera\.position\.y, WORLD_BOUNDS\.yMin, WORLD_BOUNDS\.yMax\)/);
  assert.match(scene, /const heightAboveSeabed = Math\.max\(0, camera\.position\.y - terrainY\)/);
  assert.match(scene, /Math\.round\(nominalDepth - heightAboveSeabed \* 0\.65\)/);
  assert.match(scene, /Math\.round\(nominalDepth - heightAboveSeabed \* 0\.65\),\s*2,\s*36/);
  assert.match(scene, /Bendera Bay reef flat", depth: "7 m"/);
  assert.match(scene, /Elkhorn reef crest", depth: "9 m"/);
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

test("keeps the entry and briefing modals visually half their previous size", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v52 - truly half-size entry and briefing modals/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?width: min\(480px, 46vw\) !important/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?max-height: min\(560px, calc\(100vh - 72px\)\) !important/);
  assert.match(css, /\.expedition-entry\s*{[\s\S]*?padding: clamp\(20px, 2\.1vw, 28px\) !important/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?font-size: clamp\(25px, 2\.35vw, 38px\) !important/);
  assert.match(css, /\.expedition-entry p\s*{[\s\S]*?font-size: clamp\(11px, 0\.88vw, 14px\) !important/);
  assert.match(css, /\.begin-button,[\s\S]*?\.expedition-entry form\s*{[\s\S]*?min-height: clamp\(38px, 3\.2vw, 46px\) !important/);
  assert.match(css, /\.mission-briefing\s*{[\s\S]*?width: min\(480px, 46vw\) !important/);
  assert.match(css, /\.mission-briefing\s*{[\s\S]*?max-height: min\(560px, calc\(100vh - 72px\)\) !important/);
  assert.match(css, /\.mission-briefing h2\s*{[\s\S]*?font-size: 30px !important/);
  assert.match(css, /\.briefing-points strong\s*{[\s\S]*?min-height: 84px !important/);
  assert.match(css, /\.mission-briefing footer\s*{[\s\S]*?grid-template-columns: 90px 1fr 90px !important/);
});

test("keeps the intro headline as two full-width lines", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /The ocean&apos;s living city\.[\s\S]*?<br \/>[\s\S]*?<em>Under your command\.<\/em>/);
  assert.match(css, /v58 - full-width two-line intro headline/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?max-width: none !important/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?width: 100% !important/);
  assert.match(css, /\.expedition-entry h1\s*{[\s\S]*?white-space: nowrap !important/);
  assert.match(css, /\.expedition-entry h1 em\s*{[\s\S]*?display: block !important/);
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

  assert.match(data, /title: "Recovery monitored"/);
  assert.match(data, /phase: "heat"/);
  assert.match(data, /title: "Lower-stress future"/);
  assert.match(data, /DHW near 4 can trigger bleaching/);
  assert.match(scene, /pressure: 0\.68/);
  assert.match(scene, /visiblePhase\.pressure \* profile\.sensitivity/);
  assert.match(scene, /profile\.recovery \* 0\.16/);
  assert.match(scene, /visiblePhase\.structureLoss \* \(profile\?\.sensitivity/);
  assert.match(scene, /const visiblePhase =/);
  assert.match(scene, /visiblePhase\.pressure = THREE\.MathUtils\.lerp\(visiblePhase\.pressure, targetPressure, phaseEase\)/);
  assert.match(scene, /transitionLag: 0\.62 \+ random\(\) \* 0\.72/);
});

test("keeps the live mission masthead compact and centered", async () => {
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
  assert.match(css, /v51 - centered compact mission lockup/);
  assert.match(css, /v54 - remove duplicate story masthead and timeline clutter/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?width: min\(240px, 12\.5vw\)/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?max-width: 12\.5vw/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?grid-template-columns: 1fr/);
  assert.match(css, /\.sub-title__brand strong\s*{[\s\S]*?font-size: clamp\(11px, 0\.9vw, 15px\)/);
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
  const data = await readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v53 - cleaner living-city drawer copy and spacing/);
  assert.match(page, /<small>REEF MAP<\/small>/);
  assert.match(page, /CHOOSE A CURATED REEF WORLD/);
  assert.match(page, /item\.menuSummary/);
  assert.match(page, /Worlds are distinct learning environments/);
  assert.doesNotMatch(page, /<em>\{item\.researchBasis\}<\/em>/);
  assert.match(data, /Australia · Open shelf · plate corals · clear water · 22 m/);
  assert.match(data, /Singapore · Turbid urban reef · boulders · soft light · 14 m/);
  assert.match(data, /Indonesia · Volcanic slope · bubble vents · dense shoals · 18 m/);
  assert.match(data, /Belize · Spur-and-groove · sea fans · sand channels · 16 m/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?top: clamp\(82px, 10vh, 104px\) !important/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?width: min\(460px, calc\(100vw - 72px\)\) !important/);
  assert.match(css, /\.world-drawer\s*{[\s\S]*?max-height: min\(560px, calc\(100vh - 132px\)\) !important/);
  assert.match(css, /\.world-drawer > button\s*{[\s\S]*?background:[\s\S]*?radial-gradient/);
  assert.match(css, /\.world-drawer > button small\s*{[\s\S]*?line-height: 1\.3 !important/);
  assert.match(css, /\.world-drawer__note\s*{[\s\S]*?font-size: 10px !important/);
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
  assert.match(css, /\.mission-briefing\s*{[\s\S]*?background: var\(--reef-glass-bg\)/);
});

test("uses a centered live masthead without tool instruction copy", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /className="sub-title__brand"/);
  assert.match(page, /<strong>REEF RELAY<\/strong>/);
  assert.match(page, /className="sub-title__stack"/);
  assert.match(page, /<span>EXPEDITION 01<\/span>/);
  assert.doesNotMatch(page, /SCAN · SELECT ANY COLONY/);
  assert.doesNotMatch(page, /toolDirections/);
  assert.match(css, /v51 - centered compact mission lockup/);
  assert.match(css, /\.sub-title\s*{[\s\S]*?top: clamp\(14px, 2vh, 22px\)/);
  assert.match(css, /\.sub-title__brand strong\s*{[\s\S]*?font-size: clamp\(11px, 0\.9vw, 15px\)/);
  assert.match(css, /\.sub-title__stack\s*{[\s\S]*?border-top: 1px solid rgb\(255 255 255 \/ 0\.2\)/);
});

test("centers the compact research dock above the full-width timeline", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /v45 - seven-action research tool dock/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 39px/);
  assert.match(css, /\.tool-console svg\s*{[\s\S]*?width: 16px/);
  assert.match(css, /v50 - aligned compact lower HUD/);
  assert.match(css, /--bottom-hud-edge: clamp\(16px, 2\.4vw, 34px\)/);
  assert.match(css, /--bottom-dock-width: min\(52vw, 820px\)/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?left: 50%[\s\S]*?right: auto/);
  assert.match(css, /\.tool-console\s*{[\s\S]*?width: var\(--bottom-dock-width\)[\s\S]*?translate: -50% 0/);
  assert.match(css, /\.tool-console button\s*{[\s\S]*?height: 36px/);
  assert.match(css, /\.stress-trigger\s*{[\s\S]*?right: calc\(\(100vw - var\(--bottom-dock-width\)\) \/ 2\)/);
  assert.match(css, /\.time-current\s*{[\s\S]*?left: var\(--bottom-hud-edge\)[\s\S]*?right: var\(--bottom-hud-edge\)/);
  assert.match(css, /\.mission-bar\s*{[\s\S]*?left: 50% !important[\s\S]*?transform: translateX\(-50%\) !important/);
  assert.doesNotMatch(css, /repeating-linear-gradient\(116deg/);
  assert.match(css, /--reef-glass-blur: blur\(30px\) saturate\(1\.2\) brightness\(1\.06\)/);
});

test("uses a playable labeled reef timeline in the frosted glass HUD", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const \[isTimelinePlaying, setIsTimelinePlaying\] = useState\(false\)/);
  assert.match(page, /const toggleTimelinePlayback = \(\) =>/);
  assert.match(page, /className="timeline-play"/);
  assert.match(page, /isTimelinePlaying \? <Pause \/> : <Play \/>/);
  assert.match(page, /<b>{moment\.year}<\/b>[\s\S]*?<small>{moment\.title}<\/small>/);
  assert.match(css, /v59 - playable labeled timeline in frosted glass/);
  assert.match(css, /\.time-current\s*{[\s\S]*?background: var\(--reef-glass-bg\) !important/);
  assert.match(css, /\.time-current nav\s*{[\s\S]*?grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
});

test("aligns the top controls to the HUD edges and centers the masthead on the viewport", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v61 - final viewport edges[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.mission-bar\s*{[\s\S]*?left: var\(--bottom-hud-edge\) !important/);
  assert.match(latest, /right: var\(--bottom-hud-edge\) !important/);
  assert.match(latest, /width: auto !important/);
  assert.match(latest, /\.sub-title\s*{[\s\S]*?left: 50% !important/);
  assert.match(latest, /translate: 0 !important/);
  assert.match(latest, /transform: translateX\(-50%\) !important/);
});

test("places the stress action at the extreme right of the compact dock row", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v61 - final viewport edges[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.stress-trigger\s*{[\s\S]*?right: var\(--bottom-hud-edge\) !important/);
  assert.match(latest, /bottom: var\(--bottom-hud-bottom\) !important/);
  assert.match(latest, /@media \(max-width: 900px\)[\s\S]*?bottom: calc\(var\(--bottom-hud-bottom\) \+ 46px\) !important/);
});

test("keeps every reef-year caption readable on a collision-proof timeline", async () => {
  const [page, data, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/reef-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v62 - collision-proof timeline navigation[\s\S]*$/)?.[0] ?? "";

  assert.match(page, /aria-label={`\$\{moment\.year\}: \$\{moment\.title\}`}/);
  assert.match(data, /title: "First mass bleaching"/);
  assert.match(data, /title: "Severe reef bleaching"/);
  assert.match(data, /title: "Record heat stress"/);
  assert.match(data, /title: "Recovery monitored"/);
  assert.match(data, /title: "Lower-stress future"/);
  assert.match(latest, /\.time-current\s*{[\s\S]*?display: flex !important/);
  assert.match(latest, /\.time-current nav button\s*{[\s\S]*?flex: 1 1 0 !important/);
  assert.match(latest, /\.time-current \.timeline-metrics\s*{[\s\S]*?display: none !important/);
});

test("stacks the research dock above the timeline without overlapping HUD chrome", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v63 - stacked collision-free bottom HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(page, /className=\{`bottom-hud/);
  assert.match(page, /className="bottom-hud__tools"/);
  assert.match(latest, /\.bottom-hud\s*{[\s\S]*?flex-direction: column/);
  assert.match(latest, /\.bottom-hud__tools\s*{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud \.time-current,[\s\S]*?position: relative !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button\s*{[\s\S]*?grid-template-rows: 28px minmax\(0, 1fr\)/);
});

test("gives the story card the same frosted glass treatment as the rest of the HUD", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v64 - story panel uses the shared frosted glass system[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.story-panel\s*{[\s\S]*?background: var\(--reef-glass-bg\) !important/);
  assert.match(latest, /\.story-panel\s*{[\s\S]*?backdrop-filter: var\(--reef-glass-blur\) !important/);
  assert.match(latest, /\.story-panel\s*{[\s\S]*?border: 1px solid var\(--reef-glass-border\) !important/);
  assert.match(latest, /\.story-panel footer button:last-child\s*{[\s\S]*?background: var\(--reef-glass-bg-active\) !important/);
});

test("formats timeline years beside each marker with a sentence-case caption", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v65 - timeline year \+ caption sit beside each marker[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud \.time-current nav button\s*{[\s\S]*?grid-template-columns: 12px minmax\(0, 1fr\)/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?text-transform: uppercase/);
  assert.match(latest, /\.bottom-hud \.time-current nav button small\s*{[\s\S]*?font: 400 11px/);
  assert.match(latest, /\.bottom-hud \.time-current nav button small\s*{[\s\S]*?text-transform: none/);
});

test("keeps the reef map dropdown narrow and flush with the trigger", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v66 - reef map dropdown matches the trigger edge[\s\S]*$/)?.[0] ?? "";

  assert.match(page, /className="world-picker"/);
  assert.match(latest, /\.world-picker\s*{[\s\S]*?width: min\(272px, calc\(100vw - 32px\)\)/);
  assert.match(latest, /\.world-picker \.world-drawer\s*{[\s\S]*?left: 0 !important/);
  assert.match(latest, /\.world-picker \.world-drawer\s*{[\s\S]*?width: 100% !important/);
});

test("docks a compact story card beside the tool bar with stress test below", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v67 - compact story card docked with the bottom HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(page, /className=\{`bottom-hud\$\{tool === "story" && !selected \? " is-story" : ""\}`\}/);
  assert.match(latest, /\.bottom-hud\.is-story\s*{[\s\S]*?grid-template-columns: minmax\(220px, 268px\) minmax\(0, 1fr\)/);
  assert.match(latest, /\.bottom-hud\.is-story \.story-panel h2\s*{[\s\S]*?font-size: 16px/);
  assert.match(latest, /\.bottom-hud\.is-story \.stress-trigger\s*{[\s\S]*?width: 100% !important/);
});

test("hides leftover submarine HUD column guides in the dive view", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v70 - remove leftover submarine HUD column guides[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.submarine-frame::before,[\s\S]*?\.submarine-frame::after\s*{[\s\S]*?content: none !important/);
  assert.match(latest, /\.submarine-frame::before,[\s\S]*?\.submarine-frame::after\s*{[\s\S]*?display: none !important/);
});

test("darkens the shared frosted glass fill toward teal ink", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v69 - darker teal frosted glass HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(6 28 36 \/ 0\.24\)/);
  assert.match(latest, /--reef-glass-bg-active:[\s\S]*?rgb\(8 36 46 \/ 0\.28\)/);
  assert.match(latest, /linear-gradient\(145deg, rgb\(18 52 62 \/ 0\.36\)/);
  assert.doesNotMatch(latest, /rgb\(242 255 253 \/ 0\.055\)/);
  assert.doesNotMatch(latest, /--reef-glass-blur:/);
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

test("does not render a floating Diver R1 world tag in the dive view", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(page, /diver-cursors/);
  assert.doesNotMatch(page, /MousePointer2/);
  assert.doesNotMatch(page, /Diver R1/);
  assert.doesNotMatch(scene, /Diver R1/);
  assert.doesNotMatch(scene, /diver-cursors/);
  assert.match(scene, /reef-scene__marker-label/);
});

test("blends the species health header and grows the card for the signals graph", async () => {
  const [monitor, css] = await Promise.all([
    readFile(new URL("../app/components/SpecimenMonitor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v68 - blend species health header and grow the card for the signals graph[\s\S]*?(?=\/\* v\d|$)/)?.[0] ?? "";

  assert.match(monitor, /className="specimen-monitor is-signals"/);
  assert.doesNotMatch(monitor, /signal-button/);
  assert.doesNotMatch(monitor, /Hide signals/);
  assert.doesNotMatch(monitor, /Open signals/);
  assert.match(latest, /\.specimen-monitor__header\s*{[\s\S]*?background: transparent !important/);
  assert.match(latest, /\.specimen-monitor__header\s*{[\s\S]*?box-shadow: none !important/);
  assert.match(latest, /\.specimen-monitor__header\s*{[\s\S]*?backdrop-filter: none !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals\s*{[\s\S]*?max-height: none !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals\s*{[\s\S]*?overflow: visible !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals \.signal-chart\s*{[\s\S]*?grid-template-rows: 118px auto !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals \.signal-chart\s*{[\s\S]*?min-height: 168px !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals \.signal-chart\s*{[\s\S]*?overflow: visible !important/);
  assert.match(latest, /\.specimen-monitor\.is-signals \.signal-chart > div,[\s\S]*?\.recharts-responsive-container\s*{[\s\S]*?height: 118px !important/);
});

test("places a half-width tool bar with stress at the right and story above the full-width timeline", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v71 - full-width timeline, half-width tools, story left, stress right[\s\S]*$/)?.[0] ?? "";

  assert.match(page, /className="bottom-hud__tools"/);
  assert.match(page, /className="bottom-hud__stress"/);
  assert.doesNotMatch(page, /bottom-hud__side/);
  assert.doesNotMatch(page, /bottom-hud__main/);
  assert.match(latest, /\.bottom-hud\s*{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(0, 50vw\) auto/);
  assert.match(latest, /\.bottom-hud \.story-panel,[\s\S]*?\.bottom-hud\.is-story \.story-panel\s*{[\s\S]*?grid-column: 1/);
  assert.match(latest, /\.bottom-hud__tools\s*{[\s\S]*?grid-column: 2/);
  assert.match(latest, /\.bottom-hud__stress\s*{[\s\S]*?grid-column: 3/);
  assert.match(latest, /\.bottom-hud \.time-current,[\s\S]*?\.bottom-hud \.timeline-reopen\s*{[\s\S]*?grid-column: 1 \/ -1/);
  assert.match(latest, /\.bottom-hud \.time-current,[\s\S]*?\.bottom-hud \.timeline-reopen\s*{[\s\S]*?width: 100% !important/);
});

test("lightens the shared frosted glass fill toward white", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v72 - lighter white-leaning frosted glass HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(255 255 255 \/ 0\.28\)/);
  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(255 255 255 \/ 0\.16\)/);
  assert.match(latest, /--reef-glass-bg-active:[\s\S]*?rgb\(255 255 255 \/ 0\.34\)/);
  assert.match(latest, /--reef-glass-bg-active:[\s\S]*?rgb\(255 255 255 \/ 0\.18\)/);
  assert.doesNotMatch(latest, /rgb\(6 28 36 \/ 0\.24\)/);
  assert.doesNotMatch(latest, /--reef-glass-blur:/);
});

test("centers the tool dock icons with tighter gaps", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v73 - center tool icons with tighter gaps[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud\.is-story \.tool-console\s*{[\s\S]*?display: flex !important/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud\.is-story \.tool-console\s*{[\s\S]*?justify-content: center/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud\.is-story \.tool-console\s*{[\s\S]*?gap: 2px !important/);
  assert.match(latest, /\.bottom-hud \.tool-console button,[\s\S]*?\.bottom-hud\.is-story \.tool-console button\s*{[\s\S]*?flex: 0 0 auto !important/);
  assert.match(latest, /\.bottom-hud \.tool-console button,[\s\S]*?\.bottom-hud\.is-story \.tool-console button\s*{[\s\S]*?min-width: 48px !important/);
});

test("tints the frosted glass slightly darker and bluer", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v74 - slightly darker blue frost on the glass HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(186 220 242 \/ 0\.14\)/);
  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(168 202 226 \/ 0\.13\)/);
  assert.match(latest, /--reef-glass-bg-active:[\s\S]*?rgb\(176 210 232 \/ 0\.15\)/);
  assert.doesNotMatch(latest, /rgb\(255 255 255 \/ 0\.28\)/);
  assert.doesNotMatch(latest, /--reef-glass-blur:/);
});

test("keeps story panel Back and Next buttons the same size", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v75 - equal-width story panel footer buttons[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.story-panel footer,[\s\S]*?\.bottom-hud\.is-story \.story-panel footer\s*{[\s\S]*?grid-template-columns: 1fr 1fr !important/);
  assert.match(latest, /\.story-panel footer button,[\s\S]*?\.bottom-hud\.is-story \.story-panel footer button\s*{[\s\S]*?width: 100% !important/);
});

test("centers a shrink-wrapped tool dock on the page", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v76 - page-centered shrink-wrapped tool dock[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud__tools\s*{[\s\S]*?grid-column: 1 \/ -1/);
  assert.match(latest, /\.bottom-hud__tools\s*{[\s\S]*?justify-content: center/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud\.is-story \.tool-console\s*{[\s\S]*?width: max-content !important/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?\.bottom-hud\.is-story \.tool-console\s*{[\s\S]*?gap: 8px !important/);
});

test("connects the timeline rail to the first marker with thin Google Sans years a bit higher", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v77 - timeline rail meets the first marker, thin Google Sans, years sit a bit higher[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud \.time-current nav::before,[\s\S]*?\.bottom-hud \.time-current nav::after\s*{[\s\S]*?left: 13px !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav::before\s*{[\s\S]*?right: calc\(20% - 13px\) !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?Google Sans Thin/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?font-weight: 200 !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?transform: translateY\(-3px\)/);
});

test("always shows a compact species signals graph without a toggle", async () => {
  const [monitor, css] = await Promise.all([
    readFile(new URL("../app/components/SpecimenMonitor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const latest = css.match(/v78 - always-visible compact species signals graph[\s\S]*$/)?.[0] ?? "";

  assert.match(monitor, /className="specimen-monitor is-signals"/);
  assert.match(monitor, /height=\{72\}/);
  assert.doesNotMatch(monitor, /onToggleSignals/);
  assert.doesNotMatch(monitor, /signal-button/);
  assert.match(latest, /\.specimen-monitor \.signal-button\s*{[\s\S]*?display: none !important/);
  assert.match(latest, /\.specimen-monitor \.signal-chart\s*{[\s\S]*?grid-template-rows: 72px auto !important/);
  assert.match(latest, /\.recharts-responsive-container\s*{[\s\S]*?height: 72px !important/);
});

test("darkens the frosted glass fill a bit further", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v79 - slightly darker frosted glass HUD[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(72 118 150 \/ 0\.32\)/);
  assert.match(latest, /--reef-glass-bg:[\s\S]*?rgb\(22 48 72 \/ 0\.22\)/);
  assert.match(latest, /--reef-glass-bg-active:[\s\S]*?rgb\(28 58 84 \/ 0\.24\)/);
  assert.doesNotMatch(latest, /rgb\(168 202 226 \/ 0\.13\)/);
  assert.doesNotMatch(latest, /--reef-glass-blur:/);
});

test("unifies glass corner radius and tints HUD icons teal", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v80 - one glass radius everywhere, teal HUD icons[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-radius: 18px/);
  assert.match(latest, /--reef-icon: #5de9cd/);
  assert.match(latest, /border-radius: var\(--reef-glass-radius\) !important/);
  assert.match(latest, /\.tool-console svg,[\s\S]*?color: var\(--reef-icon\) !important/);
  assert.match(latest, /\.guide-toggle,[\s\S]*?color: var\(--reef-icon\) !important/);
  assert.match(latest, /\.expedition-v5\[data-phase="heat"\],[\s\S]*?--hud: #ffffff/);
});

test("uses a lighter flat glass fill with white HUD labels", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v81 - lighter flat glass, white HUD labels, edge sheen only[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg: rgb\(92 138 162 \/ 0\.4\)/);
  assert.match(latest, /--reef-glass-bg-active: rgb\(110 160 184 \/ 0\.48\)/);
  assert.doesNotMatch(latest, /linear-gradient/);
  assert.doesNotMatch(latest, /radial-gradient/);
  assert.match(latest, /inset 0 1px 0 rgb\(255 255 255 \/ 0\.5\)/);
  assert.match(latest, /\.tool-console button span,[\s\S]*?color: #ffffff !important/);
  assert.match(latest, /\.stress-trigger,[\s\S]*?\.time-current \.timeline-play[\s\S]*?color: #ffffff !important/);
  assert.match(latest, /\.tool-console svg,[\s\S]*?color: var\(--reef-icon\) !important/);
});

test("keeps tool dock icons free of inner capsule chrome", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v82 - tool dock icons sit on the bar without inner capsules[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.tool-console button,[\s\S]*?background: transparent !important/);
  assert.match(latest, /\.tool-console button\.is-active,[\s\S]*?border-radius: 0 !important/);
  assert.match(latest, /box-shadow: none !important/);
  assert.match(latest, /backdrop-filter: none !important/);
  assert.match(latest, /\.tool-console button::before,[\s\S]*?display: none !important/);
});

test("thins the white HUD outline and makes glass a bit more transparent", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v83 - thinner white HUD outline, glass 10% more transparent[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /--reef-glass-bg: rgb\(92 138 162 \/ 0\.3\)/);
  assert.match(latest, /--reef-glass-bg-active: rgb\(110 160 184 \/ 0\.38\)/);
  assert.match(latest, /--reef-glass-border: rgb\(255 255 255 \/ 0\.42\)/);
  assert.match(latest, /border-width: 0\.5px !important/);
  assert.doesNotMatch(latest, /linear-gradient/);
  assert.doesNotMatch(latest, /radial-gradient/);
  assert.doesNotMatch(latest, /--reef-glass-blur:/);
});

test("plays every reef year and maps its condition into gradual coral transitions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/components/ReefScene.tsx", import.meta.url), "utf8");

  assert.match(page, /const firstMoment = moments\[0\][\s\S]*?setMomentIndex\(0\)[\s\S]*?setIsTimelinePlaying\(true\)/);
  assert.match(page, /timelineCondition=\{activeMoment\}/);
  assert.match(scene, /const heatSeverity = [\s\S]*?condition\.dhw/);
  assert.match(scene, /const temperatureSeverity = [\s\S]*?condition\.temp/);
  assert.match(scene, /const coverLoss = [\s\S]*?condition\.health/);
  assert.match(scene, /heatSeverity \* 0\.45 \+ temperatureSeverity \* 0\.25 \+ coverLoss \* 0\.3/);
  assert.match(scene, /yearSeverity \* 0\.52/);
  assert.match(scene, /yearSeverity \* 0\.052/);
  assert.match(scene, /entry\.material\.color\.lerp\(targetColor/);
});

test("keeps timeline years fully visible at the top", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v84 - keep timeline years fully visible at the top[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?transform: none/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?overflow: visible !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?line-height: 1\.3 !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button,[\s\S]*?overflow: visible !important/);
});

test("lifts timeline years with room above them", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v85 - lift timeline years with room above them[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud \.time-current\s*{[\s\S]*?height: 72px !important/);
  assert.match(latest, /\.bottom-hud \.time-current\s*{[\s\S]*?padding-top: 14px !important/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?transform: translateY\(-6px\)/);
  assert.match(latest, /\.bottom-hud \.time-current nav button b\s*{[\s\S]*?overflow: visible !important/);
});

test("centers the masthead and research dock without stacked translations", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v86 - mathematically center the masthead and research dock[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.sub-title\s*{[\s\S]*?left: 50% !important[\s\S]*?right: auto !important/);
  assert.match(latest, /margin-inline: auto !important/);
  assert.match(latest, /translate: -50% 0 !important/);
  assert.match(latest, /transform: none !important/);
  assert.match(latest, /\.bottom-hud__tools,[\s\S]*?justify-self: stretch !important[\s\S]*?width: 100% !important/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?margin-inline: auto !important/);
});

test("centers the complete research dock against the page content box", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v87 - center the complete research dock against the page content box[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud,[\s\S]*?left: 0 !important[\s\S]*?right: 0 !important/);
  assert.match(latest, /width: 100% !important/);
  assert.match(latest, /padding-inline: var\(--bottom-hud-edge\) !important/);
  assert.match(latest, /\.bottom-hud__tools,[\s\S]*?display: flex !important[\s\S]*?justify-content: center !important/);
  assert.match(latest, /\.bottom-hud \.tool-console,[\s\S]*?flex: 0 0 auto !important[\s\S]*?margin-inline: 0 !important/);
});

test("keeps the research dock page-centered beside Story and Stress", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const latest = css.match(/v88 - keep the research dock page-centered even beside Story and Stress[\s\S]*$/)?.[0] ?? "";

  assert.match(latest, /\.bottom-hud__tools,[\s\S]*?position: absolute !important/);
  assert.match(latest, /left: 50% !important/);
  assert.match(latest, /width: max-content !important/);
  assert.match(latest, /transform: translateX\(-50%\) !important/);
  assert.match(latest, /bottom: calc\(var\(--bottom-hud-timeline-height\) \+ var\(--bottom-hud-row-gap\)\) !important/);
});
