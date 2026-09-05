"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import type { BufferGeometry, Color, Material, Mesh, Object3D } from "three";

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
  | "acropora-cervicornis"
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
  guidedFocus?: boolean;
  hotspots?: ReefSceneHotspot[];
  mappedIds?: string[];
  fallbackSrc?: string;
  phase?: ReefPhase;
  stressor?: "heat" | "co2" | "plastic" | "runoff" | null;
  restoredIds?: string[];
  ambientDrift?: boolean;
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

const SCANS: Record<
  ScanAssetKey,
  {
    desktop: string;
    mobile: string;
    size: number;
    tint: number;
    preserveColor?: boolean;
    filterDarkBase?: boolean;
    sensitivity: number;
    recovery: number;
  }
> = {
  "acro-table": {
    desktop: "/models/acropora-hyacinthus.glb",
    mobile: "/models/acropora-hyacinthus-mobile.glb",
    size: 7.4,
    tint: 0xffb58f,
    sensitivity: 0.96,
    recovery: 0.7,
  },
  "acro-compact": {
    desktop: "/models/acropora-humilis.glb",
    mobile: "/models/acropora-humilis-mobile.glb",
    size: 6.2,
    tint: 0xe9867a,
    sensitivity: 0.9,
    recovery: 0.64,
  },
  "massive-star": {
    desktop: "/models/plesiastraea-armata.glb",
    mobile: "/models/plesiastraea-armata-mobile.glb",
    size: 6.8,
    tint: 0xe8c889,
    sensitivity: 0.42,
    recovery: 0.38,
  },
  "acropora-palmata": {
    desktop: "/models/smithsonian-acropora-palmata.glb",
    mobile: "/models/smithsonian-acropora-palmata.glb",
    size: 7.4,
    tint: 0xf0a271,
    preserveColor: true,
    filterDarkBase: true,
    sensitivity: 0.95,
    recovery: 0.46,
  },
  "acropora-cervicornis": {
    desktop: "/models/smithsonian-acropora-cervicornis.glb",
    mobile: "/models/smithsonian-acropora-cervicornis.glb",
    size: 7.1,
    tint: 0xe8a07b,
    preserveColor: true,
    filterDarkBase: true,
    sensitivity: 0.95,
    recovery: 0.48,
  },
  "diploria-brain": {
    desktop: "/models/smithsonian-diploria-labyrinthiformis.glb",
    mobile: "/models/smithsonian-diploria-labyrinthiformis.glb",
    size: 6.9,
    tint: 0xd7bf82,
    preserveColor: true,
    sensitivity: 0.35,
    recovery: 0.34,
  },
  "porites-mound": {
    desktop: "/models/smithsonian-porites-andrewsi.glb",
    mobile: "/models/smithsonian-porites-andrewsi.glb",
    size: 6.1,
    tint: 0xd9c278,
    preserveColor: true,
    sensitivity: 0.4,
    recovery: 0.4,
  },
  "goniopora-column": {
    desktop: "/models/smithsonian-goniopora-columna.glb",
    mobile: "/models/smithsonian-goniopora-columna.glb",
    size: 6.3,
    tint: 0xd29274,
    preserveColor: true,
    sensitivity: 0.62,
    recovery: 0.48,
  },
  "fungia-disc": {
    desktop: "/models/smithsonian-fungia-discus.glb",
    mobile: "/models/smithsonian-fungia-discus.glb",
    size: 5.5,
    tint: 0xe9aa72,
    preserveColor: true,
    sensitivity: 0.56,
    recovery: 0.54,
  },
  "pocillopora-cauliflower": {
    desktop: "/models/smithsonian-pocillopora-nobilis.glb",
    mobile: "/models/smithsonian-pocillopora-nobilis.glb",
    size: 5.9,
    tint: 0xe08978,
    preserveColor: true,
    sensitivity: 0.88,
    recovery: 0.6,
  },
  "seriatopora-birdsnest": {
    desktop: "/models/smithsonian-seriatopora-hystrix.glb",
    mobile: "/models/smithsonian-seriatopora-hystrix.glb",
    size: 5.8,
    tint: 0xeaa17d,
    preserveColor: true,
    sensitivity: 0.92,
    recovery: 0.58,
  },
  "heliopora-blue": {
    desktop: "/models/smithsonian-heliopora-coerulea.glb",
    mobile: "/models/smithsonian-heliopora-coerulea.glb",
    size: 5.8,
    tint: 0x89bac2,
    preserveColor: true,
    sensitivity: 0.5,
    recovery: 0.5,
  },
  "agaricia-plate": {
    desktop: "/models/smithsonian-agaricia-lamarcki.glb",
    mobile: "/models/smithsonian-agaricia-lamarcki.glb",
    size: 6.2,
    tint: 0xd7ad76,
    preserveColor: true,
    sensitivity: 0.68,
    recovery: 0.42,
  },
  "pavona-lettuce": {
    desktop: "/models/smithsonian-pavona-chiriquiensis.glb",
    mobile: "/models/smithsonian-pavona-chiriquiensis.glb",
    size: 6.4,
    tint: 0xd6ba78,
    preserveColor: true,
    sensitivity: 0.62,
    recovery: 0.5,
  },
};

const SCAN_MOUNT_PROFILES: Partial<
  Record<
    ScanAssetKey,
    {
      displayScale: number;
      settle?: number;
      markerRatio?: number;
      markerMin?: number;
      markerMax?: number;
    }
  >
> = {
  "acropora-palmata": { displayScale: 0.76, settle: 0.08, markerRatio: 0.82, markerMax: 3.7 },
  "acropora-cervicornis": { displayScale: 0.68, settle: 0.1, markerRatio: 0.86, markerMax: 3.4 },
  "heliopora-blue": { displayScale: 0.56, settle: 0.12, markerRatio: 0.92, markerMax: 3.2 },
  "agaricia-plate": { displayScale: 0.7, settle: 0.08, markerRatio: 0.8, markerMax: 2.8 },
  "pavona-lettuce": { displayScale: 0.68, settle: 0.08, markerRatio: 0.82, markerMax: 3 },
  "fungia-disc": { displayScale: 0.72, settle: 0.04, markerRatio: 0.72, markerMax: 2.4 },
};

const scanDisplaySize = (hotspot: ReefSceneHotspot) => {
  const scanKey = hotspot.scan ?? (hotspot.id in SCANS ? hotspot.id as ScanAssetKey : undefined);
  const scanSize = scanKey ? SCANS[scanKey].size : 6.5;
  const mountScale = scanKey ? SCAN_MOUNT_PROFILES[scanKey]?.displayScale ?? 1 : 1;
  return (hotspot.size ?? scanSize) * mountScale;
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
  { id: "nursery-scan-01", label: "Nursery scan", scan: "acropora-cervicornis", position: [-82, 2.25, -24], size: 4.9, tint: 0xf0a879, yaw: -0.55 },
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
  { id: "nursery-scan-14", label: "Nursery scan", scan: "acropora-cervicornis", position: [-10, 3.05, -164], size: 5.8, tint: 0xf0a06f, yaw: 1.02 },
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
  { id: "nursery-scan-25", label: "Nursery scan", scan: "acropora-cervicornis", position: [-132, 4.1, -314], size: 6, tint: 0xf1a675, yaw: -0.35 },
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
    label: `Colony ${prefix.slice(0, 1).toUpperCase()}${String(index + 1).padStart(2, "0")}`,
    scan,
    position: [x, 2.35 + (index % 7) * 0.16, z],
    size,
    tint,
    yaw: yaw ?? index * 0.37,
  }));

