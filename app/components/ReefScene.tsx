"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import type { Color, Material, Mesh, Object3D } from "three";

export type ReefPhase = "healthy" | "heat" | "bleaching" | "recovery";
export type ReefBiomeId =
  | "great-barrier"
  | "sisters-islands"
  | "coral-triangle"
  | "caribbean-reef";
export type ScanAssetKey =
  | "acro-table"
  | "acro-compact"
  | "massive-star"
  | "acropora-palmata"
  | "diploria-brain"
  | "porites-mound"
  | "goniopora-column"
  | "fungia-disc"
  | "pocillopora-cauliflower"
  | "seriatopora-birdsnest"
  | "heliopora-blue"
  | "agaricia-plate"
  | "pavona-lettuce";

export type ReefSceneHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  scan?: ScanAssetKey;
  size?: number;
  tint?: number;
  yaw?: number;
};

type ReefSceneProps = {
  active?: boolean;
  biome?: ReefBiomeId;
  focusId?: string | null;
  hotspots?: ReefSceneHotspot[];
  mappedIds?: string[];
  fallbackSrc?: string;
  phase?: ReefPhase;
  stressor?: "heat" | "co2" | "plastic" | "runoff" | null;
  restoredIds?: string[];
  className?: string;
  onHotspotSelect?: (id: string) => void;
  onReady?: () => void;
  onEngineChange?: (engine: string) => void;
  onZoneChange?: (zone: string, depth: string) => void;
};

const DEFAULT_HOTSPOTS: ReefSceneHotspot[] = [
  { id: "acro-table", label: "Colony A", position: [-8, 2.6, -11] },
  { id: "acro-compact", label: "Colony B", position: [8, 2.2, -27] },
  { id: "massive-star", label: "Colony C", position: [24, 2.7, -47] },
];

const SCANS: Record<ScanAssetKey, { desktop: string; mobile: string; size: number; tint: number; preserveColor?: boolean }> = {
  "acro-table": {
    desktop: "/models/acropora-hyacinthus.glb",
    mobile: "/models/acropora-hyacinthus-mobile.glb",
    size: 7.4,
    tint: 0xffb58f,
  },
  "acro-compact": {
    desktop: "/models/acropora-humilis.glb",
    mobile: "/models/acropora-humilis-mobile.glb",
    size: 6.2,
    tint: 0xe9867a,
  },
  "massive-star": {
    desktop: "/models/plesiastraea-armata.glb",
    mobile: "/models/plesiastraea-armata-mobile.glb",
    size: 6.8,
    tint: 0xe8c889,
  },
  "acropora-palmata": {
    desktop: "/models/smithsonian-acropora-palmata.glb",
    mobile: "/models/smithsonian-acropora-palmata.glb",
    size: 7.4,
    tint: 0xf0a271,
    preserveColor: true,
  },
  "diploria-brain": {
    desktop: "/models/smithsonian-diploria-labyrinthiformis.glb",
    mobile: "/models/smithsonian-diploria-labyrinthiformis.glb",
    size: 6.9,
    tint: 0xd7bf82,
    preserveColor: true,
  },
  "porites-mound": {
    desktop: "/models/smithsonian-porites-andrewsi.glb",
    mobile: "/models/smithsonian-porites-andrewsi.glb",
    size: 6.1,
    tint: 0xd9c278,
    preserveColor: true,
  },
  "goniopora-column": {
    desktop: "/models/smithsonian-goniopora-columna.glb",
    mobile: "/models/smithsonian-goniopora-columna.glb",
    size: 6.3,
    tint: 0xd29274,
    preserveColor: true,
  },
  "fungia-disc": {
    desktop: "/models/smithsonian-fungia-discus.glb",
    mobile: "/models/smithsonian-fungia-discus.glb",
    size: 5.5,
    tint: 0xe9aa72,
    preserveColor: true,
  },
  "pocillopora-cauliflower": {
    desktop: "/models/smithsonian-pocillopora-nobilis.glb",
    mobile: "/models/smithsonian-pocillopora-nobilis.glb",
    size: 5.9,
    tint: 0xe08978,
    preserveColor: true,
  },
  "seriatopora-birdsnest": {
    desktop: "/models/smithsonian-seriatopora-hystrix.glb",
    mobile: "/models/smithsonian-seriatopora-hystrix.glb",
    size: 5.8,
    tint: 0xeaa17d,
    preserveColor: true,
  },
  "heliopora-blue": {
    desktop: "/models/smithsonian-heliopora-coerulea.glb",
    mobile: "/models/smithsonian-heliopora-coerulea.glb",
    size: 5.8,
    tint: 0x89bac2,
    preserveColor: true,
  },
  "agaricia-plate": {
    desktop: "/models/smithsonian-agaricia-lamarcki.glb",
    mobile: "/models/smithsonian-agaricia-lamarcki.glb",
    size: 6.2,
    tint: 0xd7ad76,
    preserveColor: true,
  },
  "pavona-lettuce": {
    desktop: "/models/smithsonian-pavona-chiriquiensis.glb",
    mobile: "/models/smithsonian-pavona-chiriquiensis.glb",
    size: 6.4,
    tint: 0xd6ba78,
    preserveColor: true,
  },
};

const FALLBACK_POSITIONS: Record<string, { left: string; top: string }> = {
  "acro-table": { left: "35%", top: "59%" },
  "acro-compact": { left: "59%", top: "55%" },
  "massive-star": { left: "76%", top: "51%" },
  "acro-table-backreef": { left: "27%", top: "53%" },
  "acro-table-rim": { left: "46%", top: "48%" },
  "acro-table-current": { left: "69%", top: "61%" },
  "acro-compact-bommie": { left: "22%", top: "67%" },
  "acro-compact-surge": { left: "42%", top: "66%" },
  "acro-compact-lagoon": { left: "83%", top: "57%" },
  "massive-star-dome": { left: "57%", top: "44%" },
  "massive-star-ledge": { left: "73%", top: "47%" },
  "massive-star-archive": { left: "64%", top: "70%" },
  "elkhorn-palmata": { left: "28%", top: "50%" },
  "brain-diploria": { left: "64%", top: "48%" },
  "porites-andrewsi": { left: "24%", top: "64%" },
  "flowerpot-goniopora": { left: "45%", top: "58%" },
  "mushroom-fungia": { left: "54%", top: "66%" },
  "cauliflower-pocillopora": { left: "72%", top: "63%" },
  "birdsnest-seriatopora": { left: "34%", top: "73%" },
  "blue-heliopora": { left: "50%", top: "77%" },
  "plate-agaricia": { left: "67%", top: "74%" },
  "lettuce-pavona": { left: "22%", top: "79%" },
};

const AMBIENT_SCAN_COLONIES: ReefSceneHotspot[] = [
  { id: "nursery-scan-01", label: "Nursery scan", scan: "acropora-palmata", position: [-82, 2.25, -24], size: 4.9, tint: 0xf0a879, yaw: -0.55 },
  { id: "nursery-scan-02", label: "Nursery scan", scan: "diploria-brain", position: [-48, 2.1, -42], size: 4.4, tint: 0xd8c082, yaw: 0.72 },
  { id: "nursery-scan-03", label: "Nursery scan", scan: "porites-mound", position: [36, 2.35, -27], size: 4.8, tint: 0xdcc17c, yaw: -0.18 },
  { id: "nursery-scan-04", label: "Nursery scan", scan: "pocillopora-cauliflower", position: [72, 2.5, -45], size: 4.6, tint: 0xe18b77, yaw: 0.48 },
  { id: "nursery-scan-05", label: "Nursery scan", scan: "goniopora-column", position: [-94, 2.45, -66], size: 4.8, tint: 0xd89270, yaw: -0.35 },
  { id: "nursery-scan-06", label: "Nursery scan", scan: "fungia-disc", position: [-20, 2.4, -64], size: 4.1, tint: 0xe6a66f, yaw: 0.8 },
  { id: "nursery-scan-07", label: "Nursery scan", scan: "acro-table", position: [88, 2.8, -82], size: 5.8, tint: 0xec9f73, yaw: -0.92 },
  { id: "nursery-scan-08", label: "Nursery scan", scan: "heliopora-blue", position: [18, 2.48, -94], size: 4.9, tint: 0x89b8c0, yaw: 0.16 },
  { id: "nursery-scan-09", label: "Nursery scan", scan: "agaricia-plate", position: [-112, 2.85, -108], size: 5.2, tint: 0xd3a96f, yaw: -1.1 },
  { id: "nursery-scan-10", label: "Nursery scan", scan: "seriatopora-birdsnest", position: [-44, 2.9, -116], size: 5.5, tint: 0xe9a17c, yaw: 0.42 },
  { id: "nursery-scan-11", label: "Nursery scan", scan: "acro-compact", position: [48, 2.85, -124], size: 4.9, tint: 0xdb7c72, yaw: -0.2 },
  { id: "nursery-scan-12", label: "Nursery scan", scan: "pavona-lettuce", position: [104, 3, -144], size: 5.4, tint: 0xd8bc78, yaw: 0.34 },
  { id: "nursery-scan-13", label: "Nursery scan", scan: "massive-star", position: [-76, 3.15, -152], size: 5.9, tint: 0xddc58b, yaw: -0.68 },
  { id: "nursery-scan-14", label: "Nursery scan", scan: "acropora-palmata", position: [-10, 3.05, -164], size: 5.8, tint: 0xf0a06f, yaw: 1.02 },
  { id: "nursery-scan-15", label: "Nursery scan", scan: "diploria-brain", position: [62, 3.25, -176], size: 5.7, tint: 0xd8c189, yaw: -0.48 },
  { id: "nursery-scan-16", label: "Nursery scan", scan: "porites-mound", position: [116, 3.35, -194], size: 5.6, tint: 0xd5bf79, yaw: 0.95 },
  { id: "nursery-scan-17", label: "Nursery scan", scan: "goniopora-column", position: [-122, 3.45, -202], size: 5.5, tint: 0xd09070, yaw: 0.28 },
  { id: "nursery-scan-18", label: "Nursery scan", scan: "fungia-disc", position: [-58, 3.35, -218], size: 4.7, tint: 0xe4a970, yaw: -0.72 },
  { id: "nursery-scan-19", label: "Nursery scan", scan: "pocillopora-cauliflower", position: [18, 3.5, -230], size: 5.1, tint: 0xe3907b, yaw: 0.52 },
  { id: "nursery-scan-20", label: "Nursery scan", scan: "seriatopora-birdsnest", position: [82, 3.62, -244], size: 5.2, tint: 0xe7a07a, yaw: -0.18 },
  { id: "nursery-scan-21", label: "Nursery scan", scan: "heliopora-blue", position: [-96, 3.75, -258], size: 5.1, tint: 0x89bac2, yaw: 0.68 },
  { id: "nursery-scan-22", label: "Nursery scan", scan: "agaricia-plate", position: [-22, 3.82, -274], size: 5.7, tint: 0xd8ad76, yaw: -1.2 },
  { id: "nursery-scan-23", label: "Nursery scan", scan: "pavona-lettuce", position: [54, 3.9, -286], size: 5.9, tint: 0xd6ba78, yaw: 0.2 },
  { id: "nursery-scan-24", label: "Nursery scan", scan: "acro-table", position: [126, 4, -306], size: 6.1, tint: 0xefa978, yaw: 0.95 },
  { id: "nursery-scan-25", label: "Nursery scan", scan: "acropora-palmata", position: [-132, 4.1, -314], size: 6, tint: 0xf1a675, yaw: -0.35 },
  { id: "nursery-scan-26", label: "Nursery scan", scan: "diploria-brain", position: [-68, 4.05, -330], size: 5.8, tint: 0xd5bf87, yaw: 0.8 },
  { id: "nursery-scan-27", label: "Nursery scan", scan: "porites-mound", position: [8, 4.15, -342], size: 5.9, tint: 0xd9c278, yaw: -0.45 },
  { id: "nursery-scan-28", label: "Nursery scan", scan: "pocillopora-cauliflower", position: [96, 4.2, -356], size: 5.7, tint: 0xe18b77, yaw: 1.15 },
  { id: "nursery-scan-29", label: "Nursery scan", scan: "fungia-disc", position: [-118, 2.25, -18], size: 4.2, tint: 0xe5aa72, yaw: -0.18 },
  { id: "nursery-scan-30", label: "Nursery scan", scan: "goniopora-column", position: [-66, 2.35, -18], size: 4.7, tint: 0xd39472, yaw: 0.94 },
  { id: "nursery-scan-31", label: "Nursery scan", scan: "heliopora-blue", position: [88, 2.4, -18], size: 4.8, tint: 0x88bac2, yaw: -0.52 },
  { id: "nursery-scan-32", label: "Nursery scan", scan: "pavona-lettuce", position: [116, 2.65, -62], size: 5.4, tint: 0xd7bb79, yaw: 0.42 },
  { id: "nursery-scan-33", label: "Nursery scan", scan: "agaricia-plate", position: [-118, 2.75, -72], size: 5.2, tint: 0xd8ad76, yaw: -0.74 },
  { id: "nursery-scan-34", label: "Nursery scan", scan: "seriatopora-birdsnest", position: [2, 2.55, -42], size: 4.8, tint: 0xe8a07a, yaw: 0.3 },
  { id: "nursery-scan-35", label: "Nursery scan", scan: "diploria-brain", position: [104, 2.82, -94], size: 5.1, tint: 0xd7c086, yaw: 1.05 },
  { id: "nursery-scan-36", label: "Nursery scan", scan: "porites-mound", position: [-34, 2.92, -96], size: 5.2, tint: 0xdac27a, yaw: -0.38 },
];

