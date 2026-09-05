import type {
  ReefBiomeId,
  ReefPhase,
  ReefSceneHotspot,
  ScanAssetKey,
} from "./components/ReefScene";

export type Tool = "scan" | "mark" | "note" | "restore" | "library" | "story";
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
export type ReefWorld = {
  id: ReefBiomeId;
  name: string;
  region: string;
  reefType: string;
  expedition: string;
  objectiveTitle: string;
  objectiveBody: string;
  objectiveSteps: string[];
  researchBasis: string;
  colonies: Colony[];
};

type ColonyProfile = Pick<
  Colony,
  "scan" | "species" | "common" | "image" | "tint" | "lesson"
>;

type ColonyConfig = Pick<
  Colony,
  "id" | "label" | "position" | "size" | "yaw" | "zone"
> &
  Partial<Pick<Colony, "common" | "species" | "lesson" | "tint">>;

export const coralProfiles = {
  "acro-table": {
    scan: "acro-table",
    species: "Acropora hyacinthus",
    common: "Table coral",
    image: "/specimens/acropora-hyacinthus.jpg",
    tint: 0xf2aa7c,
    lesson: {
      form: "Broad table plates spread sideways to catch light in clear, moving water.",
      habitat: "The flat canopy makes shaded shelter for small fish while its rim faces the current.",
      scientistCheck: "A real ID would compare corallite detail, colony location, and close-up skeletal structure.",
    },
  },
  "acro-compact": {
    scan: "acro-compact",
    species: "Acropora humilis",
    common: "Compact branching coral",
    image: "/specimens/acropora-humilis.jpg",
    tint: 0xe9867a,
    lesson: {
      form: "Short, thick branches resist surge better than delicate plates.",
      habitat: "The compact shape traps pockets of calm water where tiny animals can hide.",
      scientistCheck: "A field biologist would check branch tips, corallite spacing, and local reef records.",
    },
  },
  "massive-star": {
    scan: "massive-star",
    species: "Plesiastraea armata",
    common: "Massive star coral",
    image: "/specimens/plesiastraea-armata.jpg",
    tint: 0xe8c889,
    lesson: {
      form: "Massive rounded colonies grow slowly, building heavy skeleton over many years.",
      habitat: "The boulder shape is a long-lived reef foundation and can survive rougher seasons.",
      scientistCheck: "A confident ID would need close inspection of the star-like corallite pattern.",
    },
  },
  "acropora-palmata": {
    scan: "acropora-palmata",
    species: "Acropora palmata",
    common: "Elkhorn coral",
    image: "/specimens/acropora-palmata.jpg",
    tint: 0xf0a271,
    lesson: {
      form: "Thick antler-like branches build a three-dimensional canopy rather than a flat table.",
      habitat: "Elkhorn structure breaks waves and creates shelter lanes for reef fish.",
      scientistCheck: "A field team would pair the scan with close photos of branch tips and living tissue margins.",
    },
  },
  "acropora-cervicornis": {
    scan: "acropora-cervicornis",
    species: "Acropora cervicornis",
    common: "Staghorn coral",
    image: "/specimens/acropora-palmata.jpg",
    tint: 0xe8a07b,
    lesson: {
      form: "Branching staghorn colonies grow as antler-like thickets instead of flat plates.",
      habitat: "Those branches historically formed Caribbean nursery structure for reef fish and mobile invertebrates.",
      scientistCheck: "A field team would pair the scan with close tissue photos, disease checks, and local restoration records.",
    },
  },
  "diploria-brain": {
    scan: "diploria-brain",
    species: "Diploria labyrinthiformis",
    common: "Grooved brain coral",
    image: "/specimens/diploria-labyrinthiformis.jpg",
    tint: 0xd7bf82,
    lesson: {
      form: "Long winding ridges increase feeding surface while protecting soft tissue in grooves.",
      habitat: "Massive brain corals can persist for decades, making them useful long-term reef markers.",
      scientistCheck: "Surveyors compare groove width, ridge shape, and colony position before naming the species.",
    },
  },
  "porites-mound": {
    scan: "porites-mound",
    species: "Porites andrewsi",
    common: "Porites mound coral",
    image: "/specimens/porites-andrewsi.jpg",
    tint: 0xd9c278,
    lesson: {
      form: "Rounded mound growth favors dense skeleton and steady vertical buildup.",
      habitat: "Porites mounds can stabilize patch reefs and hold records of past water conditions.",
      scientistCheck: "A scan shows shape, but corallite detail and local records are needed for a confident ID.",
    },
  },
  "goniopora-column": {
    scan: "goniopora-column",
    species: "Goniopora columna",
    common: "Flowerpot coral",
    image: "/specimens/goniopora-columna.jpg",
    tint: 0xd29274,
    lesson: {
      form: "Column-like skeletons can carry many extended polyps, giving the colony a soft living edge.",
      habitat: "That fuzzy surface captures food but is sensitive to sediment settling between polyps.",
      scientistCheck: "Scientists watch polyp extension and water clarity before deciding whether stress is present.",
    },
  },
  "fungia-disc": {
    scan: "fungia-disc",
    species: "Fungia discus",
    common: "Mushroom coral",
    image: "/specimens/fungia-discus.jpg",
    tint: 0xe9aa72,
    lesson: {
      form: "A single free-living disc spreads tissue across ribs instead of anchoring as a mound.",
      habitat: "Mushroom corals can occupy sandy gaps where fixed branching corals struggle.",
      scientistCheck: "Field notes should record whether the coral is free on sediment or attached to hard reef.",
    },
  },
  "pocillopora-cauliflower": {
    scan: "pocillopora-cauliflower",
    species: "Pocillopora nobilis",
    common: "Cauliflower coral",
    image: "/specimens/pocillopora-nobilis.jpg",
    tint: 0xe08978,
    lesson: {
      form: "Knobby branching makes a compact thicket with many small gaps.",
      habitat: "The form shelters juvenile fish but can trap debris after storms or runoff pulses.",
      scientistCheck: "Look between branchlets for pale tissue, algae, or sediment before scoring health.",
    },
  },
  "seriatopora-birdsnest": {
    scan: "seriatopora-birdsnest",
    species: "Seriatopora hystrix",
    common: "Birdsnest coral",
    image: "/specimens/seriatopora-hystrix.jpg",
    tint: 0xeaa17d,
    lesson: {
      form: "Thin interlaced branches create a delicate lattice with a high surface area.",
      habitat: "That lattice can be excellent shelter, but fine branches are vulnerable to heat and breakage.",
      scientistCheck: "Repeated scans help separate normal branch complexity from recent tissue loss.",
    },
  },
  "heliopora-blue": {
    scan: "heliopora-blue",
    species: "Heliopora coerulea",
    common: "Blue coral",
    image: "/specimens/heliopora-coerulea.jpg",
    tint: 0x89bac2,
    lesson: {
      form: "Blue coral builds upright ridges and plates with a distinctive blue-tinted skeleton.",
      habitat: "Rigid ridges add hard habitat where small animals can graze and hide.",
      scientistCheck: "Color alone is not enough; observers compare skeleton, colony form, and polyp pattern.",
    },
  },
  "agaricia-plate": {
    scan: "agaricia-plate",
    species: "Agaricia lamarcki",
    common: "Lamarck's sheet coral",
    image: "/specimens/agaricia-lamarcki.jpg",
    tint: 0xd7ad76,
    lesson: {
      form: "Thin plating growth stacks light-catching surfaces across a shaded terrace.",
      habitat: "Plates make overhangs where fish and invertebrates can move through layered shelter.",
      scientistCheck: "Scan shape should be checked against close skeletal ridges before calling the species.",
    },
  },
  "pavona-lettuce": {
    scan: "pavona-lettuce",
    species: "Pavona chiriquiensis",
    common: "Lettuce coral",
    image: "/specimens/pavona-chiriquiensis.jpg",
    tint: 0xd6ba78,
    lesson: {
      form: "Folded sheets make a lettuce-like shape that catches light from many angles.",
      habitat: "The folds slow small currents and create narrow shelter for reef animals.",
      scientistCheck: "Surveyors compare folds, ridges, and local range data before assigning a final name.",
    },
  },
} satisfies Record<ScanAssetKey, ColonyProfile>;

