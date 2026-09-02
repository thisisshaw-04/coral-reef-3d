# Asset provenance and licenses

No Fab/Unreal Marketplace package is redistributed in this repository. Core external media is from public-domain or CC0 sources.

## Smithsonian coral scans and specimen images — CC0 / public domain

The Smithsonian 3D object records mark each item **CC0 / public domain**. Attribution is not required, but provenance is retained. Desktop models are the official 150k/1024 “low” derivatives; mobile models are the official 20k thumbnails. Identification images are the corresponding official medium scene renders.

| Local family | Smithsonian record | Holding unit |
|---|---|---|
| `acropora-hyacinthus*` | [*Madrepora surculosa* specimen](https://3d.si.edu/object/3d/madrepora-surculosa%3Afb975479-5faf-4ab7-aaae-6fad92f7fd55) | National Museum of Natural History, Invertebrate Zoology |
| `acropora-humilis*` | [*Madrepora humilis* specimen](https://3d.si.edu/object/3d/madrepora-humilis%3Ac921c012-5a3e-4e6f-9c24-7dda761115f4) | National Museum of Natural History, Invertebrate Zoology |
| `plesiastraea-armata*` | [*Plesiastraea armata* specimen](https://3d.si.edu/object/3d/plesiastraea-armata%3A0c967ce1-ef2f-420f-8d65-c371b5be3346) | National Museum of Natural History, Invertebrate Zoology |

Rights references: [Smithsonian Open Access](https://www.si.edu/openaccess), [Smithsonian Open Access FAQ](https://www.si.edu/openaccess/faq), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/legalcode), [Smithsonian 3D API](https://3d-api.si.edu/api-docs/).

The app applies restrained illustrative “living” color tints and environmental lighting to dry museum specimens. Those colors are interpretive, not field measurements.

## Barramundi Fish — CC0-1.0

- Source: [Khronos glTF Sample Assets: Barramundi Fish](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/BarramundiFish/README.md)
- Pinned source commit: `2d97dcc2463db123ed5203598cffedf8b6cf1683`
- Provenance: © 2017, Public; Microsoft — Everything
- License: [Creative Commons Zero v1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/legalcode)
- Local derivative: `public/models/barramundi-fish.glb`, optimized in Blender 4.0.2 from 12.49 MB to 1.00 MB by resizing embedded PBR textures from 2048² to 512²; geometry and PBR inputs retained.

## Coral Gravel textures — CC0

- Source: [Poly Haven — Coral Gravel](https://polyhaven.com/a/coral_gravel)
- License: [Poly Haven assets are CC0](https://polyhaven.com/license)
- Local maps: diffuse, normal, and packed ambient-occlusion/roughness/metalness textures in `public/textures/`.

## Draco decoder and Three.js

- Draco decoder binaries in `public/draco/` are copied from the installed Three.js distribution for loading Smithsonian’s compressed GLBs.
- [Three.js](https://github.com/mrdoob/three.js) and its examples are MIT licensed. See their upstream license and the installed package metadata.

## Reef entry image

`public/reef-entry-v4.webp` was created specifically for Reef Relay with OpenAI’s built-in image-generation workflow and is used only as the loading/resilience poster. The interactive reef itself is real-time 3D.

## Prior prototype media

`public/reef-cockpit.webp` and `public/reef-exploration-v2.glb` were produced for earlier Reef Relay iterations and remain only for repository history/backward compatibility; the v4 expedition does not load them.