type AmbientSeed = [ScanAssetKey, number, number, number, number, number?];

const makeAmbientScanColonies = (
  prefix: string,
  seeds: AmbientSeed[],
): ReefSceneHotspot[] =>
  seeds.map(([scan, x, z, size, tint, yaw], index) => ({
    id: `${prefix}-scan-${String(index + 1).padStart(2, "0")}`,
    label: "Survey scan",
    scan,
    position: [x, 2.35 + (index % 7) * 0.16, z],
    size,
    tint,
    yaw: yaw ?? index * 0.37,
  }));

const BIOME_AMBIENT_SCAN_COLONIES: Record<ReefBiomeId, ReefSceneHotspot[]> = {
  "great-barrier": AMBIENT_SCAN_COLONIES,
  "sisters-islands": makeAmbientScanColonies("sisters", [
    ["pavona-lettuce", -132, -26, 5.2, 0xd7bc78, 0.2],
    ["agaricia-plate", -78, -42, 4.9, 0xd8b172, -0.6],
    ["porites-mound", 18, -38, 4.8, 0xd5bd76, 0.3],
    ["goniopora-column", 74, -58, 4.7, 0xd09572, 0.9],
    ["fungia-disc", 128, -82, 4.2, 0xe3a772, -0.2],
    ["massive-star", -118, -118, 5.3, 0xdcc58a, -0.8],
    ["pavona-lettuce", -42, -128, 5.8, 0xd2bd7b, 0.7],
    ["agaricia-plate", 38, -146, 5.1, 0xd1aa73, -1.1],
    ["porites-mound", 104, -170, 5.2, 0xd5c37f, 0.4],
    ["goniopora-column", -150, -196, 5.4, 0xcf9270, -0.3],
    ["fungia-disc", -72, -222, 4.6, 0xdfaa77, 0.6],
    ["pocillopora-cauliflower", 12, -244, 4.8, 0xde8f78, -0.5],
    ["acro-compact", 82, -268, 4.9, 0xd87f73, 0.2],
    ["pavona-lettuce", 142, -298, 5.7, 0xd6bd7a, -0.9],
    ["agaricia-plate", -118, -332, 5.5, 0xd5ad74, 0.5],
    ["massive-star", -32, -360, 5.7, 0xdac38a, -0.1],
    ["porites-mound", 54, -392, 5.4, 0xd4c17e, 0.8],
    ["goniopora-column", 132, -430, 5.3, 0xd19472, -0.4],
  ]),
  "coral-triangle": makeAmbientScanColonies("triangle", [
    ["acro-table", -154, -30, 6, 0xf0aa76, -0.2],
    ["seriatopora-birdsnest", -94, -48, 5.4, 0xe9a17c, 0.6],
    ["pocillopora-cauliflower", -22, -60, 5.2, 0xe18b77, -0.5],
    ["goniopora-column", 58, -74, 5.5, 0xd39272, 0.8],
    ["heliopora-blue", 128, -96, 5.3, 0x88bac2, -0.3],
    ["fungia-disc", -138, -128, 4.8, 0xe6aa72, 0.4],
    ["pavona-lettuce", -68, -158, 5.9, 0xd7bb79, -0.7],
    ["agaricia-plate", 8, -184, 5.7, 0xd6ad76, 0.1],
    ["acro-compact", 82, -212, 5.5, 0xe28376, 1],
    ["porites-mound", 152, -242, 5.8, 0xd7c17d, -0.5],
    ["acropora-palmata", -162, -278, 5.8, 0xefa372, 0.35],
    ["diploria-brain", -92, -306, 5.4, 0xd7c082, -0.85],
    ["seriatopora-birdsnest", -18, -334, 5.6, 0xeaa17d, 0.52],
    ["heliopora-blue", 58, -366, 5.7, 0x89bac2, -0.12],
    ["pavona-lettuce", 136, -392, 6.1, 0xd6ba78, 0.82],
    ["acro-table", -126, -424, 6.2, 0xefa978, -0.4],
    ["pocillopora-cauliflower", -42, -456, 5.8, 0xe18b77, 0.64],
    ["goniopora-column", 42, -488, 5.9, 0xd29274, -0.32],
    ["fungia-disc", 124, -514, 5.2, 0xe7a970, 0.2],
  ]),
  "caribbean-reef": makeAmbientScanColonies("caribbean", [
    ["acropora-palmata", -142, -28, 6.2, 0xf0a271, -0.5],
    ["diploria-brain", -68, -46, 5.6, 0xd7bf82, 0.4],
    ["agaricia-plate", 12, -64, 5.1, 0xd7ad76, -0.3],
    ["porites-mound", 92, -92, 5.3, 0xd9c278, 0.8],
    ["acro-compact", 154, -122, 5.4, 0xe9a47d, -0.2],
    ["diploria-brain", -126, -156, 5.9, 0xd5bd82, -0.75],
    ["massive-star", -48, -186, 5.8, 0xe1c58c, 0.28],
    ["agaricia-plate", 44, -214, 5.4, 0xd2a974, -0.95],
    ["acropora-palmata", 128, -242, 5.9, 0xeda06f, 0.58],
    ["porites-mound", -158, -278, 5.5, 0xd7c079, -0.18],
    ["diploria-brain", -82, -316, 5.8, 0xd6bf83, 0.74],
    ["agaricia-plate", 8, -352, 5.6, 0xd5ad75, -0.52],
    ["acro-compact", 88, -384, 5.6, 0xe6a17b, 0.22],
    ["acropora-palmata", 156, -418, 6.1, 0xeea271, -0.4],
    ["massive-star", -118, -456, 6.3, 0xdfc68d, 0.36],
    ["diploria-brain", -22, -488, 5.9, 0xd8c187, -0.72],
    ["porites-mound", 78, -518, 5.8, 0xd8c27b, 0.62],
  ]),
};

type ReefBiomeConfig = {
  seed: number;
  terrain: "shelf" | "turbid-lagoon" | "triangle-wall" | "caribbean-spur";
  floorTexture: "shelf-rubble" | "silt-lagoon" | "coral-wall" | "spur-groove";
  background: number;
  fog: number;
  fogDensity: number;
  floorColor: number;
  wallColor: number;
  waterColor: number;
  causticColor: number;
  causticOpacity: number;
  waterAlpha: number;
  waterDistortion: number;
  waterY: number;
  textureRepeat: [number, number];
  exposure: number;
  rockDensity: number;
  spongeDensity: number;
  grassDensity: number;
  kelpDensity: number;
  coralHeadDensity: number;
  seaFanDensity: number;
  softPolypDensity: number;
  fishDensity: number;
  bottomLifeDensity: number;
  particleDensity: number;
  lifeDensity: number;
  grassColor: number;
  kelpHue: number;
  seaFanHue: number;
  coralHue: number;
  lifePalette: number[];
  clusters: Array<[number, number, number, number]>;
  zones: Array<{ minZ: number; name: string; depth: string }>;
};

const WORLD_BOUNDS = {
  x: 218,
  yMin: 2.8,
  yMax: 17.8,
  zMin: -548,
  zMax: 72,
};

const FLOOR_WIDTH = 560;
const FLOOR_DEPTH = 900;
const FLOOR_CENTER_Z = -218;

const DEFAULT_CLUSTERS: Array<[number, number, number, number]> = [
  [-18, 0, -18, 14],
  [38, 0, -36, 18],
  [-58, 0, -52, 22],
  [80, 0, -82, 26],
  [-92, 0, -102, 30],
  [-18, 0, -128, 28],
  [58, 0, -154, 34],
  [-118, 0, -194, 38],
  [18, 0, -224, 36],
  [104, 0, -254, 42],
  [-64, 0, -296, 44],
  [58, 0, -336, 38],
  [-152, 0, -382, 42],
  [148, 0, -414, 46],
  [-32, 0, -468, 44],
];