export const BIOME_AMBIENT_SCAN_COLONIES: Record<ReefBiomeId, ReefSceneHotspot[]> = {
  "great-barrier": makeAmbientScanColonies("gbr", [
    ["acro-table", -82, -24, 5.6, 0xefa777, -0.55],
    ["acro-compact", -48, -42, 4.8, 0xe18376, 0.72],
    ["porites-mound", 36, -27, 4.8, 0xdcc17c, -0.18],
    ["pocillopora-cauliflower", 72, -45, 4.6, 0xe18b77, 0.48],
    ["goniopora-column", -94, -66, 4.8, 0xd89270, -0.35],
    ["fungia-disc", -20, -64, 4.1, 0xe6a66f, 0.8],
    ["acro-table", 88, -82, 5.8, 0xec9f73, -0.92],
    ["heliopora-blue", 18, -94, 4.9, 0x89b8c0, 0.16],
    ["massive-star", -112, -108, 5.7, 0xddc58b, -1.1],
    ["seriatopora-birdsnest", -44, -116, 5.5, 0xe9a17c, 0.42],
    ["acro-compact", 48, -124, 4.9, 0xdb7c72, -0.2],
    ["porites-mound", 104, -144, 5.4, 0xd8bc78, 0.34],
    ["massive-star", -76, -152, 5.9, 0xddc58b, -0.68],
    ["acro-table", -10, -164, 5.8, 0xf0a06f, 1.02],
    ["goniopora-column", 62, -176, 5.4, 0xd39472, -0.48],
    ["porites-mound", 116, -194, 5.6, 0xd5bf79, 0.95],
    ["goniopora-column", -122, -202, 5.5, 0xd09070, 0.28],
    ["fungia-disc", -58, -218, 4.7, 0xe4a970, -0.72],
    ["pocillopora-cauliflower", 18, -230, 5.1, 0xe3907b, 0.52],
    ["seriatopora-birdsnest", 82, -244, 5.2, 0xe7a07a, -0.18],
    ["heliopora-blue", -96, -258, 5.1, 0x89bac2, 0.68],
    ["pavona-lettuce", -22, -274, 5.4, 0xd8bb78, -1.2],
    ["porites-mound", 54, -286, 5.7, 0xd6ba78, 0.2],
    ["acro-table", 126, -306, 6.1, 0xefa978, 0.95],
    ["acro-compact", -132, -314, 5.2, 0xe48778, -0.35],
    ["massive-star", -68, -330, 5.8, 0xd5bf87, 0.8],
    ["porites-mound", 8, -342, 5.9, 0xd9c278, -0.45],
    ["pocillopora-cauliflower", 96, -356, 5.7, 0xe18b77, 1.15],
    ["fungia-disc", -118, -18, 4.2, 0xe5aa72, -0.18],
    ["goniopora-column", -66, -18, 4.7, 0xd39472, 0.94],
    ["heliopora-blue", 88, -18, 4.8, 0x88bac2, -0.52],
    ["seriatopora-birdsnest", 116, -62, 5.1, 0xe8a07a, 0.42],
    ["massive-star", -118, -72, 5.2, 0xd8c48a, -0.74],
    ["seriatopora-birdsnest", 2, -42, 4.8, 0xe8a07a, 0.3],
    ["porites-mound", 104, -94, 5.1, 0xd7c086, 1.05],
    ["porites-mound", -34, -96, 5.2, 0xdac27a, -0.38],
  ]),
  "sisters-islands": makeAmbientScanColonies("sisters", [
    ["pavona-lettuce", -132, -26, 5.2, 0xd7bc78, 0.2],
    ["massive-star", -78, -42, 5.1, 0xd8c58a, -0.6],
    ["porites-mound", 18, -38, 4.8, 0xd5bd76, 0.3],
    ["goniopora-column", 74, -58, 4.7, 0xd09572, 0.9],
    ["fungia-disc", 128, -82, 4.2, 0xe3a772, -0.2],
    ["massive-star", -118, -118, 5.3, 0xdcc58a, -0.8],
    ["pavona-lettuce", -42, -128, 5.8, 0xd2bd7b, 0.7],
    ["heliopora-blue", 38, -146, 5.1, 0x8ababd, -1.1],
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
    ["porites-mound", 8, -184, 5.7, 0xd6bf78, 0.1],
    ["acro-compact", 82, -212, 5.5, 0xe28376, 1],
    ["porites-mound", 152, -242, 5.8, 0xd7c17d, -0.5],
    ["acro-table", -162, -278, 5.8, 0xefa372, 0.35],
    ["massive-star", -92, -306, 5.4, 0xd7c082, -0.85],
    ["seriatopora-birdsnest", -18, -334, 5.6, 0xeaa17d, 0.52],
    ["heliopora-blue", 58, -366, 5.7, 0x89bac2, -0.12],
    ["pavona-lettuce", 136, -392, 6.1, 0xd6ba78, 0.82],
    ["acro-table", -126, -424, 6.2, 0xefa978, -0.4],
    ["pocillopora-cauliflower", -42, -456, 5.8, 0xe18b77, 0.64],
    ["goniopora-column", 42, -488, 5.9, 0xd29274, -0.32],
    ["fungia-disc", 124, -514, 5.2, 0xe7a970, 0.2],
  ]),
  "caribbean-reef": makeAmbientScanColonies("caribbean", [
    ["acropora-cervicornis", -142, -28, 6.2, 0xf0a271, -0.5],
    ["diploria-brain", -68, -46, 5.6, 0xd7bf82, 0.4],
    ["agaricia-plate", 12, -64, 5.1, 0xd7ad76, -0.3],
    ["porites-mound", 92, -92, 5.3, 0xd9c278, 0.8],
    ["acro-compact", 154, -122, 5.4, 0xe9a47d, -0.2],
    ["diploria-brain", -126, -156, 5.9, 0xd5bd82, -0.75],
    ["massive-star", -48, -186, 5.8, 0xe1c58c, 0.28],
    ["agaricia-plate", 44, -214, 5.4, 0xd2a974, -0.95],
    ["acropora-cervicornis", 128, -242, 5.9, 0xeda06f, 0.58],
    ["porites-mound", -158, -278, 5.5, 0xd7c079, -0.18],
    ["diploria-brain", -82, -316, 5.8, 0xd6bf83, 0.74],
    ["agaricia-plate", 8, -352, 5.6, 0xd5ad75, -0.52],
    ["acro-compact", 88, -384, 5.6, 0xe6a17b, 0.22],
    ["acropora-cervicornis", 156, -418, 6.1, 0xeea271, -0.4],
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
  rockColor: number;
  rubbleHue: number;
  spongeHue: number;
  spongeSaturation: number;
  spongeLightness: number;
  benthicOpacity: number;
  reefLifeSize: number;
  fishCruiseHeight: [number, number];
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
const MIN_DIVE_DEPTH_METERS = 10;
const DEPTH_METERS_PER_WORLD_UNIT = 0.65;
const FREE_SWIM_SPEED = 9.6;
const FREE_SWIM_SHIFT_SPEED = 17.2;
const VERTICAL_SWIM_SPEED = 5.4;

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

const BIOME_SPAWNS: Record<
  ReefBiomeId,
  {
    x: number;
    z: number;
    height: number;
    lookAt: [number, number, number];
  }
> = {
  "great-barrier": { x: -6, z: -122, height: 6.4, lookAt: [34, 3.2, -184] },
  "sisters-islands": { x: -4, z: -128, height: 6, lookAt: [42, 3.1, -198] },
  "coral-triangle": { x: -8, z: -174, height: 6.6, lookAt: [52, 3.3, -246] },
  "caribbean-reef": { x: 4, z: -142, height: 6.2, lookAt: [42, 3.2, -226] },
};

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
    rockDensity: 1.18,
    spongeDensity: 1.18,
    grassDensity: 1.28,
    kelpDensity: 0.94,
    coralHeadDensity: 1.05,
    seaFanDensity: 1.18,
    softPolypDensity: 1.34,
    fishDensity: 1.05,
    bottomLifeDensity: 1.18,
    particleDensity: 0.9,
    lifeDensity: 0.98,
    grassColor: 0x2aa67d,
    rockColor: 0x6f7768,
    rubbleHue: 0.12,
    spongeHue: 0.075,
    spongeSaturation: 0.36,
    spongeLightness: 0.46,
    benthicOpacity: 0.72,
    reefLifeSize: 0.09,
    fishCruiseHeight: [3.8, 8.6],
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
    background: 0x123b38,
    fog: 0x5f7966,
    fogDensity: 0.0205,
    floorColor: 0x898669,
    wallColor: 0x31493f,
    waterColor: 0x5a826c,
    causticColor: 0xcfe4bf,
    causticOpacity: 0.075,
    waterAlpha: 0.54,
    waterDistortion: 2.25,
    waterY: 11.6,
    textureRepeat: [54, 88],
    exposure: 0.98,
    rockDensity: 0.9,
    spongeDensity: 1.72,
    grassDensity: 2.08,
    kelpDensity: 0.52,
    coralHeadDensity: 0.82,
    seaFanDensity: 0.82,
    softPolypDensity: 1.58,
    fishDensity: 0.78,
    bottomLifeDensity: 1.42,
    particleDensity: 1.5,
    lifeDensity: 0.84,
    grassColor: 0x5b9464,
    rockColor: 0x5e6857,
    rubbleHue: 0.2,
    spongeHue: 0.13,
    spongeSaturation: 0.42,
    spongeLightness: 0.42,
    benthicOpacity: 0.62,
    reefLifeSize: 0.072,
    fishCruiseHeight: [2.5, 5.8],
    kelpHue: 0.25,
    seaFanHue: 0.28,
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
      { minZ: -85, name: "Bendera Bay reef flat", depth: "10 m" },
      { minZ: -205, name: "Turbid coral slope", depth: "12 m" },
      { minZ: -350, name: "Seagrass and sponge mosaic", depth: "16 m" },
      { minZ: -999, name: "Nursery research zone", depth: "19 m" },
    ],
  },
  "coral-triangle": {
    seed: 91244,
    terrain: "triangle-wall",
    floorTexture: "coral-wall",
    background: 0x035a70,
    fog: 0x1494a6,
    fogDensity: 0.0078,
    floorColor: 0x978667,
    wallColor: 0x175f6d,
    waterColor: 0x0695ab,
    causticColor: 0xc8fff0,
    causticOpacity: 0.2,
    waterAlpha: 0.68,
    waterDistortion: 4.9,
    waterY: 14.2,
    textureRepeat: [48, 78],
    exposure: 1.12,
    rockDensity: 1.42,
    spongeDensity: 1.32,
    grassDensity: 1.42,
    kelpDensity: 1.04,
    coralHeadDensity: 1.38,
    seaFanDensity: 1.58,
    softPolypDensity: 1.78,
    fishDensity: 1.55,
    bottomLifeDensity: 1.28,
    particleDensity: 1.05,
    lifeDensity: 1.42,
    grassColor: 0x24b889,
    rockColor: 0x4e625c,
    rubbleHue: 0.085,
    spongeHue: 0.04,
    spongeSaturation: 0.52,
    spongeLightness: 0.5,
    benthicOpacity: 0.76,
    reefLifeSize: 0.105,
    fishCruiseHeight: [4.1, 9.8],
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
    background: 0x073f5d,
    fog: 0x1f7fa2,
    fogDensity: 0.0102,
    floorColor: 0xbead83,
    wallColor: 0x1a586f,
    waterColor: 0x0783a8,
    causticColor: 0xdffff4,
    causticOpacity: 0.185,
    waterAlpha: 0.66,
    waterDistortion: 4.35,
    waterY: 13.1,
    textureRepeat: [42, 68],
    exposure: 1.05,
    rockDensity: 1.34,
    spongeDensity: 1.62,
    grassDensity: 0.98,
    kelpDensity: 0.62,
    coralHeadDensity: 0.72,
    seaFanDensity: 1.95,
    softPolypDensity: 1.42,
    fishDensity: 1.28,
    bottomLifeDensity: 0.96,
    particleDensity: 0.78,
    lifeDensity: 1.08,
    grassColor: 0x2e866d,
    rockColor: 0x777062,
    rubbleHue: 0.115,
    spongeHue: 0.055,
    spongeSaturation: 0.54,
    spongeLightness: 0.48,
    benthicOpacity: 0.68,
    reefLifeSize: 0.082,
    kelpHue: 0.28,
    fishCruiseHeight: [3.2, 7.1],
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
      { minZ: -90, name: "Elkhorn reef crest", depth: "10 m" },
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

function filterDarkDisplayBase(material: Material) {
  const filtered = material as Material & {
    alphaTest?: number;
    transparent?: boolean;
    onBeforeCompile?: (shader: { fragmentShader: string }) => void;
    customProgramCacheKey?: () => string;
  };

  filtered.alphaTest = Math.max(filtered.alphaTest ?? 0, 0.04);
  filtered.transparent = true;
  filtered.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      [
        "float displayBaseLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));",
        "if (displayBaseLuma < 0.045 && diffuseColor.a > 0.72) discard;",
        "#include <dithering_fragment>",
      ].join("\n"),
    );
  };
  filtered.customProgramCacheKey = () => "reef-dark-display-base-filter-v1";
  filtered.needsUpdate = true;
}

