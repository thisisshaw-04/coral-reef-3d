"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import type { Color, Material, Mesh, Object3D } from "three";

export type ReefPhase = "healthy" | "heat" | "bleaching" | "recovery";

export type ReefSceneHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
};

type ReefSceneProps = {
  active?: boolean;
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

const SCANS: Record<string, { desktop: string; mobile: string; size: number; tint: number }> = {
  "acro-table": {
    desktop: "/models/acropora-hyacinthus.glb",
    mobile: "/models/acropora-hyacinthus-mobile.glb",
    size: 7.4,
    tint: 0xd2a084,
  },
  "acro-compact": {
    desktop: "/models/acropora-humilis.glb",
    mobile: "/models/acropora-humilis-mobile.glb",
    size: 6.2,
    tint: 0xb98675,
  },
  "massive-star": {
    desktop: "/models/plesiastraea-armata.glb",
    mobile: "/models/plesiastraea-armata-mobile.glb",
    size: 6.8,
    tint: 0xc8aa82,
  },
};

const FALLBACK_POSITIONS: Record<string, { left: string; top: string }> = {
  "acro-table": { left: "35%", top: "59%" },
  "acro-compact": { left: "59%", top: "55%" },
  "massive-star": { left: "76%", top: "51%" },
};

const WORLD_BOUNDS = {
  x: 96,
  yMin: 2.8,
  yMax: 13.5,
  zMin: -178,
  zMax: 28,
};

const FLOOR_WIDTH = 260;
const FLOOR_DEPTH = 380;
const FLOOR_CENTER_Z = -78;

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
        const random = seededRandom();
        const seabedHeight = (x: number, z: number) => {
          const softRidges =
            Math.sin(x * 0.055 + z * 0.018) * 0.52 +
            Math.cos(z * 0.043) * 0.42 +
            Math.sin((x - z) * 0.032) * 0.3;
          const swimChannel =
            Math.max(0, 1 - Math.abs(x + z * 0.1) / 26) * -0.85;
          const sideRise = Math.max(0, (Math.abs(x) - 48) / 46) ** 2 * 4.9;
          const farRise = Math.max(0, (-z - 112) / 66) * 4.1;

          return softRidges + swimChannel + sideRise + farRise - 0.9;
        };
        const renderer = new THREE.WebGPURenderer({ canvas, alpha: false, antialias: !lowPower });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.65));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x021219);
        scene.fog = new THREE.FogExp2(0x063845, 0.017);

        const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 320);
        camera.rotation.order = "YXZ";
        camera.position.set(0, 5.2, 17);

        const world = new THREE.Group();
        scene.add(world);
        const livingMaterials: Array<{ material: Material & { color?: Color; emissive?: Color }; base: Color; hotspotId: string }> = [];
        const coralTargets: Object3D[] = [];
        const fishActors: Array<{ object: Object3D; offset: number; lane: number; depth: number }> = [];
        const textures: Array<{ dispose: () => void }> = [];

        scene.add(new THREE.HemisphereLight(0x86d9d4, 0x071014, 1.6));
        const sun = new THREE.DirectionalLight(0xbafef1, 3.2);
        sun.position.set(-24, 36, 18);
        world.add(sun);
        const blueFill = new THREE.PointLight(0x35b7bd, 32, 70, 1.8);
        blueFill.position.set(4, 9, -18);
        world.add(blueFill);
        const warmFill = new THREE.PointLight(0xffb68c, 14, 34, 2);
        warmFill.position.set(22, 5, -43);
        world.add(warmFill);

        const textureLoader = new THREE.TextureLoader();
        const [gravel, gravelNormal, gravelArm] = await Promise.all([
          textureLoader.loadAsync("/textures/coral-gravel-diffuse.jpg"),
          textureLoader.loadAsync("/textures/coral-gravel-normal.jpg"),
          textureLoader.loadAsync("/textures/coral-gravel-arm.jpg"),
        ]);
        gravel.colorSpace = THREE.SRGBColorSpace;
        for (const texture of [gravel, gravelNormal, gravelArm]) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(26, 38);
          texture.anisotropy = lowPower ? 2 : 8;
          textures.push(texture);
        }

        const floorGeometry = new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH, lowPower ? 58 : 104, lowPower ? 76 : 148);
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
          new THREE.MeshStandardMaterial({ map: gravel, normalMap: gravelNormal, aoMap: gravelArm, roughnessMap: gravelArm, metalnessMap: gravelArm, color: 0x9b9180, roughness: 0.96, metalness: 0.02 }),
        );
        world.add(floor);

        const causticCanvas = document.createElement("canvas");
        causticCanvas.width = causticCanvas.height = 512;
        const causticContext = causticCanvas.getContext("2d");
        if (causticContext) {
          causticContext.fillStyle = "#001218";
          causticContext.fillRect(0, 0, 512, 512);
          causticContext.globalCompositeOperation = "screen";
          for (let index = 0; index < 90; index += 1) {
            const x = random() * 512;
            const y = random() * 512;
            const radius = 10 + random() * 45;
            const gradient = causticContext.createRadialGradient(x, y, radius * 0.35, x, y, radius);
            gradient.addColorStop(0, "rgba(190,255,242,.35)");
            gradient.addColorStop(0.48, "rgba(105,240,223,.11)");
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
        causticTexture.repeat.set(9, 14);
        textures.push(causticTexture);
        const caustics = new THREE.Mesh(
          new THREE.PlaneGeometry(FLOOR_WIDTH * 0.96, FLOOR_DEPTH * 0.94),
          new THREE.MeshBasicMaterial({ map: causticTexture, color: 0x8fe9dd, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        caustics.rotation.x = -Math.PI / 2;
        caustics.position.set(0, -0.38, FLOOR_CENTER_Z);
        world.add(caustics);

        const normalCanvas = document.createElement("canvas");
        normalCanvas.width = normalCanvas.height = 256;
        const normalContext = normalCanvas.getContext("2d");
        if (normalContext) {
          normalContext.fillStyle = "rgb(128,128,255)";
          normalContext.fillRect(0, 0, 256, 256);
          for (let index = 0; index < 520; index += 1) {
            const shade = 105 + Math.floor(random() * 46);
            normalContext.strokeStyle = `rgba(${shade},${150 - Math.floor(random() * 42)},255,.35)`;
            normalContext.lineWidth = 1 + random() * 3;
            normalContext.beginPath();
            const x = random() * 256;
            const y = random() * 256;
            normalContext.moveTo(x, y);
            normalContext.bezierCurveTo(x + 15, y - 8, x + 28, y + 9, x + 45, y);
            normalContext.stroke();
          }
        }
        const waterNormals = new THREE.CanvasTexture(normalCanvas);
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
        textures.push(waterNormals);
        const water = new WaterMesh(new THREE.PlaneGeometry(380, 430), {
          waterNormals,
          alpha: 0.68,
          waterColor: 0x0d5667,
          sunColor: 0xd9fff8,
          sunDirection: new THREE.Vector3(0.42, 0.82, 0.2).normalize(),
          distortionScale: 3.8,
          size: 1.45,
          resolutionScale: lowPower ? 0.22 : 0.42,
        });
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 13.2, -72);
        water.material.side = THREE.DoubleSide;
        world.add(water);

        const rayMaterial = new THREE.MeshBasicMaterial({ color: 0x8de5dc, transparent: true, opacity: lowPower ? 0.035 : 0.055, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
        for (let index = 0; index < (lowPower ? 7 : 15); index += 1) {
          const ray = new THREE.Mesh(new THREE.ConeGeometry(5 + random() * 9, 62, 24, 1, true), rayMaterial);
          ray.position.set(-82 + index * 13 + random() * 9, 27, 10 - random() * 178);
          ray.rotation.z = (random() - 0.5) * 0.14;
          ray.rotation.x = Math.PI;
          world.add(ray);
        }

        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0d3034, roughness: 0.98, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
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
        makeReefWall(260, 34, [0, 9.5, -205]);
        makeReefWall(250, 34, [-128, 9, -78], Math.PI / 2);
        makeReefWall(250, 34, [128, 9, -78], -Math.PI / 2);

        const rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x223b36, roughness: 0.93 }), lowPower ? 116 : 220);
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const position = new THREE.Vector3();
        const scale = new THREE.Vector3();
        for (let index = 0; index < rocks.count; index += 1) {
          const shelf = index % 5 === 0;
          const x = shelf
            ? (random() < 0.5 ? -1 : 1) * (58 + random() * 52)
            : (random() - 0.5) * 190;
          const z = 30 - random() * 215;
          const size = shelf ? 2.4 + random() * 7.8 : 0.45 + random() * 3.1;
          position.set(x, seabedHeight(x, z) + size * 0.28, z);
          quaternion.setFromEuler(new THREE.Euler(random(), random() * Math.PI, random()));
          scale.set(size * (0.7 + random() * 0.55), size * (0.42 + random() * 0.38), size);
          matrix.compose(position, quaternion, scale);
          rocks.setMatrixAt(index, matrix);
        }
        rocks.instanceMatrix.needsUpdate = true;
        world.add(rocks);

        const sponges = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.52, 1.9, 14, 3, false), new THREE.MeshStandardMaterial({ color: 0x7f6b46, roughness: 0.72 }), lowPower ? 70 : 130);
        const clusters: Array<[number, number, number, number]> = [[-8, 0, -11, 12], [8, 0, -27, 12], [24, 0, -47, 14], [-38, 0, -64, 20], [42, 0, -86, 24], [-12, 0, -126, 28], [58, 0, -150, 22]];
        for (let index = 0; index < sponges.count; index += 1) {
          const cluster = clusters[index % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 3.5 + random() * cluster[3];
          const height = 0.7 + random() * 2.1;
          const x = cluster[0] + Math.cos(theta) * radius;
          const z = cluster[2] + Math.sin(theta) * radius;
          position.set(x, seabedHeight(x, z) + height * 0.48, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.2));
          scale.set(0.5 + random() * 0.9, height, 0.5 + random() * 0.9);
          matrix.compose(position, quaternion, scale);
          sponges.setMatrixAt(index, matrix);
        }
        sponges.instanceMatrix.needsUpdate = true;
        world.add(sponges);

        const grass = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22, 2.1, 1, 4), new THREE.MeshStandardMaterial({ color: 0x245d50, roughness: 0.84, side: THREE.DoubleSide }), lowPower ? 240 : 540);
        for (let index = 0; index < grass.count; index += 1) {
          const x = (random() - 0.5) * 205;
          const z = 28 - random() * 216;
          const height = 0.45 + random() * 1.25;
          position.set(x, seabedHeight(x, z) + height * 0.5, z);
          quaternion.setFromEuler(new THREE.Euler(0, random() * Math.PI, (random() - 0.5) * 0.2));
          scale.set(1, height, 1);
          matrix.compose(position, quaternion, scale);
          grass.setMatrixAt(index, matrix);
        }
        grass.instanceMatrix.needsUpdate = true;
        world.add(grass);

        const coralHeads = new THREE.InstancedMesh(
          new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0x6f5f45, roughness: 0.88 }),
          lowPower ? 72 : 148,
        );
        for (let index = 0; index < coralHeads.count; index += 1) {
          const cluster = clusters[(index + 2) % clusters.length];
          const theta = random() * Math.PI * 2;
          const radius = 5 + random() * (cluster[3] + 9);
          const x = cluster[0] + Math.cos(theta) * radius + (random() - 0.5) * 10;
          const z = cluster[2] + Math.sin(theta) * radius - random() * 8;
          const size = 0.55 + random() * 1.85;
          position.set(x, seabedHeight(x, z) + 0.05, z);
          quaternion.setFromEuler(new THREE.Euler(0, random() * Math.PI, 0));
          scale.set(size * (0.9 + random() * 0.45), size * (0.36 + random() * 0.24), size * (0.82 + random() * 0.52));
          matrix.compose(position, quaternion, scale);
          coralHeads.setMatrixAt(index, matrix);
        }
        coralHeads.instanceMatrix.needsUpdate = true;
        world.add(coralHeads);

        const seaFans = new THREE.InstancedMesh(
          new THREE.PlaneGeometry(1, 1.8, 1, 5),
          new THREE.MeshStandardMaterial({ color: 0x1f8b7f, roughness: 0.8, transparent: true, opacity: 0.58, side: THREE.DoubleSide }),
          lowPower ? 48 : 105,
        );
        for (let index = 0; index < seaFans.count; index += 1) {
          const x = (random() - 0.5) * 188;
          const z = 22 - random() * 225;
          const height = 0.9 + random() * 2.4;
          position.set(x, seabedHeight(x, z) + height * 0.48, z);
          quaternion.setFromEuler(new THREE.Euler((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.28));
          scale.set(0.65 + random() * 0.9, height, 1);
          matrix.compose(position, quaternion, scale);
          seaFans.setMatrixAt(index, matrix);
        }
        seaFans.instanceMatrix.needsUpdate = true;
        world.add(seaFans);

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        dracoLoader.preload();
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        const loadCoral = async (hotspot: ReefSceneHotspot) => {
          const asset = SCANS[hotspot.id];
          if (!asset) return;
          const gltf = await gltfLoader.loadAsync(lowPower ? asset.mobile : asset.desktop);
          if (!alive) return;
          const model = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const fit = asset.size / Math.max(size.x, size.y, size.z, 0.001);
          model.scale.setScalar(fit);
          model.position.copy(center.multiplyScalar(-fit));
          model.traverse((object) => {
            object.userData.hotspotId = hotspot.id;
            if (!isMesh(object)) return;
            object.receiveShadow = true;
            const source = Array.isArray(object.material) ? object.material : [object.material];
            const cloned = source.map((material) => material.clone());
            object.material = Array.isArray(object.material) ? cloned : cloned[0];
            for (const material of cloned) {
              const living = material as Material & { color?: Color; emissive?: Color; roughness?: number; metalness?: number };
              if (!living.color) continue;
              living.color.setHex(asset.tint);
              if (living.emissive) living.emissive.setHex(0x120b08);
              if (typeof living.roughness === "number") living.roughness = Math.max(0.58, living.roughness);
              if (typeof living.metalness === "number") living.metalness = 0;
              livingMaterials.push({ material: living, base: living.color.clone(), hotspotId: hotspot.id });
            }
          });
          const pedestal = new THREE.Group();
          pedestal.name = hotspot.id;
          pedestal.userData.hotspotId = hotspot.id;
          pedestal.position.set(...hotspot.position);
          pedestal.rotation.y = hotspot.id === "massive-star" ? -0.7 : 0.35;
          pedestal.add(model);
          coralTargets.push(pedestal);
          world.add(pedestal);
        };
        await Promise.allSettled(hotspotsRef.current.map(loadCoral));

        try {
          const fishGltf = await gltfLoader.loadAsync("/models/barramundi-fish.glb");
          if (alive) {
            const bounds = new THREE.Box3().setFromObject(fishGltf.scene);
            const fishSize = bounds.getSize(new THREE.Vector3());
            const fishCenter = bounds.getCenter(new THREE.Vector3());
            const fishScale = 2.2 / Math.max(fishSize.x, fishSize.y, fishSize.z, 0.001);
            fishGltf.scene.position.copy(fishCenter.multiplyScalar(-fishScale));
            fishGltf.scene.scale.setScalar(fishScale);
            const count = lowPower ? 11 : 22;
            for (let index = 0; index < count; index += 1) {
              const pivot = new THREE.Group();
              const fish = fishGltf.scene.clone(true);
              fish.scale.multiplyScalar(0.55 + random() * 0.65);
              fish.rotation.y = Math.PI / 2;
              pivot.add(fish);
              fishActors.push({ object: pivot, offset: random() * Math.PI * 2, lane: (random() - 0.5) * 86, depth: 22 - random() * 178 });
              world.add(pivot);
            }
          }
        } catch {
          // Decorative fish are not required for the science interaction.
        }

        const particleCount = lowPower ? 900 : 2200;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        for (let index = 0; index < particleCount; index += 1) {
          particlePositions[index * 3] = (random() - 0.5) * 230;
          particlePositions[index * 3 + 1] = random() * 17;
          particlePositions[index * 3 + 2] = 36 - random() * 245;
        }
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc4f3e9, size: lowPower ? 0.035 : 0.045, transparent: true, opacity: 0.38, depthWrite: false }));
        world.add(particles);

        const nav = { yaw: 0, pitch: -0.08, velocity: new THREE.Vector3(), keys: new Set<string>(), dragging: false, moved: false, lastX: 0, lastY: 0, mobileForward: false, zone: "", lastFocus: "" as string | null };
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
          nav.velocity.addScaledVector(direction.set(-Math.sin(nav.yaw), 0, -Math.cos(nav.yaw)), -event.deltaY * 0.0018);
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

        const phaseColors = {
          healthy: { fog: new THREE.Color(0x063845), density: 0.021, wash: new THREE.Color(0xb68d72), blend: 0.03 },
          heat: { fog: new THREE.Color(0x193e42), density: 0.024, wash: new THREE.Color(0xd99a77), blend: 0.28 },
          bleaching: { fog: new THREE.Color(0x385057), density: 0.027, wash: new THREE.Color(0xf0e6d5), blend: 0.84 },
          recovery: { fog: new THREE.Color(0x0a3d3c), density: 0.022, wash: new THREE.Color(0x78a485), blend: 0.13 },
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

          causticTexture.offset.x = (elapsed * 0.012) % 1;
          causticTexture.offset.y = (elapsed * -0.008) % 1;
          particles.position.x = Math.sin(elapsed * 0.04) * 6;
          grass.rotation.z = reduced ? 0 : Math.sin(elapsed * 0.42) * 0.014;
          fishActors.forEach((actor, index) => {
            const t = elapsed * (0.12 + (index % 4) * 0.013) + actor.offset;
            actor.object.position.set(actor.lane + Math.sin(t * 0.7) * 8, 3.4 + (index % 5) * 0.68 + Math.sin(t * 1.4) * 0.35, actor.depth + Math.cos(t * 0.55) * 7);
            actor.object.rotation.y = Math.PI + Math.sin(t * 0.7) * 0.55;
            actor.object.rotation.z = Math.sin(t * 1.5) * 0.025;
          });

          const focused = focusRef.current ? hotspotsRef.current.find((item) => item.id === focusRef.current) : undefined;
          if (focused) {
            desired.set(focused.position[0] + 1.2, focused.position[1] + 2, focused.position[2] + 7.1);
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
            const boost = nav.keys.has("shift") ? 8.2 : 4.4;
            desired.set(0, vertical * 2.4, 0);
            desired.addScaledVector(direction, ((wantsForward ? 1 : 0) - (wantsBack ? 1 : 0)) * boost);
            desired.addScaledVector(right, ((wantsRight ? 1 : 0) - (wantsLeft ? 1 : 0)) * boost * 0.78);
            nav.velocity.lerp(desired, 1 - Math.exp(-delta * 5));
            if (!activeRef.current) nav.velocity.multiplyScalar(Math.exp(-delta * 8));
            camera.position.addScaledVector(nav.velocity, delta);
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
            camera.position.y = THREE.MathUtils.clamp(camera.position.y, WORLD_BOUNDS.yMin, WORLD_BOUNDS.yMax);
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, WORLD_BOUNDS.zMin, WORLD_BOUNDS.zMax);
            camera.rotation.set(nav.pitch + (reduced ? 0 : Math.sin(elapsed * 0.56) * 0.004), nav.yaw, 0);
          }

          const nextZone = camera.position.z > -30 ? ["Current Gate", "14 m"] : camera.position.z > -92 ? ["Turbid Shelf", "18 m"] : ["Archive Garden", "22 m"];
          if (nextZone[0] !== nav.zone) {
            nav.zone = nextZone[0];
            callbacksRef.current.onZoneChange?.(nextZone[0], nextZone[1]);
          }

          const width = host.clientWidth;
          const height = host.clientHeight;
          for (const hotspot of hotspotsRef.current) {
            const marker = markerRefs.current.get(hotspot.id);
            if (!marker) continue;
            spotVector.set(...hotspot.position);
            projected.copy(spotVector).project(camera);
            const distance = camera.position.distanceTo(spotVector);
            const visible = activeRef.current && projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.04 && distance < 68;
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
            if (!isMesh(object)) return;
            object.geometry.dispose();
            disposeMaterial(object.material);
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
  }, [activatedOnce]);

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
