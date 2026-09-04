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
    id: "elkhorn-palmata",
    label: "Colony E4",
    scan: "acropora-palmata",
    species: "Acropora palmata",
    common: "Elkhorn coral",
    image: "/specimens/acropora-palmata.jpg",
    position: [-50, 2.45, -38],
    size: 7.6,
    tint: 0xf0a271,
    yaw: -0.62,
    zone: "Branching Crest",
    lesson: {
      form: "Thick antler-like branches build a three-dimensional canopy rather than a flat table.",
      habitat: "Elkhorn structure breaks waves and creates shelter lanes for reef fish.",
      scientistCheck: "A field team would pair the scan with close photos of branch tips and living tissue margins.",
    },
  },
  {
    id: "brain-diploria",
    label: "Colony B6",
    scan: "diploria-brain",
    species: "Diploria labyrinthiformis",
    common: "Grooved brain coral",
    image: "/specimens/diploria-labyrinthiformis.jpg",
    position: [58, 2.75, -34],
    size: 6.8,
    tint: 0xd7bf82,
    yaw: 0.36,
    zone: "Maze Dome",
    lesson: {
      form: "Long winding ridges increase feeding surface while protecting soft tissue in grooves.",
      habitat: "Massive brain corals can persist for decades, making them useful long-term reef markers.",
      scientistCheck: "Surveyors compare groove width, ridge shape, and colony position before naming the species.",
    },
  },
  {
    id: "porites-andrewsi",
    label: "Colony M11",
    scan: "porites-mound",
    species: "Porites andrewsi",
    common: "Porites mound coral",
    image: "/specimens/porites-andrewsi.jpg",
    position: [-72, 2.65, -78],
    size: 6.1,
    tint: 0xd9c278,
    yaw: -1,
    zone: "Mound Nursery",
    lesson: {
      form: "Rounded mound growth favors dense skeleton and steady vertical buildup.",
      habitat: "Porites mounds can stabilize patch reefs and hold records of past water conditions.",
      scientistCheck: "A scan shows shape, but corallite detail and local records are needed for a confident ID.",
    },
  },
  {
    id: "flowerpot-goniopora",
    label: "Colony F15",
    scan: "goniopora-column",
    species: "Goniopora columna",
    common: "Flowerpot coral",
    image: "/specimens/goniopora-columna.jpg",
    position: [-12, 2.72, -72],
    size: 6.2,
    tint: 0xd29274,
    yaw: 0.6,
    zone: "Polyp Meadow",
    lesson: {
      form: "Column-like skeletons can carry many extended polyps, giving the colony a soft living edge.",
      habitat: "That fuzzy surface captures food but is sensitive to sediment settling between polyps.",
      scientistCheck: "Scientists watch polyp extension and water clarity before deciding whether stress is present.",
    },
  },
  {
    id: "mushroom-fungia",
    label: "Colony D18",
    scan: "fungia-disc",
    species: "Fungia discus",
    common: "Mushroom coral",
    image: "/specimens/fungia-discus.jpg",
    position: [24, 2.65, -94],
    size: 5.7,
    tint: 0xe9aa72,
    yaw: -0.28,
    zone: "Sand Apron",
    lesson: {
      form: "A single free-living disc spreads tissue across ribs instead of anchoring as a mound.",
      habitat: "Mushroom corals can occupy sandy gaps where fixed branching corals struggle.",
      scientistCheck: "Field notes should record whether the coral is free on sediment or attached to hard reef.",
    },
  },
  {
    id: "cauliflower-pocillopora",
    label: "Colony C22",
    scan: "pocillopora-cauliflower",
    species: "Pocillopora nobilis",
    common: "Cauliflower coral",
    image: "/specimens/pocillopora-nobilis.jpg",
    position: [76, 3, -106],
    size: 6,
    tint: 0xe08978,
    yaw: 0.9,
    zone: "Surge Thicket",
    lesson: {
      form: "Knobby branching makes a compact thicket with many small gaps.",
      habitat: "The form shelters juvenile fish but can trap debris after storms or runoff pulses.",
      scientistCheck: "Look between branchlets for pale tissue, algae, or sediment before scoring health.",
    },
  },
  {
    id: "birdsnest-seriatopora",
    label: "Colony S29",
    scan: "seriatopora-birdsnest",
    species: "Seriatopora hystrix",
    common: "Birdsnest coral",
    image: "/specimens/seriatopora-hystrix.jpg",
    position: [-48, 3.05, -126],
    size: 5.9,
    tint: 0xeaa17d,
    yaw: -0.72,
    zone: "Fine Branch Field",
    lesson: {
      form: "Thin interlaced branches create a delicate lattice with a high surface area.",
      habitat: "That lattice can be excellent shelter, but fine branches are vulnerable to heat and breakage.",
      scientistCheck: "Repeated scans help separate normal branch complexity from recent tissue loss.",
    },
  },
  {
    id: "blue-heliopora",
    label: "Colony H31",
    scan: "heliopora-blue",
    species: "Heliopora coerulea",
    common: "Blue coral",
    image: "/specimens/heliopora-coerulea.jpg",
    position: [6, 3.08, -148],
    size: 5.9,
    tint: 0x89bac2,
    yaw: 0.18,
    zone: "Blue Ridge",
    lesson: {
      form: "Blue coral builds upright ridges and plates with a distinctive blue-tinted skeleton.",
      habitat: "Rigid ridges add hard habitat where small animals can graze and hide.",
      scientistCheck: "Color alone is not enough; observers compare skeleton, colony form, and polyp pattern.",
    },
  },
  {
    id: "plate-agaricia",
    label: "Colony L37",
    scan: "agaricia-plate",
    species: "Agaricia lamarcki",
    common: "Lamarck's sheet coral",
    image: "/specimens/agaricia-lamarcki.jpg",
    position: [54, 3.25, -170],
    size: 6.3,
    tint: 0xd7ad76,
    yaw: -0.44,
    zone: "Plate Terrace",
    lesson: {
      form: "Thin plating growth stacks light-catching surfaces across a shaded terrace.",
      habitat: "Plates make overhangs where fish and invertebrates can move through layered shelter.",
      scientistCheck: "Scan shape should be checked against close skeletal ridges before calling the species.",
    },
  },
  {
    id: "lettuce-pavona",
    label: "Colony V42",
    scan: "pavona-lettuce",
    species: "Pavona chiriquiensis",
    common: "Lettuce coral",
    image: "/specimens/pavona-chiriquiensis.jpg",
    position: [-82, 3.4, -192],
    size: 6.6,
    tint: 0xd6ba78,
    yaw: 0.82,
    zone: "Folded Edge",
    lesson: {
      form: "Folded sheets make a lettuce-like shape that catches light from many angles.",
      habitat: "The folds slow small currents and create narrow shelter for reef animals.",
      scientistCheck: "Surveyors compare folds, ridges, and local range data before assigning a final name.",
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