const makeColony = (scan: ScanAssetKey, config: ColonyConfig): Colony => {
  const profile = coralProfiles[scan];
  return {
    ...profile,
    ...config,
    scan,
    tint: config.tint ?? profile.tint,
  };
};

export const createLibraryColonyFromHotspot = (
  hotspot: ReefSceneHotspot,
  world: Pick<ReefWorld, "name" | "expedition" | "researchBasis">,
): Colony => {
  const scan =
    hotspot.scan ??
    (hotspot.id in coralProfiles ? (hotspot.id as ScanAssetKey) : "acro-table");
  const profile = coralProfiles[scan];

  return {
    ...profile,
    id: hotspot.id,
    label: hotspot.label,
    position: hotspot.position,
    scan,
    size: hotspot.size,
    tint: hotspot.tint ?? profile.tint,
    yaw: hotspot.yaw,
    zone: `${world.expedition} library transect`,
    lesson: {
      ...profile.lesson,
      scientistCheck: `${profile.lesson.scientistCheck} Logged in the ${world.name} notebook from the research basis: ${world.researchBasis}`,
    },
  };
};

const greatBarrierColonies: Colony[] = [
  makeColony("acro-table", {
    id: "gbr-acro-table",
    label: "Colony A7",
    position: [-18, 2.5, -28],
    size: 7.8,
    yaw: 0.22,
    zone: "Outer shelf table field",
  }),
  makeColony("acro-compact", {
    id: "gbr-acro-compact",
    label: "Colony P3",
    position: [12, 2.25, -46],
    size: 6.3,
    yaw: 0.35,
    zone: "Surge-resistant crest",
  }),
  makeColony("porites-mound", {
    id: "gbr-porites-mound",
    label: "Colony M11",
    position: [-74, 2.65, -94],
    size: 6.1,
    yaw: -1,
    zone: "Massive Porites mound",
  }),
  makeColony("goniopora-column", {
    id: "gbr-goniopora",
    label: "Colony F15",
    position: [-10, 2.72, -116],
    size: 6.2,
    yaw: 0.6,
    zone: "Polyp meadow",
  }),
  makeColony("fungia-disc", {
    id: "gbr-fungia",
    label: "Colony D18",
    position: [42, 2.65, -154],
    size: 5.7,
    yaw: -0.28,
    zone: "Sand apron",
  }),
  makeColony("pocillopora-cauliflower", {
    id: "gbr-pocillopora",
    label: "Colony C22",
    position: [104, 3, -196],
    size: 6,
    yaw: 0.9,
    zone: "Cauliflower thicket",
  }),
  makeColony("seriatopora-birdsnest", {
    id: "gbr-seriatopora",
    label: "Colony S29",
    position: [-54, 3.05, -246],
    size: 5.9,
    yaw: -0.72,
    zone: "Fine branch field",
  }),
  makeColony("heliopora-blue", {
    id: "gbr-heliopora",
    label: "Colony H31",
    position: [24, 3.08, -306],
    size: 5.9,
    yaw: 0.18,
    zone: "Blue ridge",
  }),
];

