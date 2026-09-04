import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Reef Relay production worker and client", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/client/reef-entry-v4.webp", import.meta.url));
  await access(new URL("../dist/client/models/acropora-hyacinthus.glb", import.meta.url));
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
  assert.match(scene, /AMBIENT_SCAN_COLONIES/);
  assert.doesNotMatch(scene, /ConeGeometry\(5 \+ random\(\) \* 9, 62/);
});

test("uses the clean Google Sans entry action system", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /className="entry-actions"/);
  assert.match(css, /--reef-ui-font: "Google Sans"/);
  assert.match(css, /\.entry-actions\s*{[^}]*grid-template-columns:/s);
  assert.match(css, /\.expedition-entry h1[\s\S]*?font-weight: 500/);
});
