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
  lesson: {
    form: string;
    habitat: string;
    scientistCheck: string;
  };
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
    scan: "acro-table",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    position: [-13, 2.5, -15],
    size: 7.8,
    tint: 0xf2aa7c,
    yaw: 0.22,
    zone: "Current Gate",
    lesson: {
      form: "Broad table plates spread sideways to catch light in clear, moving water.",
      habitat: "The flat canopy makes shaded shelter for small fish while its rim faces the current.",
      scientistCheck: "A real ID would compare corallite detail, colony location, and close-up skeletal structure.",
    },
  },
  {
    id: "acro-table-backreef",
    label: "Colony A14",
    scan: "acro-table",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    position: [-44, 2.4, -31],
    size: 6.4,
    tint: 0xeaa06f,
    yaw: -0.58,
    zone: "Backreef Canopy",
    lesson: {
      form: "This scan shows a flatter canopy where the colony invests in horizontal growth.",
      habitat: "Table corals can create a shaded roof that changes current flow for fish and recruits below.",
      scientistCheck: "A real survey would photograph the rim and corallites before confirming the species.",
    },
  },
  {
    id: "acro-table-rim",
    label: "Colony A22",
    scan: "acro-table",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    position: [31, 2.6, -36],
    size: 7.1,
    tint: 0xf4b283,
    yaw: 0.74,
    zone: "Light Rim",
    lesson: {
      form: "Thin spreading plates put most growth near the bright outer edge.",
      habitat: "A table rim can be the first place to bleach because it sits in high light and high flow.",
      scientistCheck: "Compare upper-surface color with shaded underside before calling it stress damage.",
    },
  },
  {
    id: "acro-table-current",
    label: "Colony A35",
    scan: "acro-table",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    position: [54, 2.9, -74],
    size: 8.2,
    tint: 0xe99b70,
    yaw: -1.02,
    zone: "Outer Current",
    lesson: {
      form: "The plate-like scan catches light while presenting a broad edge to moving water.",
      habitat: "Fast flow can feed polyps and clear sediment, but heat stress can still overwhelm the colony.",
      scientistCheck: "Field teams would pair the scan with water-motion notes and repeated photos.",
    },
  },
  {
    id: "acro-compact",
    label: "Colony P3",
    scan: "acro-compact",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    position: [7, 2.25, -27],
    size: 6.3,
    tint: 0xe9867a,
    yaw: 0.35,
    zone: "Turbid Shelf",
    lesson: {
      form: "Short, thick branches resist surge better than delicate plates.",
      habitat: "The compact shape traps pockets of calm water where tiny animals can hide.",
      scientistCheck: "A field biologist would check branch tips, corallite spacing, and local reef records.",
    },
  },
  {
    id: "acro-compact-bommie",
    label: "Colony P9",
    scan: "acro-compact",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    position: [-25, 2.4, -54],
    size: 6,
    tint: 0xdf8270,
    yaw: -0.22,
    zone: "Shelter Bommie",
    lesson: {
      form: "The scan has dense branch tips that make many small pockets of shelter.",
      habitat: "Compact colonies can hold juvenile fish and invertebrates close to the reef floor.",
      scientistCheck: "Confirming health means looking between branches for pale tissue or algal overgrowth.",
    },
  },
  {
    id: "acro-compact-surge",
    label: "Colony P18",
    scan: "acro-compact",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    position: [20, 2.6, -88],
    size: 5.8,
    tint: 0xe48f79,
    yaw: 0.96,
    zone: "Surge Pocket",
    lesson: {
      form: "Rounded branch clusters reduce breakage when waves push water back and forth.",
      habitat: "Surge pockets can be noisy habitats where only sturdy forms persist.",
      scientistCheck: "A careful observer would separate natural branch color from recent bleaching.",
    },
  },
  {
    id: "acro-compact-lagoon",
    label: "Colony P26",
    scan: "acro-compact",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    position: [-56, 2.8, -112],
    size: 6.2,
    tint: 0xdd776d,
    yaw: 1.12,
    zone: "Lagoon Patch",
    lesson: {
      form: "This repeated scan helps compare how the same form reads in a calmer patch.",
      habitat: "Lagoon colonies may face more sediment, so branch spacing can matter for clearing surfaces.",
      scientistCheck: "Scientists would check whether muted color is lighting, sediment, or tissue stress.",
    },
  },
  {
    id: "massive-star",
    label: "Colony R12",
    scan: "massive-star",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    position: [24, 2.7, -50],
    size: 6.8,
    tint: 0xe8c889,
    yaw: -0.7,
    zone: "Archive Garden",
    lesson: {
      form: "Massive rounded colonies grow slowly, building heavy skeleton over many years.",
      habitat: "The boulder shape is a long-lived reef foundation and can survive rougher seasons.",
      scientistCheck: "A confident ID would need close inspection of the star-like corallite pattern.",
    },
  },
  {
    id: "massive-star-dome",
    label: "Colony R19",
    scan: "massive-star",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    position: [-6, 2.8, -78],
    size: 7.3,
    tint: 0xdfc58c,
    yaw: 0.18,
    zone: "Dome Field",
    lesson: {
      form: "A dome-shaped scan stores growth in a dense skeleton rather than fast branches.",
      habitat: "Massive colonies can act like long-term reef infrastructure through repeated seasons.",
      scientistCheck: "Look for living tissue around the corallite pits before judging the colony cover.",
    },
  },
  {
    id: "massive-star-ledge",
    label: "Colony R27",
    scan: "massive-star",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    position: [58, 3.1, -128],
    size: 7,
    tint: 0xd7bd84,
    yaw: -0.44,
    zone: "Old Ledge",
    lesson: {
      form: "The heavy rounded profile suggests slow growth and long survival.",
      habitat: "Older ledge colonies can preserve reef structure after delicate branching corals are lost.",
      scientistCheck: "A scan helps track surface change, but close images are needed for species-level certainty.",
    },
  },
  {
    id: "massive-star-archive",
    label: "Colony R33",
    scan: "massive-star",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    position: [-18, 3.2, -150],
    size: 7.8,
    tint: 0xe2c991,
    yaw: 0.82,
    zone: "Deep Archive",
    lesson: {
      form: "Repeated boulder scans show how massive colonies make stable habitat over time.",
      habitat: "The archive zone is a comparison area for slower-growing corals and recovery projections.",
      scientistCheck: "Compare the model with time-series photos before deciding whether recovery is real.",
    },
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