const sistersIslandsColonies: Colony[] = [
  makeColony("pavona-lettuce", {
    id: "sis-foliose-pectinia",
    label: "Colony S1",
    species: "Pectinia and Merulina foliose group",
    common: "Foliose plate coral",
    position: [-26, 2.55, -34],
    size: 6.6,
    yaw: 0.54,
    zone: "Turbid reef flat",
    lesson: {
      form: "Singapore studies report foliose colonies such as Pectinia and Merulina as major cover-formers.",
      habitat: "Layered plates tolerate the lower-light, sediment-influenced southern island reefs better than many delicate branches.",
      scientistCheck: "This is a representative scan placement; a real field ID would need local close-up corallites and site records.",
    },
  }),
  makeColony("agaricia-plate", {
    id: "sis-pachyseris-terrace",
    label: "Colony S2",
    species: "Pachyseris-style foliose terrace",
    common: "Ridge plate coral",
    position: [28, 2.58, -58],
    size: 6.1,
    yaw: -0.38,
    zone: "Low-light slope",
    lesson: {
      form: "Foliose and encrusting forms spread as thin sheets, a useful strategy where water is turbid.",
      habitat: "Thin terraces create shadowed microhabitats for sponges, juvenile fish, and mobile invertebrates.",
      scientistCheck: "The app represents the growth form from a scan; field crews would confirm genus under magnification.",
    },
  }),
  makeColony("porites-mound", {
    id: "sis-porites-mound",
    label: "Colony S3",
    position: [-82, 2.62, -94],
    size: 5.8,
    yaw: -0.8,
    zone: "Sediment-tolerant mound",
  }),
  makeColony("goniopora-column", {
    id: "sis-goniopora",
    label: "Colony S4",
    position: [-8, 2.7, -132],
    size: 5.9,
    yaw: 0.8,
    zone: "Extended polyp patch",
  }),
  makeColony("fungia-disc", {
    id: "sis-fungia",
    label: "Colony S5",
    position: [68, 2.75, -166],
    size: 5.8,
    yaw: -0.25,
    zone: "Sandy lagoon gap",
  }),
  makeColony("massive-star", {
    id: "sis-massive-brain",
    label: "Colony S6",
    species: "Platygyra and Favites massive group",
    common: "Massive brain-coral analogue",
    position: [-58, 2.9, -214],
    size: 6.5,
    yaw: -0.62,
    zone: "Maze coral bank",
    lesson: {
      form: "Singapore records include massive maze and star-coral forms that build dense, rounded reef heads.",
      habitat: "Massive colonies are slower-growing, but their skeletons can persist as stable habitat through disturbed seasons.",
      scientistCheck: "The displayed scan represents the massive growth form; exact Singapore IDs need local skeletal detail.",
    },
  }),
  makeColony("acro-compact", {
    id: "sis-branching-acropora",
    label: "Colony S7",
    species: "Acropora branching remnant",
    common: "Rare branching coral patch",
    position: [34, 3, -258],
    size: 5.6,
    yaw: 0.18,
    zone: "Restoration outcrop",
    lesson: {
      form: "Branching Acropora can occur in Singapore, but long-term studies show it contributes little cover on average.",
      habitat: "Small branching patches add valuable shelter even when they are not the dominant reef form.",
      scientistCheck: "A restoration survey would pair repeated scans with close tissue and sediment observations.",
    },
  }),
  makeColony("pocillopora-cauliflower", {
    id: "sis-pocillopora",
    label: "Colony S8",
    position: [102, 3.05, -314],
    size: 5.4,
    yaw: 1,
    zone: "Nursery rubble crest",
  }),
];