const BIOME_CONFIG: Record<ReefBiomeId, ReefBiomeConfig> = {
  "great-barrier": {
    seed: 2035,
    terrain: "shelf",
    floorTexture: "shelf-rubble",
    background: 0x064858,
    fog: 0x227c8c,
    fogDensity: 0.0105,
    floorColor: 0xaa9c78,
    wallColor: 0x155d62,
    waterColor: 0x0d7184,
    causticColor: 0xaef5e7,
    causticOpacity: 0.15,
    waterAlpha: 0.64,
    waterDistortion: 4.15,
    waterY: 13.45,
    textureRepeat: [46, 72],
    exposure: 1.08,
    rockDensity: 1.05,
    spongeDensity: 0.9,
    grassDensity: 0.82,
    kelpDensity: 0.72,
    coralHeadDensity: 1.05,
    seaFanDensity: 0.9,
    softPolypDensity: 0.92,
    fishDensity: 1.05,
    bottomLifeDensity: 0.95,
    particleDensity: 0.9,
    lifeDensity: 0.98,
    grassColor: 0x2aa67d,
    kelpHue: 0.31,
    seaFanHue: 0.39,
    coralHue: 0.055,
    lifePalette: [0xffa889, 0xffd36e, 0x7bf5d2, 0xc98fff, 0xeaffb7],
    clusters: DEFAULT_CLUSTERS,
    zones: [
      { minZ: -95, name: "Reef flat", depth: "12 m" },
      { minZ: -220, name: "Outer shelf slope", depth: "18 m" },
      { minZ: -365, name: "Patch reef garden", depth: "22 m" },
      { minZ: -999, name: "Blue-water edge", depth: "26 m" },
    ],
  },
  "sisters-islands": {
    seed: 7612,
    terrain: "turbid-lagoon",
    floorTexture: "silt-lagoon",
    background: 0x0c3d42,
    fog: 0x427f74,
    fogDensity: 0.017,
    floorColor: 0x8e8e66,
    wallColor: 0x244d45,
    waterColor: 0x2f8178,
    causticColor: 0xc8f0cf,
    causticOpacity: 0.1,
    waterAlpha: 0.58,
    waterDistortion: 2.75,
    waterY: 11.6,
    textureRepeat: [54, 88],
    exposure: 0.98,
    rockDensity: 0.72,
    spongeDensity: 1.45,
    grassDensity: 1.72,
    kelpDensity: 0.38,
    coralHeadDensity: 0.82,
    seaFanDensity: 0.58,
    softPolypDensity: 1.28,
    fishDensity: 0.78,
    bottomLifeDensity: 1.2,
    particleDensity: 1.5,
    lifeDensity: 0.84,
    grassColor: 0x3f9c63,
    kelpHue: 0.25,
    seaFanHue: 0.35,
    coralHue: 0.07,
    lifePalette: [0xffbd8b, 0xd4e48b, 0x75dcb4, 0xf0a1b9, 0xf6e0a1],
    clusters: [
      [-126, 0, -34, 22],
      [-46, 0, -58, 28],
      [52, 0, -88, 24],
      [128, 0, -116, 30],
      [-152, 0, -154, 35],
      [-74, 0, -204, 42],
      [24, 0, -236, 36],
      [112, 0, -284, 44],
      [-128, 0, -342, 48],
      [-12, 0, -394, 46],
      [122, 0, -448, 42],
    ],
    zones: [
      { minZ: -85, name: "Bendera Bay reef flat", depth: "7 m" },
      { minZ: -205, name: "Turbid coral slope", depth: "12 m" },
      { minZ: -350, name: "Seagrass and sponge mosaic", depth: "16 m" },
      { minZ: -999, name: "Nursery research zone", depth: "19 m" },
    ],
  },
  "coral-triangle": {
    seed: 91244,
    terrain: "triangle-wall",
    floorTexture: "coral-wall",
    background: 0x045c72,
    fog: 0x1d8d9c,
    fogDensity: 0.0088,
    floorColor: 0xa99874,
    wallColor: 0x19606d,
    waterColor: 0x0a90a5,
    causticColor: 0xb9fff2,
    causticOpacity: 0.18,
    waterAlpha: 0.68,
    waterDistortion: 4.9,
    waterY: 14.2,
    textureRepeat: [48, 78],
    exposure: 1.12,
    rockDensity: 1.26,
    spongeDensity: 1.05,
    grassDensity: 1.05,
    kelpDensity: 0.82,
    coralHeadDensity: 1.38,
    seaFanDensity: 1.22,
    softPolypDensity: 1.42,
    fishDensity: 1.55,
    bottomLifeDensity: 1.05,
    particleDensity: 1.05,
    lifeDensity: 1.42,
    grassColor: 0x2fb88a,
    kelpHue: 0.34,
    seaFanHue: 0.46,
    coralHue: 0.04,
    lifePalette: [0xffa875, 0xffda6f, 0x6dffcf, 0x8bc6ff, 0xff91d4, 0xebffaf],
    clusters: [
      [-158, 0, -42, 34],
      [-82, 0, -76, 38],
      [16, 0, -108, 42],
      [104, 0, -142, 44],
      [176, 0, -188, 40],
      [-146, 0, -232, 52],
      [-48, 0, -276, 48],
      [58, 0, -326, 54],
      [152, 0, -376, 48],
      [-118, 0, -430, 54],
      [0, 0, -488, 50],
      [128, 0, -524, 46],
    ],
    zones: [
      { minZ: -100, name: "Fringing reef crest", depth: "11 m" },
      { minZ: -245, name: "Biodiversity wall", depth: "17 m" },
      { minZ: -405, name: "Rubble and mushroom channel", depth: "24 m" },
      { minZ: -999, name: "Deep blue drop-off", depth: "31 m" },
    ],
  },
  "caribbean-reef": {
    seed: 44501,
    terrain: "caribbean-spur",
    floorTexture: "spur-groove",
    background: 0x063d5a,
    fog: 0x24758d,
    fogDensity: 0.0096,
    floorColor: 0xb0a37e,
    wallColor: 0x1a5468,
    waterColor: 0x0b7fa0,
    causticColor: 0xd1fff5,
    causticOpacity: 0.17,
    waterAlpha: 0.66,
    waterDistortion: 4.35,
    waterY: 13.1,
    textureRepeat: [42, 68],
    exposure: 1.05,
    rockDensity: 1.18,
    spongeDensity: 1.34,
    grassDensity: 0.74,
    kelpDensity: 0.45,
    coralHeadDensity: 0.72,
    seaFanDensity: 1.6,
    softPolypDensity: 0.82,
    fishDensity: 1.28,
    bottomLifeDensity: 0.72,
    particleDensity: 0.78,
    lifeDensity: 1.08,
    grassColor: 0x349f78,
    kelpHue: 0.28,
    seaFanHue: 0.78,
    coralHue: 0.065,
    lifePalette: [0xffb074, 0xffd77f, 0x8eeedc, 0x9dc6ff, 0xe8f5be],
    clusters: [
      [-150, 0, -34, 28],
      [-62, 0, -70, 22],
      [44, 0, -104, 32],
      [132, 0, -142, 30],
      [-132, 0, -188, 36],
      [-24, 0, -230, 34],
      [96, 0, -280, 38],
      [172, 0, -338, 36],
      [-118, 0, -388, 38],
      [0, 0, -442, 34],
      [124, 0, -500, 36],
    ],
    zones: [
      { minZ: -90, name: "Elkhorn reef crest", depth: "9 m" },
      { minZ: -220, name: "Staghorn nursery lane", depth: "15 m" },
      { minZ: -365, name: "Spur-and-groove terrace", depth: "20 m" },
      { minZ: -999, name: "Limestone hardbottom", depth: "25 m" },
    ],
  },
};

function seededRandom(seed = 2035) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object && object.isMesh === true;
}

function disposeMaterial(material: Material | Material[]) {
  for (const item of Array.isArray(material) ? material : [material]) {
    for (const value of Object.values(item)) {
      if (value && typeof value === "object" && "isTexture" in value) {
        (value as { dispose: () => void }).dispose();
      }
    }
    item.dispose();
  }
}

