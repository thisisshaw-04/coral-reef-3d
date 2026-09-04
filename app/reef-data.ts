import type { ReefPhase, ReefSceneHotspot } from "./components/ReefScene";

export type Tool = "scan" | "mark" | "note" | "restore";
export type Stressor = "heat" | "co2" | "plastic" | "runoff";
export type Explorer = {
  id: string;
  name: string;
  color: string;
  lastSeen: number;
};
export type Annotation = {
  hotspotId: string;
  label: string;
  health: string;
  by: string;
  note?: string;
};
export type ReefRoom = {
  code: string;
  explorers: Explorer[];
  annotations: Record<string, Annotation>;
  updatedAt: number;
};
export type Colony = ReefSceneHotspot & {
  species: string;
  common: string;
  image: string;
  zone: string;
};
export type ReefMoment = {
  year: string;
  title: string;
  phase: ReefPhase;
  temp: number;
  dhw: number;
  ph: number;
  health: number;
};

export const colonies: Colony[] = [
  {
    id: "acro-table",
    label: "Colony A7",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    position: [-8, 2.6, -11],
    zone: "Current Gate",
  },
  {
    id: "acro-compact",
    label: "Colony P3",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    position: [8, 2.2, -27],
    zone: "Turbid Shelf",
  },
  {
    id: "massive-star",
    label: "Colony R12",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    position: [24, 2.7, -47],
    zone: "Archive Garden",
  },
];

export const moments: ReefMoment[] = [
  {
    year: "1998",
    title: "First global event",
    phase: "heat",
    temp: 0.9,
    dhw: 4.1,
    ph: 8.1,
    health: 72,
  },
  {
    year: "2016",
    title: "Mass bleaching",
    phase: "bleaching",
    temp: 1.5,
    dhw: 8.2,
    ph: 8.07,
    health: 43,
  },
  {
    year: "2024",
    title: "Record ocean heat",
    phase: "bleaching",
    temp: 1.8,
    dhw: 10.4,
    ph: 8.05,
    health: 31,
  },
  {
    year: "2026",
    title: "Today · intervene",
    phase: "healthy",
    temp: 0.7,
    dhw: 3.2,
    ph: 8.06,
    health: 68,
  },
  {
    year: "2035",
    title: "Recovery window",
    phase: "recovery",
    temp: 0.4,
    dhw: 1.1,
    ph: 8.08,
    health: 84,
  },
];

export const reefWorlds = [
  "Great Barrier Reef",
  "Sisters' Islands",
  "Coral Triangle",
  "Caribbean Reef",
];

export const emptyRoom: ReefRoom = {
  code: "DIVE",
  explorers: [],
  annotations: {},
  updatedAt: 0,
};

export const stressCopy: Record<Stressor, { label: string; effect: string }> = {
  heat: {
    label: "Heat +1.5C",
    effect: "Thermal stress accumulates over weeks; bleaching risk rises.",
  },
  co2: {
    label: "CO2 / pH -0.1",
    effect: "Acidification reduces the carbonate corals use to build skeletons.",
  },
  plastic: {
    label: "Plastic debris",
    effect: "Debris can shade, abrade and increase disease risk locally.",
  },
  runoff: {
    label: "Runoff pulse",
    effect: "Sediment blocks light and raises background turbidity.",
  },
};