const coralTriangleColonies: Colony[] = [
  makeColony("acro-table", {
    id: "ct-acro-table",
    label: "Colony T1",
    position: [-40, 2.65, -32],
    size: 8.2,
    yaw: 0.4,
    zone: "Raja Ampat table canopy",
  }),
  makeColony("acro-compact", {
    id: "ct-acro-compact",
    label: "Colony T2",
    position: [28, 2.55, -62],
    size: 6.7,
    yaw: -0.18,
    zone: "Corymbose Acropora field",
  }),
  makeColony("seriatopora-birdsnest", {
    id: "ct-seriatopora",
    label: "Colony T3",
    position: [-94, 2.8, -108],
    size: 6.1,
    yaw: -0.5,
    zone: "Birdsnest lattice",
  }),
  makeColony("pocillopora-cauliflower", {
    id: "ct-pocillopora",
    label: "Colony T4",
    position: [86, 2.95, -140],
    size: 6.2,
    yaw: 0.78,
    zone: "Cauliflower coral thicket",
  }),
  makeColony("goniopora-column", {
    id: "ct-goniopora",
    label: "Colony T5",
    position: [-22, 3.05, -184],
    size: 6.5,
    yaw: 0.2,
    zone: "Soft-polyp garden",
  }),
  makeColony("heliopora-blue", {
    id: "ct-heliopora",
    label: "Colony T6",
    position: [58, 3.2, -230],
    size: 6.2,
    yaw: 0.95,
    zone: "Blue-coral ridge",
  }),
  makeColony("fungia-disc", {
    id: "ct-fungia",
    label: "Colony T7",
    position: [-72, 3.35, -278],
    size: 6,
    yaw: -0.25,
    zone: "Mushroom sand channel",
  }),
  makeColony("pavona-lettuce", {
    id: "ct-pavona",
    label: "Colony T8",
    position: [18, 3.58, -338],
    size: 6.9,
    yaw: 0.72,
    zone: "Folded plate drop-off",
  }),
  makeColony("porites-mound", {
    id: "ct-porites",
    label: "Colony T9",
    position: [116, 3.7, -388],
    size: 6.5,
    yaw: -0.85,
    zone: "Massive archive mound",
  }),
];