export default function ReefScene({
  active = false,
  biome = "great-barrier",
  focusId = null,
  guidedFocus = false,
  hotspots = DEFAULT_HOTSPOTS,
  mappedIds = [],
  fallbackSrc = "/reef-default-background.png",
  phase = "healthy",
  stressor = null,
  restoredIds = [],
  ambientDrift = false,
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
  const guidedFocusRef = useRef(guidedFocus);
  const phaseRef = useRef(phase);
  const stressorRef = useRef(stressor);
  const restoredRef = useRef(restoredIds);
  const ambientDriftRef = useRef(ambientDrift);
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
    guidedFocusRef.current = guidedFocus;
  }, [guidedFocus]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => { stressorRef.current = stressor; }, [stressor]);
  useEffect(() => { restoredRef.current = restoredIds; }, [restoredIds]);
  useEffect(() => { ambientDriftRef.current = ambientDrift; }, [ambientDrift]);

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
        const spawn = BIOME_SPAWNS[biome];
        const random = seededRandom(biomeConfig.seed);
        const countFor = (desktop: number, mobile: number, multiplier = 1) =>
          Math.max(1, Math.round((lowPower ? mobile : desktop) * multiplier));
        const seabedHeight = (x: number, z: number) => {
          const basin = biomeConfig.clusters.reduce((height, [cx, , cz, radius]) => {
            const dx = x - cx;
            const dz = z - cz;
            const falloff = Math.max(0, 1 - Math.hypot(dx, dz) / (radius * 2.15));
            return height + falloff * falloff * 1.65;
          }, 0);
          const microRelief =
            Math.sin(x * 0.115 + z * 0.071) * 0.16 +
            Math.cos(x * 0.084 - z * 0.096) * 0.13;
          const softRidges =
            Math.sin(x * 0.055 + z * 0.018) * 0.86 +
            Math.cos(z * 0.043) * 0.64 +
            Math.sin((x - z) * 0.032) * 0.48 +
            microRelief;
          const sideRise = Math.max(0, (Math.abs(x) - 136) / 92) ** 2 * 5.6;
          const farRise = Math.max(0, (-z - 360) / 170) * 5.2;
          const frontShelf = Math.max(0, (z - 42) / 130) * 2.4;

          if (biomeConfig.terrain === "turbid-lagoon") {
            const lagoonChannel = Math.max(0, 1 - Math.abs(x * 0.42 + z * 0.05) / 38) * -1.65;
            const siltBanks = Math.sin(x * 0.026 + z * 0.014) * 0.46 + Math.cos(z * 0.023) * 0.38;
            const shoals = Math.max(0, Math.sin((x - z * 0.18) * 0.028)) * 0.82;
            return siltBanks + shoals + basin * 0.7 + lagoonChannel + sideRise * 0.42 + farRise * 0.54 + frontShelf * 0.7 - 0.72;
          }

          if (biomeConfig.terrain === "triangle-wall") {
            const wallDrop = -Math.max(0, (-z - 210) / 210) * 3.35;
            const volcanicRibs =
              Math.max(0, Math.sin((x + 18) * 0.052)) * 1.85 +
              Math.max(0, Math.cos((z + x * 0.36) * 0.035)) * 1.2;
            return softRidges * 1.25 + volcanicRibs + basin * 0.92 + sideRise * 0.72 + farRise * 0.36 + frontShelf - 0.82 + wallDrop;
          }

          if (biomeConfig.terrain === "caribbean-spur") {
            const groove = Math.sin((x + z * 0.16) * 0.055);
            const spurs = Math.max(0, groove) * 2.05 - Math.max(0, -groove) * 1.25;
            const terrace = Math.sin(z * 0.018) * 0.56;
            const limestoneSteps = Math.max(0, Math.sin((z + 40) * 0.043)) * 0.74;
            return softRidges * 0.78 + spurs + terrace + limestoneSteps + basin * 0.72 + sideRise * 0.62 + farRise * 0.48 + frontShelf - 0.86;
          }

          const swimChannel = Math.max(0, 1 - Math.abs(x + z * 0.1) / 34) * -1.35;
          const reefFlatShelves = Math.max(0, Math.sin((x * 0.045 - z * 0.022) + 0.9)) * 0.74;
          return softRidges + reefFlatShelves + basin * 0.82 + swimChannel + sideRise + farRise + frontShelf - 0.9;
        };
        const makeFloorTexture = () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 2048;
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

          const background = context.createLinearGradient(0, 0, 2048, 2048);
          background.addColorStop(0, palette.base[0]);
          background.addColorStop(0.54, palette.base[1]);
          background.addColorStop(1, palette.base[2]);
          context.fillStyle = background;
          context.fillRect(0, 0, 2048, 2048);

          context.globalCompositeOperation = "overlay";
          const broadWash = context.createRadialGradient(720, 640, 120, 1180, 1120, 1740);
          broadWash.addColorStop(0, "rgba(255, 255, 255, 0.18)");
          broadWash.addColorStop(0.42, "rgba(97, 132, 108, 0.12)");
          broadWash.addColorStop(1, "rgba(15, 44, 45, 0.2)");
          context.fillStyle = broadWash;
          context.fillRect(0, 0, 2048, 2048);

          context.globalCompositeOperation = "multiply";
          const landformCount = lowPower ? 34 : 58;
          for (let index = 0; index < landformCount; index += 1) {
            const x = random() * 2048;
            const y = random() * 2048;
            const length = 220 + random() * 620;
            const width = 26 + random() * 96;
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
          const fleckCount = lowPower ? 760 : 1500;
          for (let index = 0; index < fleckCount; index += 1) {
            const radius = 0.8 + random() * (biomeConfig.floorTexture === "coral-wall" ? 4.8 : 3.4);
            context.fillStyle = palette.fleck[Math.floor(random() * palette.fleck.length)];
            context.globalAlpha = 0.05 + random() * 0.2;
            context.beginPath();
            context.ellipse(random() * 2048, random() * 2048, radius * (0.8 + random() * 1.8), radius, random() * Math.PI, 0, Math.PI * 2);
            context.fill();
          }
          context.globalAlpha = 1;
          context.globalCompositeOperation = "overlay";
          if (biomeConfig.floorTexture === "silt-lagoon") {
            for (let index = 0; index < 28; index += 1) {
              context.fillStyle = `rgba(91, 151, 88, ${0.045 + random() * 0.075})`;
              context.beginPath();
              context.ellipse(random() * 2048, random() * 2048, 70 + random() * 260, 18 + random() * 70, random() * Math.PI, 0, Math.PI * 2);
              context.fill();
            }
          } else if (biomeConfig.floorTexture === "spur-groove") {
            for (let index = 0; index < 8; index += 1) {
              const y = 160 + index * 244 + (random() - 0.5) * 120;
              const gradient = context.createLinearGradient(0, y - 92, 2048, y + 92);
              gradient.addColorStop(0, "rgba(255, 245, 196, 0)");
              gradient.addColorStop(0.5, "rgba(255, 245, 196, 0.11)");
              gradient.addColorStop(1, "rgba(255, 245, 196, 0)");
              context.fillStyle = gradient;
              context.fillRect(0, y - 92, 2048, 184);
            }
          } else if (biomeConfig.floorTexture === "coral-wall") {
            for (let index = 0; index < 22; index += 1) {
              context.fillStyle = `rgba(90, 209, 188, ${0.035 + random() * 0.06})`;
              context.beginPath();
              context.ellipse(random() * 2048, random() * 2048, 80 + random() * 260, 10 + random() * 34, random() * Math.PI, 0, Math.PI * 2);
              context.fill();
            }
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.repeat.set(1, 1);
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
        const spawnLookAt = new THREE.Vector3(
          spawn.lookAt[0],
          seabedHeight(spawn.lookAt[0], spawn.lookAt[2]) + spawn.lookAt[1],
          spawn.lookAt[2],
        );
        camera.position.set(
          spawn.x,
          seabedHeight(spawn.x, spawn.z) + spawn.height,
          spawn.z,
        );
        camera.lookAt(spawnLookAt);
        const spawnDirection = new THREE.Vector3();
        camera.getWorldDirection(spawnDirection);

        const world = new THREE.Group();
        scene.add(world);
        const livingMaterials: Array<{
          material: Material & { color?: Color; emissive?: Color };
          base: Color;
          hotspotId: string;
          scanKey: ScanAssetKey;
          transitionLag: number;
        }> = [];
        const coralTargets: Object3D[] = [];
        const animatedCorals: Object3D[] = [];
        const fishActors: Array<{ object: Object3D; offset: number; lane: number; depth: number; radius: number; height: number; speed: number; wobble: number }> = [];
        const bottomActors: Array<{ object: Object3D; baseScale: number }> = [];
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
        const [gravel, gravelNormal, gravelArm] = await Promise.all([
          textureLoader.loadAsync("/textures/coral-gravel-diffuse.jpg"),
          textureLoader.loadAsync("/textures/coral-gravel-normal.jpg"),
          textureLoader.loadAsync("/textures/coral-gravel-arm.jpg"),
        ]);
        gravel.colorSpace = THREE.SRGBColorSpace;
        gravel.wrapS = gravel.wrapT = THREE.RepeatWrapping;
        gravel.repeat.set(36, 58);
        gravel.anisotropy = lowPower ? 2 : 8;
        textures.push(gravel);
        const floorTexture = biomeConfig.floorTexture === "shelf-rubble" ? gravel : makeFloorTexture();
        if (floorTexture && floorTexture !== gravel) textures.push(floorTexture);
        const detailRepeat: [number, number] = biomeConfig.floorTexture === "shelf-rubble" ? [36, 58] : [18, 28];
        for (const texture of [gravelNormal, gravelArm]) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(...detailRepeat);
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
        waterNormals.center.set(0.5, 0.5);
        waterNormals.rotation = Math.PI;
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
        water.rotation.set(-Math.PI / 2, Math.PI, 0);
        water.position.set(0, biomeConfig.waterY, FLOOR_CENTER_Z + 18);
        water.material.side = THREE.DoubleSide;
        world.add(water);

        const reflectionCanvas = document.createElement("canvas");
        reflectionCanvas.width = reflectionCanvas.height = 1024;
        const reflectionContext = reflectionCanvas.getContext("2d");
        if (reflectionContext) {
          reflectionContext.clearRect(0, 0, 1024, 1024);
          reflectionContext.globalCompositeOperation = "screen";
          for (let index = 0; index < 84; index += 1) {
            const y = random() * 1024;
            const startX = -120 + random() * 240;
            const length = 340 + random() * 560;
            const lift = (random() - 0.5) * 84;
            const gradient = reflectionContext.createLinearGradient(startX, y, startX + length, y + lift);
            gradient.addColorStop(0, "rgba(255,255,255,0)");
            gradient.addColorStop(0.28, `rgba(225,255,247,${0.05 + random() * 0.12})`);
            gradient.addColorStop(0.52, `rgba(118,247,232,${0.04 + random() * 0.1})`);
            gradient.addColorStop(0.78, `rgba(245,255,252,${0.035 + random() * 0.08})`);
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            reflectionContext.strokeStyle = gradient;
            reflectionContext.lineWidth = 5 + random() * 18;
            reflectionContext.lineCap = "round";
            reflectionContext.beginPath();
            reflectionContext.moveTo(startX, y);
            reflectionContext.bezierCurveTo(
              startX + length * 0.24,
              y - 36 + random() * 72,
              startX + length * 0.48,
              y + 44 - random() * 88,
              startX + length * 0.72,
              y + lift * 0.7,
            );
            reflectionContext.bezierCurveTo(
              startX + length * 0.84,
              y + lift + 22 - random() * 44,
              startX + length * 0.94,
              y + lift - 18 + random() * 36,
              startX + length,
              y + lift,
            );
            reflectionContext.stroke();
          }
          for (let index = 0; index < 46; index += 1) {
            const x = random() * 1024;
            const y = random() * 1024;
            const radius = 16 + random() * 76;
            const gradient = reflectionContext.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, "rgba(255,255,255,0.18)");
            gradient.addColorStop(0.34, "rgba(157,255,235,0.09)");
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            reflectionContext.fillStyle = gradient;
            reflectionContext.beginPath();
            reflectionContext.ellipse(x, y, radius * 1.8, radius * 0.44, random() * Math.PI, 0, Math.PI * 2);
            reflectionContext.fill();
          }
        }
        const surfaceReflectionTexture = new THREE.CanvasTexture(reflectionCanvas);
        surfaceReflectionTexture.wrapS = surfaceReflectionTexture.wrapT = THREE.RepeatWrapping;
        surfaceReflectionTexture.repeat.set(3.2, 5.2);
        surfaceReflectionTexture.center.set(0.5, 0.5);
        surfaceReflectionTexture.rotation = Math.PI;
        surfaceReflectionTexture.anisotropy = lowPower ? 2 : 8;
        textures.push(surfaceReflectionTexture);
        const surfaceReflectionMaterial = new THREE.MeshBasicMaterial({
          map: surfaceReflectionTexture,
          color: 0xe8fffb,
          transparent: true,
          opacity: lowPower ? 0.12 : 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const surfaceReflections = new THREE.Mesh(
          new THREE.PlaneGeometry(FLOOR_WIDTH * 1.34, FLOOR_DEPTH * 1.08),
          surfaceReflectionMaterial,
        );
        surfaceReflections.rotation.set(-Math.PI / 2, Math.PI, 0);
        surfaceReflections.position.set(0, biomeConfig.waterY - 0.08, FLOOR_CENTER_Z + 20);
        surfaceReflections.renderOrder = 2;
        world.add(surfaceReflections);

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
        const bendGroundedGeometry = (geometry: BufferGeometry, bend = 0.18, taper = 0.15) => {
          const attribute = geometry.attributes.position;
          let minY = Infinity;
          let maxY = -Infinity;
          for (let index = 0; index < attribute.count; index += 1) {
            minY = Math.min(minY, attribute.getY(index));
            maxY = Math.max(maxY, attribute.getY(index));
          }
          const height = Math.max(0.001, maxY - minY);
          for (let index = 0; index < attribute.count; index += 1) {
            const x = attribute.getX(index);
            const y = attribute.getY(index);
            const z = attribute.getZ(index);
            const t = (y - minY) / height;
            const radiusTaper = 1 - t * taper;
            attribute.setXYZ(
              index,
              x * radiusTaper + Math.sin(t * Math.PI) * bend,
              y,
              z * radiusTaper + Math.cos(t * Math.PI * 0.7) * bend * 0.18,
            );
          }
          geometry.computeVertexNormals();
          return geometry;
        };
        const makeSeagrassShootGeometry = () =>
          bendGroundedGeometry(new THREE.CylinderGeometry(0.035, 0.095, 1, 7, 6), 0.12, 0.36);
        const makeKelpStipeGeometry = () =>
          bendGroundedGeometry(new THREE.CylinderGeometry(0.08, 0.2, 1, 9, 8), 0.24, 0.28);
        const makeBranchingPolypGeometry = () =>
          bendGroundedGeometry(new THREE.ConeGeometry(0.13, 1, 9, 5), 0.16, 0.55);
        const makeSeaFanStemGeometry = () =>
          bendGroundedGeometry(new THREE.CylinderGeometry(0.055, 0.18, 1, 10, 7), 0.28, 0.45);
        const makeRubbleGeometry = () => {
          const rubbleGeometry = new THREE.SphereGeometry(1, 18, 10);
          const rubblePosition = rubbleGeometry.attributes.position;
          for (let index = 0; index < rubblePosition.count; index += 1) {
            const x = rubblePosition.getX(index);
            const y = rubblePosition.getY(index);
            const z = rubblePosition.getZ(index);
            const warp =
              0.86 +
              Math.sin(index * 1.37 + x * 2.4) * 0.08 +
              Math.cos(z * 2.8 + y * 1.9) * 0.07;
            const baseFlatten = y < -0.55 ? 0.78 : 1;
            rubblePosition.setXYZ(
              index,
              x * warp * (0.92 + Math.sin(z * 3.1) * 0.05),
              y * (0.18 + warp * 0.14) * baseFlatten,
              z * warp * (0.74 + Math.cos(x * 2.2) * 0.06),
            );
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
          makeRubbleGeometry(),
          new THREE.MeshStandardMaterial({ color: biomeConfig.rockColor, roughness: 0.96, metalness: 0.01 }),
          countFor(230, 92, biomeConfig.rockDensity * 0.72),
        );
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const position = new THREE.Vector3();
        const scale = new THREE.Vector3();
        for (let index = 0; index < rocks.count; index += 1) {
          const shelf = index % 7 === 0;
          const x = shelf
            ? (random() < 0.5 ? -1 : 1) * (FLOOR_WIDTH * 0.27 + random() * FLOOR_WIDTH * 0.2)
            : (random() - 0.5) * FLOOR_WIDTH * 0.88;
          const z = FLOOR_CENTER_Z + FLOOR_DEPTH * 0.44 - random() * FLOOR_DEPTH * 0.86;
          const size = shelf ? 0.85 + random() * 2.15 : 0.28 + random() * 1.05;
          position.set(x, seabedHeight(x, z) + size * 0.12, z);
          quaternion.setFromEuler(new THREE.Euler(random(), random() * Math.PI, random()));
          scale.set(size * (0.9 + random() * 0.38), size * (0.48 + random() * 0.18), size * (0.82 + random() * 0.36));
          matrix.compose(position, quaternion, scale);
          rocks.setMatrixAt(index, matrix);
        }
        rocks.instanceMatrix.needsUpdate = true;
        world.add(rocks);

        const reefColor = new THREE.Color();
        const sponges = new THREE.InstancedMesh(
          makeTubeSpongeGeometry(),
          new THREE.MeshStandardMaterial({ color: 0xa97958, roughness: 0.92 }),
          countFor(275, 122, biomeConfig.spongeDensity),
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
          reefColor.setHSL(
            biomeConfig.spongeHue + random() * 0.055,
            biomeConfig.spongeSaturation + random() * 0.14,
            biomeConfig.spongeLightness + random() * 0.12,
          );
          sponges.setColorAt(index, reefColor);
        }
        sponges.instanceMatrix.needsUpdate = true;
        if (sponges.instanceColor) sponges.instanceColor.needsUpdate = true;
        world.add(sponges);

        const grass = new THREE.InstancedMesh(
          makeSeagrassShootGeometry(),
          new THREE.MeshStandardMaterial({ color: biomeConfig.grassColor, roughness: 0.88, transparent: true, opacity: biomeConfig.benthicOpacity }),
          countFor(980, 380, biomeConfig.grassDensity * 0.78),
        );
        for (let index = 0; index < grass.count; index += 1) {
          const meadow = index % 4 === 0;
          const [fieldX, fieldZ] = randomFloorPoint(meadow ? 0.82 : 0.95, meadow ? 0.78 : 0.92);
          const x = fieldX + (meadow ? Math.sin(index * 0.83) * 18 : 0);
          const z = fieldZ;
          const height = 0.65 + random() * 1.85;
          position.set(x, seabedHeight(x, z) + height * 0.5 + 0.02, z);
          quaternion.setFromEuler(new THREE.Euler(0, random() * Math.PI, (random() - 0.5) * 0.2));
          scale.set(0.75 + random() * 0.42, height, 0.75 + random() * 0.42);
          matrix.compose(position, quaternion, scale);
          grass.setMatrixAt(index, matrix);
        }
        grass.instanceMatrix.needsUpdate = true;
        world.add(grass);

        const kelp = new THREE.InstancedMesh(
          makeKelpStipeGeometry(),
          new THREE.MeshStandardMaterial({ color: 0x5e9f6d, roughness: 0.86, transparent: true, opacity: 0.56 }),
          countFor(270, 110, biomeConfig.kelpDensity * 0.72),
        );
        for (let index = 0; index < kelp.count; index += 1) {
          const cluster = clusters[(index + 4) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 6 + random() * (cluster[3] + 18);
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius * 0.86;
          const height = 0.55 + random() * 1.3;
          position.set(x, seabedHeight(x, z) + height * 0.5 + 0.03, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.24, random() * Math.PI, (random() - 0.5) * 0.32));
          scale.set(0.66 + random() * 0.92, height * 4.9, 0.66 + random() * 0.92);
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
          new THREE.MeshStandardMaterial({ color: biomeConfig.rockColor, roughness: 0.96, metalness: 0.01 }),
          countFor(980, 420, biomeConfig.rockDensity + biomeConfig.coralHeadDensity * 0.62),
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
          reefColor.setHSL(biomeConfig.rubbleHue + random() * 0.105, 0.12 + random() * 0.2, 0.3 + random() * 0.22);
          reefRubble.setColorAt(index, reefColor);
        }
        reefRubble.instanceMatrix.needsUpdate = true;
        if (reefRubble.instanceColor) reefRubble.instanceColor.needsUpdate = true;
        world.add(reefRubble);

        const seaFans = new THREE.InstancedMesh(
          makeSeaFanStemGeometry(),
          new THREE.MeshStandardMaterial({ color: 0x35c8a2, roughness: 0.86, transparent: true, opacity: 0.72 }),
          countFor(215, 86, biomeConfig.seaFanDensity * 0.72),
        );
        for (let index = 0; index < seaFans.count; index += 1) {
          const [x, z] = randomFloorPoint(0.82, 0.86);
          const height = 0.9 + random() * 2.4;
          position.set(x, seabedHeight(x, z) + height * 0.5 + 0.03, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.28));
          scale.set(0.82 + random() * 0.72, height * 1.85, 0.82 + random() * 0.72);
          matrix.compose(position, quaternion, scale);
          seaFans.setMatrixAt(index, matrix);
          reefColor.setHSL(biomeConfig.seaFanHue + random() * 0.1, 0.5 + random() * 0.2, 0.42 + random() * 0.16);
          seaFans.setColorAt(index, reefColor);
        }
        seaFans.instanceMatrix.needsUpdate = true;
        if (seaFans.instanceColor) seaFans.instanceColor.needsUpdate = true;
        world.add(seaFans);

        const softPolyps = new THREE.InstancedMesh(
          makeBranchingPolypGeometry(),
          new THREE.MeshStandardMaterial({ color: 0x9b7194, roughness: 0.9, transparent: true, opacity: 0.66 }),
          countFor(720, 290, biomeConfig.softPolypDensity * 0.82),
        );
        for (let index = 0; index < softPolyps.count; index += 1) {
          const cluster = clusters[(index + 7) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = random() * cluster[3] * 0.9;
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius;
          const height = 0.5 + random() * 1.25;
          position.set(x, seabedHeight(x, z) + height * 0.5 + 0.03, z);
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

        const interactiveHotspotIds = new Set(
          hotspotsRef.current.map((hotspot) => hotspot.id),
        );
        const ambientScanColonies = (
          BIOME_AMBIENT_SCAN_COLONIES[biome] ?? AMBIENT_SCAN_COLONIES
        ).filter((hotspot) => !interactiveHotspotIds.has(hotspot.id));
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
          size: lowPower ? biomeConfig.reefLifeSize * 0.78 : biomeConfig.reefLifeSize,
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
        const hotspotMarkerLifts = new Map<string, number>();

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
          const mount = SCAN_MOUNT_PROFILES[scanKey];
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
            const lowFlatDisplayBase =
              meshSize.y < 0.18 &&
              meshSize.x > meshSize.y * 4.5 &&
              meshSize.z > meshSize.y * 4.5 &&
              meshCenter.y < -0.16;
            if (darkDisplayMaterial && lowFlatDisplayBase) {
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
              if (asset.filterDarkBase) filterDarkDisplayBase(material);
              livingMaterials.push({ material: living, base: living.color.clone(), hotspotId: hotspot.id, scanKey, transitionLag: 0.62 + random() * 0.72 });
            }
          });
          if (mount?.displayScale) {
            model.scale.multiplyScalar(mount.displayScale);
          }
          model.updateMatrixWorld(true);
          const groundedBounds = new THREE.Box3().setFromObject(model);
          const visibleBottom = Number.isFinite(groundedBounds.min.y) ? groundedBounds.min.y : -0.5;
          model.position.y -= visibleBottom;
          model.position.y -= mount?.settle ?? 0;
          model.updateMatrixWorld(true);
          const mountedBounds = new THREE.Box3().setFromObject(model);
          const mountedSize = mountedBounds.getSize(new THREE.Vector3());
          const pedestal = new THREE.Group();
          pedestal.name = hotspot.id;
          pedestal.userData.hotspotId = hotspot.id;
          pedestal.userData.scanKey = scanKey;
          pedestal.userData.baseScale = hotspot.size ?? asset.size;
          pedestal.userData.animOffset = random() * Math.PI * 2;
          const baseScale = pedestal.userData.baseScale as number;
          const markerLift = THREE.MathUtils.clamp(
            mountedSize.y * baseScale * (mount?.markerRatio ?? 0.74) + 0.42,
            mount?.markerMin ?? 1.15,
            mount?.markerMax ?? 4.1,
          );
          hotspotMarkerLifts.set(hotspot.id, markerLift);
          pedestal.position.set(
            hotspot.position[0],
            seabedHeight(hotspot.position[0], hotspot.position[2]) + 0.02,
            hotspot.position[2],
          );
          pedestal.rotation.y = hotspot.yaw ?? (scanKey === "massive-star" ? -0.7 : 0.35);
          pedestal.scale.setScalar(baseScale);
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

        type FloorScanAsset = {
          src: string;
          count: number;
          fit: number;
          tint: number;
          clusterOffset: number;
          scaleMin: number;
          scaleMax: number;
          lift?: number;
          floorActor?: boolean;
          tintMix?: number;
        };
        const floorScannedHabitatsByBiome: Record<ReefBiomeId, FloorScanAsset[]> = {
          "great-barrier": [
            { src: "/models/polyhaven/rock_07/rock_07_1k.gltf", count: countFor(26, 11, biomeConfig.rockDensity), fit: 3.15, tint: 0x7c8273, clusterOffset: 0, scaleMin: 0.62, scaleMax: 1.28, lift: 0.01, tintMix: 0.12 },
            { src: "/models/polyhaven/stone_01/stone_01_1k.gltf", count: countFor(32, 14, biomeConfig.rockDensity), fit: 1.95, tint: 0x8a8977, clusterOffset: 6, scaleMin: 0.72, scaleMax: 1.46, lift: 0.008, tintMix: 0.1 },
            { src: "/models/smithsonian-tubipora-musica.glb", count: countFor(9, 4, 1), fit: 4.2, tint: 0xbb735b, clusterOffset: 1, scaleMin: 0.7, scaleMax: 1.18 },
            { src: "/models/smithsonian-chonelasma-oreia.glb", count: countFor(8, 3, 1), fit: 3.1, tint: 0xd7c7a3, clusterOffset: 4, scaleMin: 0.72, scaleMax: 1.08 },
            { src: "/models/smithsonian-tridacna-squamosa.glb", count: countFor(10, 4, 1), fit: 2.45, tint: 0xd8b67b, clusterOffset: 8, scaleMin: 0.78, scaleMax: 1.28, lift: 0.05 },
            { src: "/models/smithsonian-endoxocrinus-parrae.glb", count: countFor(11, 4, 1), fit: 3.35, tint: 0x8cbf92, clusterOffset: 11, scaleMin: 0.68, scaleMax: 0.98, floorActor: true },
          ],
          "sisters-islands": [
            { src: "/models/polyhaven/stone_01/stone_01_1k.gltf", count: countFor(28, 12, biomeConfig.rockDensity), fit: 1.75, tint: 0x8b8a7c, clusterOffset: 1, scaleMin: 0.68, scaleMax: 1.36, lift: 0.008, tintMix: 0.12 },
            { src: "/models/polyhaven/rock_07/rock_07_1k.gltf", count: countFor(14, 6, biomeConfig.rockDensity), fit: 2.45, tint: 0x64705c, clusterOffset: 6, scaleMin: 0.52, scaleMax: 0.96, lift: 0.01, tintMix: 0.16 },
            { src: "/models/smithsonian-chonelasma-oreia.glb", count: countFor(22, 9, 1), fit: 3.45, tint: 0xbfae82, clusterOffset: 0, scaleMin: 0.78, scaleMax: 1.28 },
            { src: "/models/smithsonian-tridacna-squamosa.glb", count: countFor(8, 3, 1), fit: 2.2, tint: 0xc1a970, clusterOffset: 3, scaleMin: 0.68, scaleMax: 1.04, lift: 0.05 },
            { src: "/models/smithsonian-endoxocrinus-parrae.glb", count: countFor(24, 10, 1), fit: 3.15, tint: 0x85ad78, clusterOffset: 5, scaleMin: 0.72, scaleMax: 1.16, floorActor: true },
            { src: "/models/smithsonian-tubipora-musica.glb", count: countFor(6, 2, 1), fit: 3.5, tint: 0xa86f58, clusterOffset: 8, scaleMin: 0.62, scaleMax: 0.9 },
          ],
          "coral-triangle": [
            { src: "/models/polyhaven/rock_07/rock_07_1k.gltf", count: countFor(40, 17, biomeConfig.rockDensity), fit: 3.45, tint: 0x505b56, clusterOffset: 0, scaleMin: 0.66, scaleMax: 1.46, lift: 0.01, tintMix: 0.14 },
            { src: "/models/polyhaven/stone_01/stone_01_1k.gltf", count: countFor(26, 11, biomeConfig.rockDensity), fit: 2.05, tint: 0x836f61, clusterOffset: 7, scaleMin: 0.7, scaleMax: 1.36, lift: 0.008, tintMix: 0.1 },
            { src: "/models/smithsonian-tubipora-musica.glb", count: countFor(20, 8, 1), fit: 4.5, tint: 0xd07862, clusterOffset: 2, scaleMin: 0.76, scaleMax: 1.34 },
            { src: "/models/smithsonian-chonelasma-oreia.glb", count: countFor(15, 6, 1), fit: 3.4, tint: 0xd6c9a7, clusterOffset: 5, scaleMin: 0.76, scaleMax: 1.22 },
            { src: "/models/smithsonian-tridacna-squamosa.glb", count: countFor(18, 7, 1), fit: 2.6, tint: 0xe0b978, clusterOffset: 8, scaleMin: 0.78, scaleMax: 1.42, lift: 0.05 },
            { src: "/models/smithsonian-endoxocrinus-parrae.glb", count: countFor(26, 10, 1), fit: 3.55, tint: 0x7fc98f, clusterOffset: 10, scaleMin: 0.7, scaleMax: 1.2, floorActor: true },
          ],
          "caribbean-reef": [
            { src: "/models/polyhaven/stone_01/stone_01_1k.gltf", count: countFor(38, 15, biomeConfig.rockDensity), fit: 1.9, tint: 0x91896f, clusterOffset: 1, scaleMin: 0.72, scaleMax: 1.52, lift: 0.008, tintMix: 0.12 },
            { src: "/models/polyhaven/rock_07/rock_07_1k.gltf", count: countFor(18, 7, biomeConfig.rockDensity), fit: 2.8, tint: 0x6d7468, clusterOffset: 5, scaleMin: 0.52, scaleMax: 1.04, lift: 0.01, tintMix: 0.12 },
            { src: "/models/smithsonian-tridacna-squamosa.glb", count: countFor(5, 2, 1), fit: 2.05, tint: 0xd4b47b, clusterOffset: 1, scaleMin: 0.7, scaleMax: 0.98, lift: 0.05 },
            { src: "/models/smithsonian-tubipora-musica.glb", count: countFor(16, 6, 1), fit: 3.85, tint: 0xbd7159, clusterOffset: 4, scaleMin: 0.7, scaleMax: 1.18 },
            { src: "/models/smithsonian-chonelasma-oreia.glb", count: countFor(20, 8, 1), fit: 3.05, tint: 0xd4c79e, clusterOffset: 7, scaleMin: 0.76, scaleMax: 1.24 },
            { src: "/models/smithsonian-endoxocrinus-parrae.glb", count: countFor(7, 3, 1), fit: 3.1, tint: 0x88b886, clusterOffset: 9, scaleMin: 0.6, scaleMax: 0.88, floorActor: true },
          ],
        };
        await Promise.allSettled(
          floorScannedHabitatsByBiome[biome].map(async (asset) => {
            const gltf = await gltfLoader.loadAsync(asset.src);
            if (!alive) return;
            const template = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(template);
            const templateSize = bounds.getSize(new THREE.Vector3());
            const templateCenter = bounds.getCenter(new THREE.Vector3());
            const fit = asset.fit / Math.max(templateSize.x, templateSize.y, templateSize.z, 0.001);
            template.position.copy(templateCenter.multiplyScalar(-fit));
            template.scale.setScalar(fit);
            template.traverse((object) => {
              if (!isMesh(object)) return;
              object.castShadow = false;
              object.receiveShadow = true;
            });

            for (let index = 0; index < asset.count; index += 1) {
              const cluster = clusters[(index + asset.clusterOffset) % clusters.length];
              const theta = random() * Math.PI * 2;
              const radius = 8 + random() * (cluster[3] + 12);
              const x = cluster[0] + Math.cos(theta) * radius + (random() - 0.5) * 12;
              const z = cluster[2] + Math.sin(theta) * radius * 0.92 + (random() - 0.5) * 8;
              const habitat = template.clone(true);
              const tint = new THREE.Color(asset.tint);
              habitat.traverse((object) => {
                if (!isMesh(object)) return;
                const source = Array.isArray(object.material) ? object.material : [object.material];
                const cloned = source.map((material) => material.clone());
                object.material = Array.isArray(object.material) ? cloned : cloned[0];
                for (const material of cloned) {
                  const surface = material as Material & { color?: Color; roughness?: number; metalness?: number };
                  if (surface.color) surface.color.lerp(tint, asset.tintMix ?? 0.26);
                  if (typeof surface.roughness === "number") surface.roughness = Math.max(0.68, surface.roughness);
                  if (typeof surface.metalness === "number") surface.metalness = 0;
                }
              });
              const habitatBounds = new THREE.Box3().setFromObject(habitat);
              const habitatBottom = Number.isFinite(habitatBounds.min.y) ? habitatBounds.min.y : -0.5;
              habitat.position.y -= habitatBottom;

              const pivot = new THREE.Group();
              const baseScale = asset.scaleMin + random() * (asset.scaleMax - asset.scaleMin);
              pivot.add(habitat);
              pivot.position.set(x, seabedHeight(x, z) + (asset.lift ?? 0.02), z);
              pivot.rotation.set((random() - 0.5) * 0.12, random() * Math.PI * 2, (random() - 0.5) * 0.12);
              pivot.scale.setScalar(baseScale);
              if (asset.floorActor) bottomActors.push({ object: pivot, baseScale });
              world.add(pivot);
            }
          }),
        );

        const creatureAssetsByBiome: Record<ReefBiomeId, Array<{
          src: string;
          count: number;
          fit: number;
          rotationY: number;
          floor?: boolean;
          scaleMin: number;
          scaleMax: number;
          speed: number;
        }>> = {
          "great-barrier": [
            { src: "/models/barramundi-fish.glb", count: countFor(18, 8, biomeConfig.fishDensity), fit: 2.2, rotationY: Math.PI / 2, scaleMin: 0.55, scaleMax: 1.18, speed: 0.13 },
            { src: "/models/smithsonian-diodon-hystrix.glb", count: countFor(5, 2, biomeConfig.fishDensity * 0.75), fit: 1.45, rotationY: Math.PI / 2, scaleMin: 0.86, scaleMax: 1.24, speed: 0.095 },
            { src: "/models/smithsonian-linckia-laevigata.glb", count: countFor(10, 4, biomeConfig.bottomLifeDensity), fit: 2, rotationY: 0, floor: true, scaleMin: 0.72, scaleMax: 1.12, speed: 0.02 },
          ],
          "sisters-islands": [
            { src: "/models/barramundi-fish.glb", count: countFor(12, 5, biomeConfig.fishDensity), fit: 2.05, rotationY: Math.PI / 2, scaleMin: 0.48, scaleMax: 0.95, speed: 0.11 },
            { src: "/models/smithsonian-linckia-laevigata.glb", count: countFor(9, 4, biomeConfig.bottomLifeDensity), fit: 2, rotationY: 0, floor: true, scaleMin: 0.66, scaleMax: 1.05, speed: 0.018 },
          ],
          "coral-triangle": [
            { src: "/models/barramundi-fish.glb", count: countFor(28, 12, biomeConfig.fishDensity), fit: 2.16, rotationY: Math.PI / 2, scaleMin: 0.5, scaleMax: 1.16, speed: 0.14 },
            { src: "/models/smithsonian-diodon-hystrix.glb", count: countFor(8, 3, biomeConfig.fishDensity * 0.82), fit: 1.45, rotationY: Math.PI / 2, scaleMin: 0.84, scaleMax: 1.3, speed: 0.09 },
            { src: "/models/smithsonian-linckia-laevigata.glb", count: countFor(16, 7, biomeConfig.bottomLifeDensity), fit: 2, rotationY: 0, floor: true, scaleMin: 0.72, scaleMax: 1.2, speed: 0.022 },
          ],
          "caribbean-reef": [
            { src: "/models/smithsonian-diodon-hystrix.glb", count: countFor(8, 3, biomeConfig.fishDensity * 0.88), fit: 1.45, rotationY: Math.PI / 2, scaleMin: 0.86, scaleMax: 1.28, speed: 0.09 },
            { src: "/models/smithsonian-lactophrys-bicaudalis.glb", count: countFor(15, 6, biomeConfig.fishDensity), fit: 1.25, rotationY: Math.PI / 2, scaleMin: 0.82, scaleMax: 1.18, speed: 0.105 },
          ],
        };
        const creatureAssets = creatureAssetsByBiome[biome];
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
                bottomActors.push({ object: pivot, baseScale });
              } else {
                fishActors.push({
                  object: pivot,
                  offset: random() * Math.PI * 2,
                  lane: (random() - 0.5) * FLOOR_WIDTH * 0.62,
                  depth: FLOOR_CENTER_Z + FLOOR_DEPTH * 0.36 - random() * FLOOR_DEPTH * 0.7,
                  radius: 7 + random() * 12,
                  height: biomeConfig.fishCruiseHeight[0] + random() * (biomeConfig.fishCruiseHeight[1] - biomeConfig.fishCruiseHeight[0]),
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
        const particleColor = biomeConfig.terrain === "turbid-lagoon" ? 0xd2e0b8 : biomeConfig.terrain === "caribbean-spur" ? 0xd8fff4 : 0xb8efe7;
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: particleColor, size: lowPower ? 0.04 : 0.052, transparent: true, opacity: biomeConfig.terrain === "turbid-lagoon" ? 0.43 : 0.34, depthWrite: false }));
        world.add(particles);

        const nav = {
          yaw: Math.atan2(-spawnDirection.x, -spawnDirection.z),
          pitch: Math.asin(THREE.MathUtils.clamp(spawnDirection.y, -1, 1)),
          velocity: new THREE.Vector3(),
          keys: new Set<string>(),
          dragging: false,
          moved: false,
          lastX: 0,
          lastY: 0,
          mobileForward: false,
          zone: "",
          depth: "",
          lastFocus: "" as string | null,
          focusTransit: 0,
        };
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        const projected = new THREE.Vector3();
        const desired = new THREE.Vector3();
        const look = spawnLookAt.clone();
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
        const navigationKeyFromEvent = (event: KeyboardEvent) => {
          if (event.code === "Space") return "space";
          if (event.code === "AltLeft" || event.code === "AltRight") return "alt";
          return event.key.toLowerCase();
        };
        const navigationKeys = new Set([
          "w",
          "a",
          "s",
          "d",
          "q",
          "e",
          "space",
          "alt",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "shift",
        ]);
        const keyDown = (event: KeyboardEvent) => {
          if (!activeRef.current) return;
          const key = navigationKeyFromEvent(event);
          if (navigationKeys.has(key)) {
            event.preventDefault();
            nav.keys.add(key);
          }
        };
        const keyUp = (event: KeyboardEvent) => {
          const key = navigationKeyFromEvent(event);
          if (navigationKeys.has(key)) event.preventDefault();
          nav.keys.delete(key);
        };
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
          healthy: { fog: baseFog.clone(), density: biomeConfig.fogDensity, wash: new THREE.Color(0xd69c79), blend: 0.02, pressure: 0.02, structureLoss: 0, life: 0.74 },
          heat: { fog: baseFog.clone().lerp(new THREE.Color(0x8e7968), 0.28), density: biomeConfig.fogDensity + 0.002, wash: new THREE.Color(0xf09b70), blend: 0.09, pressure: 0.28, structureLoss: 0.006, life: 0.54 },
          bleaching: { fog: baseFog.clone().lerp(new THREE.Color(0xa7aaa1), 0.42), density: biomeConfig.fogDensity + 0.004, wash: new THREE.Color(0xe8ddcc), blend: 0.2, pressure: 0.68, structureLoss: 0.038, life: 0.3 },
          recovery: { fog: baseFog.clone().lerp(new THREE.Color(0x4cae87), 0.22), density: Math.max(0.007, biomeConfig.fogDensity - 0.001), wash: new THREE.Color(0x94c08c), blend: 0.05, pressure: 0.12, structureLoss: 0.012, life: 0.74 },
        };
        const visiblePhase = {
          fog: phaseColors[phaseRef.current].fog.clone(),
          density: phaseColors[phaseRef.current].density,
          wash: phaseColors[phaseRef.current].wash.clone(),
          blend: phaseColors[phaseRef.current].blend,
          pressure: phaseColors[phaseRef.current].pressure,
          structureLoss: phaseColors[phaseRef.current].structureLoss,
          life: phaseColors[phaseRef.current].life,
        };
        const targetColor = new THREE.Color();
        const spotVector = new THREE.Vector3();

        renderer.setAnimationLoop(() => {
          if (!alive) return;
          const delta = Math.min(clock.getDelta(), 0.05);
          const elapsed = clock.elapsedTime;
          const currentPhase = phaseColors[phaseRef.current];
          const phaseEase = 1 - Math.exp(-delta * 0.36);
          visiblePhase.fog.lerp(currentPhase.fog, phaseEase);
          visiblePhase.wash.lerp(currentPhase.wash, phaseEase);
          visiblePhase.density = THREE.MathUtils.lerp(visiblePhase.density, currentPhase.density, phaseEase);
          visiblePhase.blend = THREE.MathUtils.lerp(visiblePhase.blend, currentPhase.blend, phaseEase);
          visiblePhase.pressure = THREE.MathUtils.lerp(visiblePhase.pressure, currentPhase.pressure, phaseEase);
          visiblePhase.structureLoss = THREE.MathUtils.lerp(visiblePhase.structureLoss, currentPhase.structureLoss, phaseEase);
          visiblePhase.life = THREE.MathUtils.lerp(visiblePhase.life, currentPhase.life, phaseEase);
          const runoff = stressorRef.current === "runoff";
          scene.fog!.color.lerp(visiblePhase.fog, 1 - Math.exp(-delta * 0.8));
          (scene.fog as InstanceType<typeof THREE.FogExp2>).density = THREE.MathUtils.lerp((scene.fog as InstanceType<typeof THREE.FogExp2>).density, visiblePhase.density + (runoff ? 0.016 : 0), 1 - Math.exp(-delta * 0.8));
          for (const entry of livingMaterials) {
            if (!entry.material.color) continue;
            const profile = SCANS[entry.scanKey];
            const restoredBuffer = restoredRef.current.includes(entry.hotspotId) ? 0.24 : 1;
            const stressBlend = visiblePhase.pressure * profile.sensitivity * restoredBuffer;
            const recoveryReturn = phaseRef.current === "recovery" ? profile.recovery * 0.16 : 0;
            const runoffPenalty = runoff ? 0.1 * Math.max(0.3, profile.sensitivity) : 0;
            const blend = THREE.MathUtils.clamp(visiblePhase.blend + stressBlend + runoffPenalty - recoveryReturn, 0.02, 0.88);
            targetColor.copy(entry.base).lerp(visiblePhase.wash, blend);
            if (phaseRef.current === "recovery") targetColor.lerp(entry.base, profile.recovery * 0.22);
            entry.material.color.lerp(targetColor, 1 - Math.exp(-delta * (0.42 + entry.transitionLag * 0.28)));
          }
          lifeMaterial.opacity = THREE.MathUtils.lerp(lifeMaterial.opacity, visiblePhase.life, 1 - Math.exp(-delta * 0.7));

          causticTexture.offset.x = (elapsed * 0.012) % 1;
          causticTexture.offset.y = (elapsed * -0.008) % 1;
          waterNormals.offset.x = (elapsed * 0.028) % 1;
          waterNormals.offset.y = (elapsed * 0.017) % 1;
          surfaceReflectionTexture.offset.x = (elapsed * -0.006) % 1;
          surfaceReflectionTexture.offset.y = (elapsed * 0.012) % 1;
          surfaceReflections.position.y = biomeConfig.waterY - 0.16 + (reduced ? 0 : Math.sin(elapsed * 0.46) * 0.055);
          surfaceReflectionMaterial.opacity = reduced ? 0.14 : 0.2 + Math.sin(elapsed * 0.58) * 0.035;
          surfaceGlints.position.x = reduced ? 0 : Math.sin(elapsed * 0.06) * 5.4;
          surfaceGlints.position.z = reduced ? 0 : Math.cos(elapsed * 0.045) * 4.6;
          particles.position.x = Math.sin(elapsed * 0.04) * 6;
          grass.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.42) * 0.014;
          kelp.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.32) * 0.022;
          seaFans.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.28) * 0.012;
          softPolyps.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.5) * 0.01;
          animatedCorals.forEach((target, index) => {
            const baseScale = typeof target.userData.baseScale === "number" ? target.userData.baseScale : 1;
            const animOffset = typeof target.userData.animOffset === "number" ? target.userData.animOffset : index * 1.7;
            const scanKey = target.userData.scanKey as ScanAssetKey | undefined;
            const profile = scanKey ? SCANS[scanKey] : undefined;
            const restoredBuffer = restoredRef.current.includes(target.userData.hotspotId as string) ? 0.25 : 1;
            const stressScale = visiblePhase.structureLoss * (profile?.sensitivity ?? 0.65) * restoredBuffer;
            const pulse = reduced ? 1 : 1 + Math.sin(elapsed * 0.8 + animOffset) * 0.008;
            target.scale.setScalar(baseScale * pulse * (1 - stressScale));
          });
          if (!reduced) {
            for (let index = 0; index < lifeParticleCount; index += 1) {
              const offset = index * 3;
              const meta = index * 4;
              const phase = lifeMeta[meta] + elapsed * lifeMeta[meta + 1];
              const radius = lifeMeta[meta + 3];
              lifePositions[offset] =
                lifeBase[offset] +
                Math.cos(phase) * radius * 0.08 +
                Math.sin(elapsed * 0.34 + lifeBase[offset + 2] * 0.05) * 0.16;
              lifePositions[offset + 1] = lifeBase[offset + 1];
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
          bottomActors.forEach((actor) => {
            actor.object.scale.setScalar(actor.baseScale);
          });

          const focused = focusRef.current ? hotspotsRef.current.find((item) => item.id === focusRef.current) : undefined;
          if (focused) {
            const focusSize = scanDisplaySize(focused);
            const focusIndex = Math.max(0, hotspotsRef.current.findIndex((item) => item.id === focused.id));
            const isGuidedFocus = guidedFocusRef.current;
            if (nav.lastFocus !== focused.id) nav.focusTransit = 1;
            nav.focusTransit = Math.max(0, nav.focusTransit - delta * 0.42);
            const travelArc = isGuidedFocus ? Math.sin(nav.focusTransit * Math.PI) : 0;
            const orbit = isGuidedFocus ? Math.sin(elapsed * 0.17 + focusIndex * 0.9) * 2.8 : 1.8;
            const reefHeight = seabedHeight(focused.position[0], focused.position[2]);
            desired.set(
              focused.position[0] + orbit,
              reefHeight + (isGuidedFocus ? 4.2 + travelArc * 2.6 : 2.3),
              focused.position[2] + Math.max(isGuidedFocus ? 12.8 : 9.6, focusSize * (isGuidedFocus ? 1.95 : 1.55)),
            );
            camera.position.lerp(desired, 1 - Math.exp(-delta * (isGuidedFocus ? 1.65 : 2.8)));
            const focusLift = hotspotMarkerLifts.get(focused.id) ?? Math.max(1.1, focusSize * 0.48);
            spotVector.set(
              focused.position[0],
              reefHeight + Math.min(focusLift * (isGuidedFocus ? 0.62 : 0.48), 2.4),
              focused.position[2],
            );
            look.lerp(spotVector, 1 - Math.exp(-delta * (isGuidedFocus ? 2.05 : 3.4)));
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
            const vertical =
              (nav.keys.has("e") || nav.keys.has("space") ? 1 : 0) -
              (nav.keys.has("q") || nav.keys.has("alt") ? 1 : 0);
            const hasManualMovement = wantsForward || wantsBack || wantsLeft || wantsRight || vertical !== 0;
            if (ambientDriftRef.current && !hasManualMovement && activeRef.current) {
              nav.yaw += delta * 0.026;
              nav.pitch = THREE.MathUtils.lerp(nav.pitch, -0.045 + Math.sin(elapsed * 0.18) * 0.035, 1 - Math.exp(-delta * 0.7));
            }
            direction.set(-Math.sin(nav.yaw), 0, -Math.cos(nav.yaw));
            right.set(Math.cos(nav.yaw), 0, -Math.sin(nav.yaw));
            const boost = nav.keys.has("shift") ? FREE_SWIM_SHIFT_SPEED : FREE_SWIM_SPEED;
            desired.set(0, vertical * VERTICAL_SWIM_SPEED, 0);
            desired.addScaledVector(direction, ((wantsForward ? 1 : 0) - (wantsBack ? 1 : 0)) * boost);
            desired.addScaledVector(right, ((wantsRight ? 1 : 0) - (wantsLeft ? 1 : 0)) * boost * 0.82);
            if (ambientDriftRef.current && !hasManualMovement && activeRef.current) {
              desired.addScaledVector(direction, 1.05);
              desired.addScaledVector(right, Math.sin(elapsed * 0.2) * 0.42);
              desired.y = Math.sin(elapsed * 0.26) * 0.28;
            }
            nav.velocity.lerp(desired, 1 - Math.exp(-delta * 6.4));
            if (!activeRef.current) nav.velocity.multiplyScalar(Math.exp(-delta * 8));
            camera.position.addScaledVector(nav.velocity, delta);
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, WORLD_BOUNDS.zMin, WORLD_BOUNDS.zMax);
            camera.rotation.set(nav.pitch + (reduced ? 0 : Math.sin(elapsed * 0.56) * 0.004), nav.yaw, 0);
          }

          camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, WORLD_BOUNDS.zMin, WORLD_BOUNDS.zMax);
          const nextZone =
            biomeConfig.zones.find((zone) => camera.position.z > zone.minZ) ??
            biomeConfig.zones[biomeConfig.zones.length - 1];
          const nominalDepth = Math.max(
            MIN_DIVE_DEPTH_METERS,
            Number.parseFloat(nextZone.depth) || 18,
          );
          const terrainY = seabedHeight(camera.position.x, camera.position.z);
          const maxHeightAboveSeabed =
            (nominalDepth - MIN_DIVE_DEPTH_METERS) / DEPTH_METERS_PER_WORLD_UNIT;
          const surfaceLimitedY = Math.min(
            WORLD_BOUNDS.yMax,
            terrainY + Math.max(0, maxHeightAboveSeabed),
          );
          camera.position.y = THREE.MathUtils.clamp(
            camera.position.y,
            WORLD_BOUNDS.yMin,
            Math.max(WORLD_BOUNDS.yMin, surfaceLimitedY),
          );
          const heightAboveSeabed = Math.max(0, camera.position.y - terrainY);
          const liveDepth = THREE.MathUtils.clamp(
            Math.round(nominalDepth - heightAboveSeabed * DEPTH_METERS_PER_WORLD_UNIT),
            MIN_DIVE_DEPTH_METERS,
            36,
          );
          const liveDepthLabel = `${liveDepth} m`;
          if (nextZone.name !== nav.zone || liveDepthLabel !== nav.depth) {
            nav.zone = nextZone.name;
            nav.depth = liveDepthLabel;
            callbacksRef.current.onZoneChange?.(nextZone.name, liveDepthLabel);
          }

          const width = host.clientWidth;
          const height = host.clientHeight;
          for (const hotspot of hotspotsRef.current) {
            const marker = markerRefs.current.get(hotspot.id);
            if (!marker) continue;
            const markerLift =
              hotspotMarkerLifts.get(hotspot.id) ??
              Math.max(1.15, scanDisplaySize(hotspot) * 0.52);
            spotVector.set(
              hotspot.position[0],
              seabedHeight(hotspot.position[0], hotspot.position[2]) + markerLift,
              hotspot.position[2],
            );
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
              className={`reef-scene__marker${mappedHotspot ? " is-mapped" : ""}${focusId === hotspot.id ? " is-focused" : ""}`}
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