export default function ReefScene({
  active = false,
  biome = "great-barrier",
  focusId = null,
  hotspots = DEFAULT_HOTSPOTS,
  mappedIds = [],
  fallbackSrc = "/reef-entry-v4.webp",
  phase = "healthy",
  stressor = null,
  restoredIds = [],
  className,
  onHotspotSelect,
  onReady,
  onEngineChange,
  onZoneChange,
}: ReefSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeRef = useRef(active);
  const focusRef = useRef(focusId);
  const phaseRef = useRef(phase);
  const stressorRef = useRef(stressor);
  const restoredRef = useRef(restoredIds);
  const hotspotsRef = useRef(hotspots);
  const callbacksRef = useRef({ onHotspotSelect, onReady, onEngineChange, onZoneChange });
  const [activatedOnce, setActivatedOnce] = useState(active);
  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const mapped = useMemo(() => new Set(mappedIds), [mappedIds]);

  useEffect(() => {
    activeRef.current = active;
    if (!active) return;
    const timer = window.setTimeout(() => setActivatedOnce(true), 0);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    focusRef.current = focusId;
  }, [focusId]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => { stressorRef.current = stressor; }, [stressor]);
  useEffect(() => { restoredRef.current = restoredIds; }, [restoredIds]);

  useEffect(() => {
    hotspotsRef.current = hotspots;
    callbacksRef.current = { onHotspotSelect, onReady, onEngineChange, onZoneChange };
  }, [hotspots, onHotspotSelect, onReady, onEngineChange, onZoneChange]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setPosterReady(true);
      if (!activatedOnce) callbacksRef.current.onReady?.();
    };
    image.src = fallbackSrc;
    return () => {
      image.onload = null;
    };
  }, [fallbackSrc, activatedOnce]);

  useEffect(() => {
    if (!activatedOnce) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    setLoaded(false);
    setFallback(false);
    let alive = true;
    let resizeObserver: ResizeObserver | undefined;
    let release: (() => void) | undefined;

    void (async () => {
      try {
        const THREE = await import("three/webgpu");
        const [{ GLTFLoader }, { DRACOLoader }, { WaterMesh }] = await Promise.all([
          import("three/addons/loaders/GLTFLoader.js"),
          import("three/addons/loaders/DRACOLoader.js"),
          import("three/addons/objects/WaterMesh.js"),
        ]);
        if (!alive) return;

        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lowPower = coarse || (navigator.hardwareConcurrency || 8) <= 4;
        const biomeConfig = BIOME_CONFIG[biome];
        const random = seededRandom(biomeConfig.seed);
        const countFor = (desktop: number, mobile: number, multiplier = 1) =>
          Math.max(1, Math.round((lowPower ? mobile : desktop) * multiplier));
        const seabedHeight = (x: number, z: number) => {
          const softRidges =
            Math.sin(x * 0.055 + z * 0.018) * 0.52 +
            Math.cos(z * 0.043) * 0.42 +
            Math.sin((x - z) * 0.032) * 0.3;
          const sideRise = Math.max(0, (Math.abs(x) - 136) / 92) ** 2 * 5.6;
          const farRise = Math.max(0, (-z - 360) / 170) * 5.2;
          const frontShelf = Math.max(0, (z - 42) / 130) * 2.4;

          if (biomeConfig.terrain === "turbid-lagoon") {
            const lagoonChannel = Math.max(0, 1 - Math.abs(x * 0.42 + z * 0.05) / 34) * -0.95;
            const siltBanks = Math.sin(x * 0.026 + z * 0.014) * 0.28 + Math.cos(z * 0.023) * 0.24;
            return siltBanks + lagoonChannel + sideRise * 0.42 + farRise * 0.54 + frontShelf * 0.7 - 0.72;
          }

          if (biomeConfig.terrain === "triangle-wall") {
            const wallDrop = -Math.max(0, (-z - 210) / 210) * 2.4;
            const volcanicRibs =
              Math.max(0, Math.sin((x + 18) * 0.052)) * 1.2 +
              Math.max(0, Math.cos((z + x * 0.36) * 0.035)) * 0.9;
            return softRidges * 1.15 + volcanicRibs + sideRise * 0.72 + farRise * 0.36 + frontShelf - 0.82 + wallDrop;
          }

          if (biomeConfig.terrain === "caribbean-spur") {
            const groove = Math.sin((x + z * 0.16) * 0.055);
            const spurs = Math.max(0, groove) * 1.35 - Math.max(0, -groove) * 0.72;
            const terrace = Math.sin(z * 0.018) * 0.35;
            return softRidges * 0.7 + spurs + terrace + sideRise * 0.62 + farRise * 0.48 + frontShelf - 0.86;
          }

          const swimChannel = Math.max(0, 1 - Math.abs(x + z * 0.1) / 32) * -0.85;
          return softRidges + swimChannel + sideRise + farRise + frontShelf - 0.9;
        };
        const makeFloorTexture = () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1024;
          const context = canvas.getContext("2d");
          if (!context) return undefined;

          const palette = {
            "shelf-rubble": {
              base: ["#8f896d", "#b9ad83", "#6f715b"],
              fleck: ["#d6c997", "#efe0aa", "#7b7358"],
              streak: "rgba(102, 134, 116, 0.18)",
            },
            "silt-lagoon": {
              base: ["#777d5e", "#a39c70", "#526f5e"],
              fleck: ["#c7bf8b", "#6fa47a", "#ded3a3"],
              streak: "rgba(76, 133, 96, 0.28)",
            },
            "coral-wall": {
              base: ["#756f60", "#9c8464", "#4d6b66"],
              fleck: ["#d6a87b", "#edcf92", "#6de0c4", "#b586c8"],
              streak: "rgba(44, 126, 136, 0.22)",
            },
            "spur-groove": {
              base: ["#a99a75", "#d2be8b", "#6d7b67"],
              fleck: ["#f0d9a4", "#b98563", "#79d0bd"],
              streak: "rgba(233, 221, 172, 0.2)",
            },
          }[biomeConfig.floorTexture];

          const background = context.createLinearGradient(0, 0, 1024, 1024);
          background.addColorStop(0, palette.base[0]);
          background.addColorStop(0.54, palette.base[1]);
          background.addColorStop(1, palette.base[2]);
          context.fillStyle = background;
          context.fillRect(0, 0, 1024, 1024);
          context.globalCompositeOperation = "multiply";
          for (let index = 0; index < 90; index += 1) {
            const x = random() * 1024;
            const y = random() * 1024;
            const length = 110 + random() * 260;
            const width = 8 + random() * 28;
            context.save();
            context.translate(x, y);
            context.rotate((biomeConfig.floorTexture === "spur-groove" ? -0.34 : 0.42) + (random() - 0.5) * 0.65);
            context.fillStyle = palette.streak;
            context.beginPath();
            context.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
            context.fill();
            context.restore();
          }
          context.globalCompositeOperation = "screen";
          const fleckCount = lowPower ? 520 : 980;
          for (let index = 0; index < fleckCount; index += 1) {
            const radius = 0.8 + random() * (biomeConfig.floorTexture === "coral-wall" ? 4.8 : 3.4);
            context.fillStyle = palette.fleck[Math.floor(random() * palette.fleck.length)];
            context.globalAlpha = 0.08 + random() * 0.28;
            context.beginPath();
            context.ellipse(random() * 1024, random() * 1024, radius * (0.8 + random() * 1.8), radius, random() * Math.PI, 0, Math.PI * 2);
            context.fill();
          }
          context.globalAlpha = 1;
          context.globalCompositeOperation = "overlay";
          if (biomeConfig.floorTexture === "silt-lagoon") {
            for (let index = 0; index < 36; index += 1) {
              context.fillStyle = `rgba(91, 151, 88, ${0.08 + random() * 0.1})`;
              context.beginPath();
              context.ellipse(random() * 1024, random() * 1024, 28 + random() * 86, 8 + random() * 26, random() * Math.PI, 0, Math.PI * 2);
              context.fill();
            }
          } else if (biomeConfig.floorTexture === "spur-groove") {
            for (let index = 0; index < 12; index += 1) {
              const y = random() * 1024;
              const gradient = context.createLinearGradient(0, y - 46, 1024, y + 46);
              gradient.addColorStop(0, "rgba(255, 245, 196, 0)");
              gradient.addColorStop(0.5, "rgba(255, 245, 196, 0.18)");
              gradient.addColorStop(1, "rgba(255, 245, 196, 0)");
              context.fillStyle = gradient;
              context.fillRect(0, y - 46, 1024, 92);
            }
          } else if (biomeConfig.floorTexture === "coral-wall") {
            for (let index = 0; index < 26; index += 1) {
              context.fillStyle = `rgba(90, 209, 188, ${0.045 + random() * 0.08})`;
              context.fillRect(random() * 1024, random() * 1024, 20 + random() * 120, 3 + random() * 12);
            }
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(...biomeConfig.textureRepeat);
          texture.anisotropy = lowPower ? 2 : 8;
          return texture;
        };
        const renderer = new THREE.WebGPURenderer({ canvas, alpha: false, antialias: !lowPower });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.65));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = biomeConfig.exposure;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(biomeConfig.background);
        scene.fog = new THREE.FogExp2(biomeConfig.fog, biomeConfig.fogDensity);

        const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 520);
        camera.rotation.order = "YXZ";
        camera.position.set(0, 5.2, 17);

        const world = new THREE.Group();
        scene.add(world);
        const livingMaterials: Array<{ material: Material & { color?: Color; emissive?: Color }; base: Color; hotspotId: string }> = [];
        const coralTargets: Object3D[] = [];
        const animatedCorals: Object3D[] = [];
        const fishActors: Array<{ object: Object3D; offset: number; lane: number; depth: number; radius: number; height: number; speed: number; wobble: number }> = [];
        const bottomActors: Array<{ object: Object3D; baseScale: number; offset: number }> = [];
        const textures: Array<{ dispose: () => void }> = [];

        scene.add(new THREE.HemisphereLight(0xbff7ee, 0x103a4a, 1.78 * biomeConfig.exposure));
        const sun = new THREE.DirectionalLight(0xe8fff6, 3.45 * biomeConfig.exposure);
        sun.position.set(-24, 36, 18);
        world.add(sun);
        const blueFill = new THREE.PointLight(0x37d9e4, 40 * biomeConfig.exposure, 124, 1.55);
        blueFill.position.set(4, 9, -18);
        world.add(blueFill);
        const warmFill = new THREE.PointLight(0xf2a96d, 24 * biomeConfig.exposure, 64, 1.72);
        warmFill.position.set(22, 5, -43);
        world.add(warmFill);

        const textureLoader = new THREE.TextureLoader();
        const [gravelNormal, gravelArm] = await Promise.all([
          textureLoader.loadAsync("/textures/coral-gravel-normal.jpg"),
          textureLoader.loadAsync("/textures/coral-gravel-arm.jpg"),
        ]);
        const floorTexture = makeFloorTexture();
        if (floorTexture) textures.push(floorTexture);
        for (const texture of [gravelNormal, gravelArm]) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(...biomeConfig.textureRepeat);
          texture.anisotropy = lowPower ? 2 : 8;
          textures.push(texture);
        }

        const floorGeometry = new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH, lowPower ? 72 : 128, lowPower ? 112 : 208);
        floorGeometry.rotateX(-Math.PI / 2);
        const floorPosition = floorGeometry.attributes.position;
        for (let index = 0; index < floorPosition.count; index += 1) {
          const x = floorPosition.getX(index);
          const z = floorPosition.getZ(index) + FLOOR_CENTER_Z;
          floorPosition.setXYZ(index, x, seabedHeight(x, z), z);
        }
        floorGeometry.computeVertexNormals();
        const floor = new THREE.Mesh(
          floorGeometry,
          new THREE.MeshStandardMaterial({ map: floorTexture, normalMap: gravelNormal, aoMap: gravelArm, roughnessMap: gravelArm, metalnessMap: gravelArm, color: biomeConfig.floorColor, roughness: 0.9, metalness: 0.015 }),
        );
        world.add(floor);

        const causticCanvas = document.createElement("canvas");
        causticCanvas.width = causticCanvas.height = 512;
        const causticContext = causticCanvas.getContext("2d");
        if (causticContext) {
          causticContext.fillStyle = "#04313d";
          causticContext.fillRect(0, 0, 512, 512);
          causticContext.globalCompositeOperation = "screen";
          for (let index = 0; index < 112; index += 1) {
            const x = random() * 512;
            const y = random() * 512;
            const radius = 10 + random() * 45;
            const gradient = causticContext.createRadialGradient(x, y, radius * 0.35, x, y, radius);
            gradient.addColorStop(0, "rgba(220,255,239,.34)");
            gradient.addColorStop(0.48, "rgba(112,236,220,.1)");
            gradient.addColorStop(0.68, "rgba(0,0,0,0)");
            causticContext.strokeStyle = gradient;
            causticContext.lineWidth = 2 + random() * 2.5;
            causticContext.beginPath();
            causticContext.ellipse(x, y, radius, radius * (0.28 + random() * 0.3), random() * Math.PI, 0, Math.PI * 2);
            causticContext.stroke();
          }
        }
        const causticTexture = new THREE.CanvasTexture(causticCanvas);
        causticTexture.wrapS = causticTexture.wrapT = THREE.RepeatWrapping;
        causticTexture.repeat.set(12, 22);
        textures.push(causticTexture);
        const caustics = new THREE.Mesh(
          new THREE.PlaneGeometry(FLOOR_WIDTH * 0.96, FLOOR_DEPTH * 0.94),
          new THREE.MeshBasicMaterial({ map: causticTexture, color: biomeConfig.causticColor, transparent: true, opacity: biomeConfig.causticOpacity, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        caustics.rotation.x = -Math.PI / 2;
        caustics.position.set(0, -0.38, FLOOR_CENTER_Z);
        world.add(caustics);

        const normalCanvas = document.createElement("canvas");
        normalCanvas.width = normalCanvas.height = 512;
        const normalContext = normalCanvas.getContext("2d");
        if (normalContext) {
          normalContext.fillStyle = "rgb(128,128,255)";
          normalContext.fillRect(0, 0, 512, 512);
          for (let index = 0; index < 980; index += 1) {
            const shade = 102 + Math.floor(random() * 52);
            normalContext.strokeStyle = `rgba(${shade},${146 - Math.floor(random() * 36)},255,.3)`;
            normalContext.lineWidth = 1 + random() * 3.8;
            normalContext.beginPath();
            const x = random() * 512;
            const y = random() * 512;
            normalContext.moveTo(x, y);
            normalContext.bezierCurveTo(x + 26, y - 13, x + 48, y + 16, x + 82, y + (random() - 0.5) * 18);
            normalContext.stroke();
          }
          normalContext.globalCompositeOperation = "screen";
          for (let index = 0; index < 190; index += 1) {
            normalContext.strokeStyle = "rgba(210,255,246,.16)";
            normalContext.lineWidth = 0.8 + random() * 1.5;
            normalContext.beginPath();
            const x = random() * 512;
            const y = random() * 512;
            normalContext.ellipse(x, y, 18 + random() * 72, 4 + random() * 16, random() * Math.PI, 0, Math.PI * 2);
            normalContext.stroke();
          }
        }
        const waterNormals = new THREE.CanvasTexture(normalCanvas);
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
        textures.push(waterNormals);
        const water = new WaterMesh(new THREE.PlaneGeometry(FLOOR_WIDTH * 1.42, FLOOR_DEPTH * 1.18), {
          waterNormals,
          alpha: biomeConfig.waterAlpha,
          waterColor: biomeConfig.waterColor,
          sunColor: 0xe6fff8,
          sunDirection: new THREE.Vector3(0.28, 0.9, 0.22).normalize(),
          distortionScale: biomeConfig.waterDistortion,
          size: 0.9,
          resolutionScale: lowPower ? 0.28 : 0.56,
        });
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, biomeConfig.waterY, FLOOR_CENTER_Z + 18);
        water.material.side = THREE.DoubleSide;
        world.add(water);

        const surfaceParticleCount = countFor(540, 220, 0.8 + biomeConfig.particleDensity * 0.22);
        const surfaceGeometry = new THREE.BufferGeometry();
        const surfacePositions = new Float32Array(surfaceParticleCount * 3);
        for (let index = 0; index < surfaceParticleCount; index += 1) {
          surfacePositions[index * 3] = (random() - 0.5) * (FLOOR_WIDTH * 0.92);
          surfacePositions[index * 3 + 1] = biomeConfig.waterY - 1.05 + random() * 1.35;
          surfacePositions[index * 3 + 2] = FLOOR_CENTER_Z + (random() - 0.5) * (FLOOR_DEPTH * 0.92);
        }
        surfaceGeometry.setAttribute("position", new THREE.BufferAttribute(surfacePositions, 3));
        const surfaceGlints = new THREE.Points(
          surfaceGeometry,
          new THREE.PointsMaterial({ color: 0xddfff7, size: lowPower ? 0.045 : 0.06, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        world.add(surfaceGlints);

        const surfaceRippleCount = countFor(190, 80, 0.82 + biomeConfig.particleDensity * 0.18);
        const surfaceRippleGeometry = new THREE.BufferGeometry();
        const surfaceRipplePositions = new Float32Array(surfaceRippleCount * 6);
        for (let index = 0; index < surfaceRippleCount; index += 1) {
          const offset = index * 6;
          const length = 5 + random() * 18;
          const x = (random() - 0.5) * FLOOR_WIDTH * 0.86;
          const y = biomeConfig.waterY - 1.2 + random() * 1.1;
          const z = FLOOR_CENTER_Z + (random() - 0.5) * FLOOR_DEPTH * 0.9;
          surfaceRipplePositions[offset] = x;
          surfaceRipplePositions[offset + 1] = y;
          surfaceRipplePositions[offset + 2] = z;
          surfaceRipplePositions[offset + 3] = x + length;
          surfaceRipplePositions[offset + 4] = y + (random() - 0.5) * 0.12;
          surfaceRipplePositions[offset + 5] = z + (random() - 0.5) * 1.8;
        }
        surfaceRippleGeometry.setAttribute("position", new THREE.BufferAttribute(surfaceRipplePositions, 3));
        const surfaceRipples = new THREE.LineSegments(
          surfaceRippleGeometry,
          new THREE.LineBasicMaterial({ color: 0xd9fff6, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        world.add(surfaceRipples);

        const wallMaterial = new THREE.MeshStandardMaterial({ color: biomeConfig.wallColor, roughness: 0.98, transparent: true, opacity: 0.38, side: THREE.DoubleSide });
        const makeReefWall = (width: number, height: number, wallPosition: [number, number, number], rotationY = 0) => {
          const wallGeometry = new THREE.PlaneGeometry(width, height, lowPower ? 18 : 34, 7);
          const wallPositionAttribute = wallGeometry.attributes.position;
          for (let index = 0; index < wallPositionAttribute.count; index += 1) {
            const x = wallPositionAttribute.getX(index);
            const y = wallPositionAttribute.getY(index);
            wallPositionAttribute.setZ(index, Math.sin(x * 0.045 + y * 0.18) * 2.4 + Math.cos(x * 0.022) * 1.7);
          }
          wallGeometry.computeVertexNormals();
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(...wallPosition);
          wall.rotation.y = rotationY;
          world.add(wall);
        };
        makeReefWall(FLOOR_WIDTH * 1.02, 44, [0, 10, FLOOR_CENTER_Z - FLOOR_DEPTH * 0.52]);
        makeReefWall(FLOOR_DEPTH * 1.02, 44, [-FLOOR_WIDTH * 0.5, 9.5, FLOOR_CENTER_Z], Math.PI / 2);
        makeReefWall(FLOOR_DEPTH * 1.02, 44, [FLOOR_WIDTH * 0.5, 9.5, FLOOR_CENTER_Z], -Math.PI / 2);

        const randomFloorPoint = (xScale = 0.9, zScale = 0.88): [number, number] => [
          (random() - 0.5) * FLOOR_WIDTH * xScale,
          FLOOR_CENTER_Z + (random() - 0.5) * FLOOR_DEPTH * zScale,
        ];
        const makeBladeGeometry = (height: number, width: number, curve: number, segments: number) => {
          const positions: number[] = [];
          const indices: number[] = [];
          for (let row = 0; row <= segments; row += 1) {
            const t = row / segments;
            const taper = 1 - t * 0.82;
            const sway = Math.sin(t * Math.PI) * curve;
            const y = (t - 0.5) * height;
            positions.push(sway - width * taper, y, 0, sway + width * taper, y, 0);
            if (row < segments) {
              const base = row * 2;
              indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
            }
          }
          const bladeGeometry = new THREE.BufferGeometry();
          bladeGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
          bladeGeometry.setIndex(indices);
          bladeGeometry.computeVertexNormals();
          return bladeGeometry;
        };
        const makeRubbleGeometry = () => {
          const rubbleGeometry = new THREE.DodecahedronGeometry(1, 1);
          const rubblePosition = rubbleGeometry.attributes.position;
          for (let index = 0; index < rubblePosition.count; index += 1) {
            const x = rubblePosition.getX(index);
            const y = rubblePosition.getY(index);
            const z = rubblePosition.getZ(index);
            const warp =
              0.74 +
              Math.sin(index * 2.41) * 0.14 +
              Math.cos(x * 3.2 + z * 1.7) * 0.12;
            rubblePosition.setXYZ(index, x * warp, y * (0.34 + warp * 0.18), z * (0.68 + warp * 0.22));
          }
          rubbleGeometry.computeVertexNormals();
          return rubbleGeometry;
        };
        const makeTubeSpongeGeometry = () => {
          const profile = [
            new THREE.Vector2(0.28, -0.92),
            new THREE.Vector2(0.42, -0.7),
            new THREE.Vector2(0.34, -0.18),
            new THREE.Vector2(0.46, 0.42),
            new THREE.Vector2(0.36, 0.9),
          ];
          const spongeGeometry = new THREE.LatheGeometry(profile, 18);
          spongeGeometry.computeVertexNormals();
          return spongeGeometry;
        };

        const rocks = new THREE.InstancedMesh(
          new THREE.IcosahedronGeometry(1, 1),
          new THREE.MeshStandardMaterial({ color: 0x3d6b62, roughness: 0.94 }),
          countFor(330, 150, biomeConfig.rockDensity),
        );
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const position = new THREE.Vector3();
        const scale = new THREE.Vector3();
        for (let index = 0; index < rocks.count; index += 1) {
          const shelf = index % 5 === 0;
          const x = shelf
            ? (random() < 0.5 ? -1 : 1) * (FLOOR_WIDTH * 0.27 + random() * FLOOR_WIDTH * 0.2)
            : (random() - 0.5) * FLOOR_WIDTH * 0.88;
          const z = FLOOR_CENTER_Z + FLOOR_DEPTH * 0.44 - random() * FLOOR_DEPTH * 0.86;
          const size = shelf ? 2.4 + random() * 7.8 : 0.45 + random() * 3.1;
          position.set(x, seabedHeight(x, z) + size * 0.28, z);
          quaternion.setFromEuler(new THREE.Euler(random(), random() * Math.PI, random()));
          scale.set(size * (0.7 + random() * 0.55), size * (0.42 + random() * 0.38), size);
          matrix.compose(position, quaternion, scale);
          rocks.setMatrixAt(index, matrix);
        }
        rocks.instanceMatrix.needsUpdate = true;
        world.add(rocks);

        const reefColor = new THREE.Color();
        const sponges = new THREE.InstancedMesh(
          makeTubeSpongeGeometry(),
          new THREE.MeshStandardMaterial({ color: 0xa97958, roughness: 0.92 }),
          countFor(185, 82, biomeConfig.spongeDensity),
        );
        const clusters = biomeConfig.clusters;
        for (let index = 0; index < sponges.count; index += 1) {
          const cluster = clusters[index % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 4.5 + random() * cluster[3];
          const height = 0.55 + random() * 1.35;
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius;
          position.set(x, seabedHeight(x, z) + height * 0.86, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.2));
          scale.set(0.34 + random() * 0.55, height, 0.34 + random() * 0.55);
          matrix.compose(position, quaternion, scale);
          sponges.setMatrixAt(index, matrix);
          reefColor.setHSL(0.08 + random() * 0.04, 0.26 + random() * 0.18, 0.38 + random() * 0.16);
          sponges.setColorAt(index, reefColor);
        }
        sponges.instanceMatrix.needsUpdate = true;
        if (sponges.instanceColor) sponges.instanceColor.needsUpdate = true;
        world.add(sponges);

        const grass = new THREE.InstancedMesh(
          makeBladeGeometry(2.35, 0.105, 0.11, 5),
          new THREE.MeshStandardMaterial({ color: biomeConfig.grassColor, roughness: 0.84, transparent: true, opacity: 0.66, side: THREE.DoubleSide }),
          countFor(980, 430, biomeConfig.grassDensity),
        );
        for (let index = 0; index < grass.count; index += 1) {
          const meadow = index % 4 === 0;
          const [fieldX, fieldZ] = randomFloorPoint(meadow ? 0.82 : 0.95, meadow ? 0.78 : 0.92);
          const x = fieldX + (meadow ? Math.sin(index * 0.83) * 18 : 0);
          const z = fieldZ;
          const height = 0.5 + random() * 1.65;
          position.set(x, seabedHeight(x, z) + height * 0.5, z);
          quaternion.setFromEuler(new THREE.Euler(0, random() * Math.PI, (random() - 0.5) * 0.2));
          scale.set(1, height, 1);
          matrix.compose(position, quaternion, scale);
          grass.setMatrixAt(index, matrix);
        }
        grass.instanceMatrix.needsUpdate = true;
        world.add(grass);

        const kelp = new THREE.InstancedMesh(
          makeBladeGeometry(5.4, 0.26, 0.34, 8),
          new THREE.MeshStandardMaterial({ color: 0x5e9f6d, roughness: 0.82, transparent: true, opacity: 0.46, side: THREE.DoubleSide }),
          countFor(280, 115, biomeConfig.kelpDensity),
        );
        for (let index = 0; index < kelp.count; index += 1) {
          const cluster = clusters[(index + 4) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 6 + random() * (cluster[3] + 18);
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius * 0.86;
          const height = 0.55 + random() * 1.3;
          position.set(x, seabedHeight(x, z) + height * 2.7, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.24, random() * Math.PI, (random() - 0.5) * 0.32));
          scale.set(0.58 + random() * 0.85, height, 1);
          matrix.compose(position, quaternion, scale);
          kelp.setMatrixAt(index, matrix);
          reefColor.setHSL(biomeConfig.kelpHue + random() * 0.07, 0.35 + random() * 0.18, 0.32 + random() * 0.13);
          kelp.setColorAt(index, reefColor);
        }
        kelp.instanceMatrix.needsUpdate = true;
        if (kelp.instanceColor) kelp.instanceColor.needsUpdate = true;
        world.add(kelp);

        const reefRubble = new THREE.InstancedMesh(
          makeRubbleGeometry(),
          new THREE.MeshStandardMaterial({ color: 0x7b7864, roughness: 0.96, metalness: 0.01 }),
          countFor(420, 175, biomeConfig.rockDensity + biomeConfig.coralHeadDensity * 0.48),
        );
        for (let index = 0; index < reefRubble.count; index += 1) {
          const cluster = clusters[(index + 2) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 6 + random() * (cluster[3] + 16);
          const x = cluster[0] + Math.cos(theta) * radius + (random() - 0.5) * 10;
          const z = cluster[2] + Math.sin(theta) * radius - random() * 8;
          const size = 0.45 + random() * 2.4;
          position.set(x, seabedHeight(x, z) + size * 0.15, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.38, random() * Math.PI, (random() - 0.5) * 0.38));
          scale.set(size * (0.78 + random() * 0.65), size * (0.36 + random() * 0.32), size * (0.72 + random() * 0.7));
          matrix.compose(position, quaternion, scale);
          reefRubble.setMatrixAt(index, matrix);
          reefColor.setHSL(0.1 + random() * 0.12, 0.12 + random() * 0.18, 0.32 + random() * 0.2);
          reefRubble.setColorAt(index, reefColor);
        }
        reefRubble.instanceMatrix.needsUpdate = true;
        if (reefRubble.instanceColor) reefRubble.instanceColor.needsUpdate = true;
        world.add(reefRubble);

        const seaFans = new THREE.InstancedMesh(
          new THREE.PlaneGeometry(1, 1.8, 1, 5),
          new THREE.MeshStandardMaterial({ color: 0x35c8a2, roughness: 0.8, transparent: true, opacity: 0.68, side: THREE.DoubleSide }),
          countFor(210, 90, biomeConfig.seaFanDensity),
        );
        for (let index = 0; index < seaFans.count; index += 1) {
          const [x, z] = randomFloorPoint(0.82, 0.86);
          const height = 0.9 + random() * 2.4;
          position.set(x, seabedHeight(x, z) + height * 0.48, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.28));
          scale.set(0.65 + random() * 0.9, height, 1);
          matrix.compose(position, quaternion, scale);
          seaFans.setMatrixAt(index, matrix);
          reefColor.setHSL(biomeConfig.seaFanHue + random() * 0.1, 0.5 + random() * 0.2, 0.42 + random() * 0.16);
          seaFans.setColorAt(index, reefColor);
        }
        seaFans.instanceMatrix.needsUpdate = true;
        if (seaFans.instanceColor) seaFans.instanceColor.needsUpdate = true;
        world.add(seaFans);

        const softPolyps = new THREE.InstancedMesh(
          makeBladeGeometry(1.55, 0.045, 0.16, 5),
          new THREE.MeshStandardMaterial({ color: 0x9b7194, roughness: 0.86, transparent: true, opacity: 0.58, side: THREE.DoubleSide }),
          countFor(680, 270, biomeConfig.softPolypDensity),
        );
        for (let index = 0; index < softPolyps.count; index += 1) {
          const cluster = clusters[(index + 7) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = random() * cluster[3] * 0.9;
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius;
          const height = 0.5 + random() * 1.25;
          position.set(x, seabedHeight(x, z) + height * 0.74, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.32, random() * Math.PI, (random() - 0.5) * 0.32));
          scale.set(0.78 + random() * 0.7, height, 0.78 + random() * 0.7);
          matrix.compose(position, quaternion, scale);
          softPolyps.setMatrixAt(index, matrix);
          reefColor.setHSL(0.82 + random() * 0.08, 0.28 + random() * 0.26, 0.5 + random() * 0.14);
          softPolyps.setColorAt(index, reefColor);
        }
        softPolyps.instanceMatrix.needsUpdate = true;
        if (softPolyps.instanceColor) softPolyps.instanceColor.needsUpdate = true;
        world.add(softPolyps);

        const ambientScanColonies =
          BIOME_AMBIENT_SCAN_COLONIES[biome] ?? AMBIENT_SCAN_COLONIES;
        const visibleAmbientScans = lowPower
          ? [
              ...ambientScanColonies.slice(0, Math.min(10, ambientScanColonies.length)),
              ...ambientScanColonies.slice(-6),
            ]
          : ambientScanColonies;
        const particleHosts = [
          ...hotspotsRef.current,
          ...visibleAmbientScans,
        ];
        const lifeParticleCount = countFor(2900, 1150, biomeConfig.lifeDensity);
        const lifeGeometry = new THREE.BufferGeometry();
        const lifePositions = new Float32Array(lifeParticleCount * 3);
        const lifeBase = new Float32Array(lifeParticleCount * 3);
        const lifeMeta = new Float32Array(lifeParticleCount * 4);
        const lifeColors = new Float32Array(lifeParticleCount * 3);
        const livingPalette = biomeConfig.lifePalette;
        for (let index = 0; index < lifeParticleCount; index += 1) {
          const hotspot = particleHosts[index % particleHosts.length] || DEFAULT_HOTSPOTS[0];
          const theta = random() * Math.PI * 2;
          const radius = 0.9 + random() * 6.2;
          const height = -0.16 + random() * 3.1;
          const x = hotspot.position[0] + Math.cos(theta) * radius;
          const y = hotspot.position[1] + height;
          const z = hotspot.position[2] + Math.sin(theta) * radius * 0.68;
          lifeBase[index * 3] = x;
          lifeBase[index * 3 + 1] = y;
          lifeBase[index * 3 + 2] = z;
          lifePositions[index * 3] = x;
          lifePositions[index * 3 + 1] = y;
          lifePositions[index * 3 + 2] = z;
          lifeMeta[index * 4] = random() * Math.PI * 2;
          lifeMeta[index * 4 + 1] = 0.28 + random() * 1.15;
          lifeMeta[index * 4 + 2] = 0.22 + random() * 0.92;
          lifeMeta[index * 4 + 3] = radius;
          reefColor.setHex(livingPalette[Math.floor(random() * livingPalette.length)]);
          reefColor.multiplyScalar(0.76 + random() * 0.36);
          lifeColors[index * 3] = reefColor.r;
          lifeColors[index * 3 + 1] = reefColor.g;
          lifeColors[index * 3 + 2] = reefColor.b;
        }
        const lifePositionAttribute = new THREE.BufferAttribute(lifePositions, 3);
        lifeGeometry.setAttribute("position", lifePositionAttribute);
        lifeGeometry.setAttribute("color", new THREE.BufferAttribute(lifeColors, 3));
        const lifeMaterial = new THREE.PointsMaterial({
          vertexColors: true,
          size: lowPower ? 0.07 : 0.09,
          transparent: true,
          opacity: 0.68,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        const reefLife = new THREE.Points(lifeGeometry, lifeMaterial);
        world.add(reefLife);

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        dracoLoader.preload();
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        const scanTemplatePromises = new Map<ScanAssetKey, Promise<Object3D>>();

        const getScanTemplate = (scanKey: ScanAssetKey) => {
          const existing = scanTemplatePromises.get(scanKey);
          if (existing) return existing;

          const asset = SCANS[scanKey];
          const promise = gltfLoader.loadAsync(lowPower ? asset.mobile : asset.desktop).then((gltf) => {
            const template = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(template);
            const templateSize = bounds.getSize(new THREE.Vector3());
            const center = bounds.getCenter(new THREE.Vector3());
            const fit = 1 / Math.max(templateSize.x, templateSize.y, templateSize.z, 0.001);
            template.scale.setScalar(fit);
            template.position.copy(center.multiplyScalar(-fit));
            return template;
          });
          scanTemplatePromises.set(scanKey, promise);
          return promise;
        };

        const placeScanColony = async (hotspot: ReefSceneHotspot, interactive: boolean) => {
          const scanKey = hotspot.scan ?? (hotspot.id in SCANS ? hotspot.id as ScanAssetKey : "acro-table");
          const asset = SCANS[scanKey];
          const template = await getScanTemplate(scanKey);
          if (!alive) return;
          const model = template.clone(true);
          const tint = hotspot.tint ?? asset.tint;
          const tintColor = new THREE.Color(tint);
          model.traverse((object) => {
            object.userData.hotspotId = hotspot.id;
            object.userData.scanKey = scanKey;
            if (!isMesh(object)) return;
            object.receiveShadow = true;
            const source = Array.isArray(object.material) ? object.material : [object.material];
            const meshBounds = new THREE.Box3().setFromObject(object);
            const meshSize = meshBounds.getSize(new THREE.Vector3());
            const meshCenter = meshBounds.getCenter(new THREE.Vector3());
            const darkDisplayMaterial = source.some((material) => {
              const display = material as Material & { color?: Color; map?: unknown };
              if (!display.color) return false;
              const hsl = { h: 0, s: 0, l: 0 };
              display.color.getHSL(hsl);
              return !display.map && hsl.l < 0.18;
            });
            if (darkDisplayMaterial && meshSize.y < 0.09 && meshSize.x > 0.56 && meshSize.z > 0.56 && meshCenter.y < -0.24) {
              object.visible = false;
              return;
            }
            const cloned = source.map((material) => material.clone());
            object.material = Array.isArray(object.material) ? cloned : cloned[0];
            for (const material of cloned) {
              const living = material as Material & { color?: Color; emissive?: Color; roughness?: number; metalness?: number };
              if (!living.color) continue;
              if (asset.preserveColor) living.color.lerp(tintColor, 0.24);
              else living.color.setHex(tint);
              if (living.emissive) living.emissive.setHex(0x231008);
              if (typeof living.roughness === "number") living.roughness = Math.max(0.5, living.roughness);
              if (typeof living.metalness === "number") living.metalness = 0;
              livingMaterials.push({ material: living, base: living.color.clone(), hotspotId: hotspot.id });
            }
          });
          const pedestal = new THREE.Group();
          pedestal.name = hotspot.id;
          pedestal.userData.hotspotId = hotspot.id;
          pedestal.userData.baseScale = hotspot.size ?? asset.size;
          pedestal.userData.animOffset = random() * Math.PI * 2;
          pedestal.position.set(...hotspot.position);
          pedestal.rotation.y = hotspot.yaw ?? (scanKey === "massive-star" ? -0.7 : 0.35);
          pedestal.scale.setScalar(pedestal.userData.baseScale as number);
          pedestal.add(model);
          animatedCorals.push(pedestal);
          if (interactive) coralTargets.push(pedestal);
          world.add(pedestal);
        };
        await Promise.allSettled(hotspotsRef.current.map((hotspot) => placeScanColony(hotspot, true)));
        await Promise.allSettled(
          visibleAmbientScans.map((hotspot) =>
            placeScanColony(hotspot, false),
          ),
        );

        const creatureAssets: Array<{
          src: string;
          count: number;
          fit: number;
          rotationY: number;
          floor?: boolean;
          scaleMin: number;
          scaleMax: number;
          speed: number;
        }> = [
          { src: "/models/barramundi-fish.glb", count: countFor(22, 10, biomeConfig.fishDensity), fit: 2.2, rotationY: Math.PI / 2, scaleMin: 0.55, scaleMax: 1.2, speed: 0.12 },
          { src: "/models/smithsonian-diodon-hystrix.glb", count: countFor(7, 3, biomeConfig.fishDensity * 0.9), fit: 1.45, rotationY: Math.PI / 2, scaleMin: 0.86, scaleMax: 1.28, speed: 0.09 },
          { src: "/models/smithsonian-lactophrys-bicaudalis.glb", count: countFor(7, 3, biomeConfig.fishDensity), fit: 1.25, rotationY: Math.PI / 2, scaleMin: 0.82, scaleMax: 1.18, speed: 0.105 },
          { src: "/models/smithsonian-linckia-laevigata.glb", count: countFor(13, 5, biomeConfig.bottomLifeDensity), fit: 2, rotationY: 0, floor: true, scaleMin: 0.72, scaleMax: 1.18, speed: 0.02 },
        ];
        await Promise.allSettled(
          creatureAssets.map(async (asset) => {
            const gltf = await gltfLoader.loadAsync(asset.src);
            if (!alive) return;
            const template = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(template);
            const templateSize = bounds.getSize(new THREE.Vector3());
            const templateCenter = bounds.getCenter(new THREE.Vector3());
            const fit = asset.fit / Math.max(templateSize.x, templateSize.y, templateSize.z, 0.001);
            template.position.copy(templateCenter.multiplyScalar(-fit));
            template.scale.setScalar(fit);

            for (let index = 0; index < asset.count; index += 1) {
              const pivot = new THREE.Group();
              const creature = template.clone(true);
              creature.rotation.y = asset.rotationY;
              const actorScale = asset.scaleMin + random() * (asset.scaleMax - asset.scaleMin);
              creature.scale.multiplyScalar(actorScale);
              pivot.add(creature);

              if (asset.floor) {
                const [x, z] = randomFloorPoint(0.78, 0.78);
                pivot.position.set(x, seabedHeight(x, z) + 0.26, z);
                pivot.rotation.set((random() - 0.5) * 0.18, random() * Math.PI * 2, (random() - 0.5) * 0.18);
                const baseScale = 0.82 + random() * 0.42;
                pivot.scale.setScalar(baseScale);
                bottomActors.push({ object: pivot, baseScale, offset: random() * Math.PI * 2 });
              } else {
                fishActors.push({
                  object: pivot,
                  offset: random() * Math.PI * 2,
                  lane: (random() - 0.5) * FLOOR_WIDTH * 0.62,
                  depth: FLOOR_CENTER_Z + FLOOR_DEPTH * 0.36 - random() * FLOOR_DEPTH * 0.7,
                  radius: 7 + random() * 12,
                  height: 3.3 + random() * 5.2,
                  speed: asset.speed + random() * 0.024,
                  wobble: 0.22 + random() * 0.42,
                });
              }
              world.add(pivot);
            }
          }),
        );

        const particleCount = countFor(3200, 1250, biomeConfig.particleDensity);
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        for (let index = 0; index < particleCount; index += 1) {
          particlePositions[index * 3] = (random() - 0.5) * FLOOR_WIDTH * 0.96;
          particlePositions[index * 3 + 1] = random() * 17;
          particlePositions[index * 3 + 2] = FLOOR_CENTER_Z + (random() - 0.5) * FLOOR_DEPTH * 0.94;
        }
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xb8efe7, size: lowPower ? 0.04 : 0.052, transparent: true, opacity: 0.34, depthWrite: false }));
        world.add(particles);

        const nav = { yaw: 0, pitch: -0.14, velocity: new THREE.Vector3(), keys: new Set<string>(), dragging: false, moved: false, lastX: 0, lastY: 0, mobileForward: false, zone: "", lastFocus: "" as string | null };
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        const projected = new THREE.Vector3();
        const desired = new THREE.Vector3();
        const look = new THREE.Vector3(0, 2.5, -10);
        const clock = new THREE.Clock();

        const resize = () => {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        const point = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
          if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${event.clientX - rect.left}px,${event.clientY - rect.top}px,0)`;
        };
        const pointerDown = (event: PointerEvent) => {
          if (!activeRef.current || focusRef.current) return;
          if ((event.target as Element).closest(".reef-scene__swim,.reef-scene__marker")) return;
          host.focus({ preventScroll: true });
          point(event);
          nav.dragging = true;
          nav.moved = false;
          nav.lastX = event.clientX;
          nav.lastY = event.clientY;
          host.setPointerCapture(event.pointerId);
        };
        const pointerMove = (event: PointerEvent) => {
          point(event);
          if (!nav.dragging || focusRef.current) return;
          const dx = event.clientX - nav.lastX;
          const dy = event.clientY - nav.lastY;
          if (Math.abs(dx) + Math.abs(dy) > 2) nav.moved = true;
          nav.yaw -= dx * 0.0034;
          nav.pitch = THREE.MathUtils.clamp(nav.pitch - dy * 0.0028, -0.78, 0.55);
          nav.lastX = event.clientX;
          nav.lastY = event.clientY;
        };
        const pointerUp = (event: PointerEvent) => {
          if (!nav.dragging) return;
          nav.dragging = false;
          if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
          if (!nav.moved && activeRef.current) {
            point(event);
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObjects(coralTargets, true)[0];
            const id = hit?.object.userData.hotspotId as string | undefined;
            if (id) callbacksRef.current.onHotspotSelect?.(id);
          }
        };
        const keyDown = (event: KeyboardEvent) => {
          if (!activeRef.current) return;
          const key = event.key.toLowerCase();
          if (["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(key)) {
            event.preventDefault();
            nav.keys.add(key);
          }
        };
        const keyUp = (event: KeyboardEvent) => nav.keys.delete(event.key.toLowerCase());
        const wheel = (event: WheelEvent) => {
          if (!activeRef.current || focusRef.current) return;
          event.preventDefault();
          nav.velocity.addScaledVector(direction.set(-Math.sin(nav.yaw), 0, -Math.cos(nav.yaw)), -event.deltaY * 0.0027);
        };

        host.addEventListener("pointerdown", pointerDown);
        host.addEventListener("pointermove", pointerMove);
        host.addEventListener("pointerup", pointerUp);
        host.addEventListener("pointercancel", pointerUp);
        host.addEventListener("keydown", keyDown);
        host.addEventListener("keyup", keyUp);
        host.addEventListener("wheel", wheel, { passive: false });
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        await renderer.init();
        if (!alive) {
          renderer.dispose();
          return;
        }
        const backend = (renderer as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend;
        callbacksRef.current.onEngineChange?.(backend?.isWebGPUBackend ? "WebGPU" : "WebGL 2");
        callbacksRef.current.onReady?.();
        setLoaded(true);

        const baseFog = new THREE.Color(biomeConfig.fog);
        const phaseColors = {
          healthy: { fog: baseFog.clone(), density: biomeConfig.fogDensity, wash: new THREE.Color(0xd69c79), blend: 0.02, life: 0.74 },
          heat: { fog: baseFog.clone().lerp(new THREE.Color(0x8e7968), 0.28), density: biomeConfig.fogDensity + 0.002, wash: new THREE.Color(0xf09b70), blend: 0.2, life: 0.54 },
          bleaching: { fog: baseFog.clone().lerp(new THREE.Color(0xa7aaa1), 0.42), density: biomeConfig.fogDensity + 0.004, wash: new THREE.Color(0xe8ddcc), blend: 0.72, life: 0.3 },
          recovery: { fog: baseFog.clone().lerp(new THREE.Color(0x4cae87), 0.26), density: Math.max(0.007, biomeConfig.fogDensity - 0.001), wash: new THREE.Color(0x92c487), blend: 0.09, life: 0.8 },
        };
        const targetColor = new THREE.Color();
        const spotVector = new THREE.Vector3();

        renderer.setAnimationLoop(() => {
          if (!alive) return;
          const delta = Math.min(clock.getDelta(), 0.05);
          const elapsed = clock.elapsedTime;
          const currentPhase = phaseColors[phaseRef.current];
          const runoff = stressorRef.current === "runoff";
          scene.fog!.color.lerp(currentPhase.fog, 1 - Math.exp(-delta * 1.4));
          (scene.fog as InstanceType<typeof THREE.FogExp2>).density = THREE.MathUtils.lerp((scene.fog as InstanceType<typeof THREE.FogExp2>).density, currentPhase.density + (runoff ? 0.016 : 0), 1 - Math.exp(-delta * 1.4));
          for (const entry of livingMaterials) {
            if (!entry.material.color) continue;
            const blend = restoredRef.current.includes(entry.hotspotId) ? 0.02 : currentPhase.blend;
            targetColor.copy(entry.base).lerp(currentPhase.wash, blend);
            entry.material.color.lerp(targetColor, 1 - Math.exp(-delta * 1.8));
          }
          lifeMaterial.opacity = THREE.MathUtils.lerp(lifeMaterial.opacity, currentPhase.life, 1 - Math.exp(-delta * 1.8));

          causticTexture.offset.x = (elapsed * 0.012) % 1;
          causticTexture.offset.y = (elapsed * -0.008) % 1;
          waterNormals.offset.x = (elapsed * 0.028) % 1;
          waterNormals.offset.y = (elapsed * 0.017) % 1;
          surfaceGlints.position.x = reduced ? 0 : Math.sin(elapsed * 0.06) * 5.4;
          surfaceGlints.position.z = reduced ? 0 : Math.cos(elapsed * 0.045) * 4.6;
          surfaceRipples.position.x = reduced ? 0 : Math.sin(elapsed * 0.04) * 3.8;
          surfaceRipples.position.z = reduced ? 0 : Math.cos(elapsed * 0.035) * 3.2;
          particles.position.x = Math.sin(elapsed * 0.04) * 6;
          grass.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.42) * 0.014;
          kelp.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.32) * 0.022;
          seaFans.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.28) * 0.012;
          softPolyps.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.5) * 0.01;
          animatedCorals.forEach((target, index) => {
            const baseScale = typeof target.userData.baseScale === "number" ? target.userData.baseScale : 1;
            const animOffset = typeof target.userData.animOffset === "number" ? target.userData.animOffset : index * 1.7;
            const pulse = reduced ? 1 : 1 + Math.sin(elapsed * 0.8 + animOffset) * 0.008;
            target.scale.setScalar(baseScale * pulse);
          });
          if (!reduced) {
            for (let index = 0; index < lifeParticleCount; index += 1) {
              const offset = index * 3;
              const meta = index * 4;
              const phase = lifeMeta[meta] + elapsed * lifeMeta[meta + 1];
              const radius = lifeMeta[meta + 3];
              const buoyancy = (Math.sin(phase * 1.8) + Math.cos(elapsed * 0.52 + index)) * 0.055;
              lifePositions[offset] =
                lifeBase[offset] +
                Math.cos(phase) * radius * 0.08 +
                Math.sin(elapsed * 0.34 + lifeBase[offset + 2] * 0.05) * 0.16;
              lifePositions[offset + 1] =
                lifeBase[offset + 1] +
                Math.sin(phase * 1.35) * lifeMeta[meta + 2] * 0.18 +
                buoyancy;
              lifePositions[offset + 2] =
                lifeBase[offset + 2] +
                Math.sin(phase) * radius * 0.1 +
                Math.cos(elapsed * 0.25 + lifeBase[offset] * 0.04) * 0.12;
            }
            lifePositionAttribute.needsUpdate = true;
          }
          fishActors.forEach((actor, index) => {
            const t = elapsed * (actor.speed + (index % 4) * 0.012) + actor.offset;
            actor.object.position.set(
              actor.lane + Math.sin(t * 0.7) * actor.radius,
              actor.height + Math.sin(t * 1.4) * actor.wobble,
              actor.depth + Math.cos(t * 0.55) * actor.radius * 0.76,
            );
            actor.object.rotation.y = Math.PI + Math.sin(t * 0.7) * 0.55;
            actor.object.rotation.z = Math.sin(t * 1.5) * 0.025;
          });
          bottomActors.forEach((actor, index) => {
            const pulse = reduced ? 1 : 1 + Math.sin(elapsed * 0.18 + actor.offset + index * 0.25) * 0.01;
            actor.object.scale.setScalar(actor.baseScale * pulse);
          });

          const focused = focusRef.current ? hotspotsRef.current.find((item) => item.id === focusRef.current) : undefined;
          if (focused) {
            const focusSize = focused.size ?? (focused.scan ? SCANS[focused.scan].size : 6.5);
            desired.set(focused.position[0] + 1.8, focused.position[1] + 2.3, focused.position[2] + Math.max(9.6, focusSize * 1.55));
            camera.position.lerp(desired, 1 - Math.exp(-delta * 2.8));
            spotVector.set(...focused.position);
            look.lerp(spotVector, 1 - Math.exp(-delta * 3.4));
            camera.lookAt(look);
            nav.lastFocus = focused.id;
          } else {
            if (nav.lastFocus) {
              camera.getWorldDirection(direction);
              nav.yaw = Math.atan2(-direction.x, -direction.z);
              nav.pitch = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1));
              nav.lastFocus = null;
            }
            const wantsForward = nav.keys.has("w") || nav.keys.has("arrowup") || nav.mobileForward;
            const wantsBack = nav.keys.has("s") || nav.keys.has("arrowdown");
            const wantsLeft = nav.keys.has("a") || nav.keys.has("arrowleft");
            const wantsRight = nav.keys.has("d") || nav.keys.has("arrowright");
            const vertical = (nav.keys.has("e") ? 1 : 0) - (nav.keys.has("q") ? 1 : 0);
            direction.set(-Math.sin(nav.yaw), 0, -Math.cos(nav.yaw));
            right.set(Math.cos(nav.yaw), 0, -Math.sin(nav.yaw));
            const boost = nav.keys.has("shift") ? 12.4 : 6.8;
            desired.set(0, vertical * 3.6, 0);
            desired.addScaledVector(direction, ((wantsForward ? 1 : 0) - (wantsBack ? 1 : 0)) * boost);
            desired.addScaledVector(right, ((wantsRight ? 1 : 0) - (wantsLeft ? 1 : 0)) * boost * 0.82);
            nav.velocity.lerp(desired, 1 - Math.exp(-delta * 6.4));
            if (!activeRef.current) nav.velocity.multiplyScalar(Math.exp(-delta * 8));
            camera.position.addScaledVector(nav.velocity, delta);
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
            camera.position.y = THREE.MathUtils.clamp(camera.position.y, WORLD_BOUNDS.yMin, WORLD_BOUNDS.yMax);
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, WORLD_BOUNDS.zMin, WORLD_BOUNDS.zMax);
            camera.rotation.set(nav.pitch + (reduced ? 0 : Math.sin(elapsed * 0.56) * 0.004), nav.yaw, 0);
          }

          const nextZone =
            biomeConfig.zones.find((zone) => camera.position.z > zone.minZ) ??
            biomeConfig.zones[biomeConfig.zones.length - 1];
          if (nextZone.name !== nav.zone) {
            nav.zone = nextZone.name;
            callbacksRef.current.onZoneChange?.(nextZone.name, nextZone.depth);
          }

          const width = host.clientWidth;
          const height = host.clientHeight;
          for (const hotspot of hotspotsRef.current) {
            const marker = markerRefs.current.get(hotspot.id);
            if (!marker) continue;
            spotVector.set(...hotspot.position);
            projected.copy(spotVector).project(camera);
            const distance = camera.position.distanceTo(spotVector);
            const visible = activeRef.current && projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.04 && distance < 76;
            marker.style.opacity = visible ? "1" : "0";
            marker.style.pointerEvents = visible ? "auto" : "none";
            marker.style.transform = `translate3d(${(projected.x * 0.5 + 0.5) * width}px,${(-projected.y * 0.5 + 0.5) * height}px,0) translate(-50%,-50%)`;
            marker.dataset.near = distance < 24 || focusRef.current === hotspot.id ? "true" : "false";
          }
          renderer.render(scene, camera);
        });

        release = () => {
          host.removeEventListener("pointerdown", pointerDown);
          host.removeEventListener("pointermove", pointerMove);
          host.removeEventListener("pointerup", pointerUp);
          host.removeEventListener("pointercancel", pointerUp);
          host.removeEventListener("keydown", keyDown);
          host.removeEventListener("keyup", keyUp);
          host.removeEventListener("wheel", wheel);
          resizeObserver?.disconnect();
          void renderer.setAnimationLoop(null);
          world.traverse((object) => {
            const disposable = object as Object3D & {
              geometry?: { dispose: () => void };
              material?: Material | Material[];
            };
            disposable.geometry?.dispose();
            if (disposable.material) disposeMaterial(disposable.material);
          });
          textures.forEach((texture) => texture.dispose());
          dracoLoader.dispose();
          renderer.dispose();
        };
      } catch (error) {
        console.warn("Reef engine fell back to the cinematic field guide.", error);
        if (alive) {
          setFallback(true);
          setLoaded(true);
          callbacksRef.current.onEngineChange?.("Field guide");
          callbacksRef.current.onReady?.();
        }
      }
    })();

    return () => {
      alive = false;
      release?.();
      resizeObserver?.disconnect();
    };
  }, [activatedOnce, biome]);

  const useFallbackMarkers = fallback && active;

  return (
    <div
      ref={hostRef}
      className={`reef-scene${active ? " is-active" : ""}${loaded ? " is-loaded" : ""}${fallback ? " is-fallback" : ""}${className ? ` ${className}` : ""}`}
      tabIndex={active ? 0 : -1}
      aria-label={active ? "Interactive underwater coral reef. Drag to look and use W A S D to swim." : "Coral reef at Small Sister's Island"}
    >
      <div className={`reef-scene__fallback${posterReady ? " is-ready" : ""}`} style={{ backgroundImage: `url(${fallbackSrc})` }} />
      <canvas ref={canvasRef} className="reef-scene__canvas" aria-hidden="true" />
      <div className="reef-scene__vignette" aria-hidden="true" />
      <span ref={cursorRef} className="reef-scene__cursor" aria-hidden="true" />
      {activatedOnce && !loaded && <span className="reef-scene__loading" aria-label="Loading three dimensional reef"><i /></span>}
      <div className="reef-scene__markers">
        {hotspots.map((hotspot) => {
          const mappedHotspot = mapped.has(hotspot.id);
          const position = useFallbackMarkers ? FALLBACK_POSITIONS[hotspot.id] : undefined;
          return (
            <button
              type="button"
              key={hotspot.id}
              ref={(element) => {
                if (element) markerRefs.current.set(hotspot.id, element);
                else markerRefs.current.delete(hotspot.id);
              }}
              className={`reef-scene__marker${mappedHotspot ? " is-mapped" : ""}`}
              style={position}
              onClick={() => callbacksRef.current.onHotspotSelect?.(hotspot.id)}
              aria-label={`${mappedHotspot ? "Mapped" : "Inspect"} ${hotspot.label}`}
            >
              <span className="reef-scene__reticle"><i>{mappedHotspot && <Check />}</i></span>
              <span className="reef-scene__marker-label">{hotspot.label}</span>
            </button>
          );
        })}
      </div>
      {active && !focusId && (
        <button
          type="button"
          className="reef-scene__swim"
          onPointerDown={() => hostRef.current?.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }))}
          onPointerUp={() => hostRef.current?.dispatchEvent(new KeyboardEvent("keyup", { key: "w" }))}
          onPointerCancel={() => hostRef.current?.dispatchEvent(new KeyboardEvent("keyup", { key: "w" }))}
          aria-label="Hold to swim forward"
        >
          <ArrowUp /><span>Hold to swim</span>
        </button>
      )}
    </div>
  );
}