const caribbeanColonies: Colony[] = [
  makeColony("acropora-cervicornis", {
    id: "car-staghorn",
    label: "Colony C1",
    position: [-34, 2.55, -36],
    size: 7.2,
    yaw: -0.62,
    zone: "Staghorn reef crest",
  }),
  makeColony("acro-compact", {
    id: "car-staghorn-analog",
    label: "Colony C2",
    species: "Acropora cervicornis restoration analogue",
    common: "Staghorn thicket form",
    position: [34, 2.45, -76],
    size: 6.7,
    yaw: 0.18,
    zone: "Staghorn nursery lane",
    lesson: {
      form: "NOAA describes staghorn as dense antler-like thickets that historically structured Caribbean reef zones.",
      habitat: "Branching thickets create nursery shelter for reef fish, but they are vulnerable to disease and heat stress.",
      scientistCheck: "This comparison keeps the compact Acropora form as a nearby analogue while the reef crest uses the dedicated staghorn scan.",
    },
  }),
  makeColony("diploria-brain", {
    id: "car-diploria",
    label: "Colony C3",
    position: [-88, 2.72, -128],
    size: 7,
    yaw: 0.36,
    zone: "Brain coral dome",
  }),
  makeColony("agaricia-plate", {
    id: "car-agaricia",
    label: "Colony C4",
    position: [82, 2.95, -174],
    size: 6.5,
    yaw: -0.44,
    zone: "Agaricia plate terrace",
  }),
  makeColony("porites-mound", {
    id: "car-porites",
    label: "Colony C5",
    position: [-28, 3.05, -228],
    size: 6.4,
    yaw: -0.88,
    zone: "Porites hardbottom",
  }),
  makeColony("massive-star", {
    id: "car-star-coral-analog",
    label: "Colony C6",
    species: "Orbicella star-coral analogue",
    common: "Boulder star coral form",
    position: [44, 3.25, -296],
    size: 7,
    yaw: -0.7,
    zone: "Limestone spur",
    lesson: {
      form: "Star corals and other massive forms build long-lived Caribbean reef foundations.",
      habitat: "Their heavy domes create durable structure even when branching corals have declined.",
      scientistCheck: "This scan represents the massive star-coral form; exact Caribbean species assignment would need local records.",
    },
  }),
  makeColony("diploria-brain", {
    id: "car-brain-ridge",
    label: "Colony C7",
    position: [112, 3.45, -354],
    size: 6.6,
    yaw: -0.2,
    zone: "Maze ridge marker",
  }),
];

