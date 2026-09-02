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