export const reefWorlds: ReefWorld[] = [
  {
    id: "great-barrier",
    name: "Great Barrier Reef",
    region: "Australia",
    reefType: "outer shelf reef",
    expedition: "Outer Shelf Transect",
    objectiveTitle: "Map heat-sensitive shelf colonies",
    objectiveBody:
      "AIMS monitoring shows Great Barrier Reef impacts vary by coral type, with fast-growing Acropora often driving rapid cover changes after disturbance.",
    objectiveSteps: [
      "Compare table, branching, massive, and free-living forms.",
      "Look for heat-sensitive Acropora and Pocillopora signals.",
      "Use recovery time to see why fast growth can return cover.",
    ],
    researchBasis:
      "AIMS LTMP and bleaching updates: Acropora, Montipora, Porites, Seriatopora, Pocillopora, Goniopora, Favia and related genera.",
    colonies: greatBarrierColonies,
  },
  {
    id: "sisters-islands",
    name: "Sisters' Islands",
    region: "Singapore",
    reefType: "turbid tropical reef",
    expedition: "Southern Islands Nursery",
    objectiveTitle: "Read a lower-light urban reef",
    objectiveBody:
      "Singapore reefs are rich but turbid: long-term studies emphasize foliose, massive, sub-massive, and encrusting forms over branching cover.",
    objectiveSteps: [
      "Study foliose and massive colonies before the rare branches.",
      "Notice seagrass, sponges, clams, and sediment-tolerant life.",
      "Treat the nursery as restoration support, not instant recovery.",
    ],
    researchBasis:
      "NParks and Singapore reef studies: more than 250 hard coral species, over 200 sponges, 120 reef fish, with Merulina, Pectinia, Montipora, Pachyseris, Porites, Echinopora and Platygyra prominent in cover studies.",
    colonies: sistersIslandsColonies,
  },
  {
    id: "coral-triangle",
    name: "Coral Triangle",
    region: "Indonesia, Philippines, PNG and neighbors",
    reefType: "biodiversity center",
    expedition: "Biodiversity Wall",
    objectiveTitle: "Scan the high-diversity engine",
    objectiveBody:
      "The Coral Triangle is the world's coral diversity center, so this terrain mixes branching, plating, massive, blue-coral, mushroom, and soft-polyp habitats.",
    objectiveSteps: [
      "Use the navigator like a biodiversity survey, not a single-species hunt.",
      "Compare how steep walls, rubble shelves, and sand channels host different forms.",
      "Watch fish and particle movement around the densest coral neighborhoods.",
    ],
    researchBasis:
      "Coral Triangle Atlas and CTI-CFF: roughly 600+ reef-building coral species and very high reef-fish diversity across fringing reefs, atolls, straits, and volcanic coastlines.",
    colonies: coralTriangleColonies,
  },
  {
    id: "caribbean-reef",
    name: "Caribbean Reef",
    region: "Bahamas, Florida, Puerto Rico and wider Caribbean",
    reefType: "spur-and-groove reef",
    expedition: "Acropora Recovery Run",
    objectiveTitle: "Track reef builders and foundations",
    objectiveBody:
      "NOAA identifies elkhorn, staghorn, and star corals as key Caribbean reef builders, with brain corals and plates forming long-lived foundation habitat.",
    objectiveSteps: [
      "Start at the elkhorn crest, then follow the staghorn nursery lane.",
      "Compare branching decline with massive brain and star-coral persistence.",
      "Look for restoration cues without hiding disease and warming pressure.",
    ],
    researchBasis:
      "NOAA Fisheries and NOAA Ocean Service: Acropora palmata, Acropora cervicornis, star corals, brain corals, Agaricia plates, Porites hardbottom, and shallow spur-and-groove habitats.",
    colonies: caribbeanColonies,
  },
];

export const defaultWorldId: ReefBiomeId = "great-barrier";
export const colonies = greatBarrierColonies;
export const getWorldById = (id: ReefBiomeId) =>
  reefWorlds.find((world) => world.id === id) ?? reefWorlds[0];

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
    title: "Recovery watch",
    phase: "heat",
    temp: 0.8,
    dhw: 3.8,
    ph: 8.06,
    health: 49,
  },
  {
    year: "2035",
    title: "Low-stress scenario",
    phase: "recovery",
    temp: 0.4,
    dhw: 1.1,
    ph: 8.08,
    health: 72,
  },
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
    effect: "DHW near 4 can trigger bleaching; DHW near 8 signals widespread bleaching and mortality risk.",
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
