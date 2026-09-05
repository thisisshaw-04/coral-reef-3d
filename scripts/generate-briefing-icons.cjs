const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const icons = {
  "reef-find-colonies": [
    '<path d="M30 22h-7a9 9 0 0 0-9 9v7M14 58v7a9 9 0 0 0 9 9h7M66 22h7a9 9 0 0 1 9 9v7M82 58v7a9 9 0 0 1-9 9h-7"/>',
    '<circle cx="46" cy="46" r="13"/>',
    '<path d="m56 56 15 15M27 47c7-9 17-14 31-14M30 61c6 4 13 6 22 4"/>',
  ],
  "reef-shape-first": [
    '<path d="M48 15 69 52H27L48 15Z"/>',
    '<rect x="17" y="58" width="23" height="23" rx="5"/>',
    '<circle cx="70" cy="69" r="12"/>',
    '<path d="M25 36c7-6 15-9 25-8M59 29c5 1 10 4 15 8"/>',
  ],
  "reef-evidence-id": [
    '<path d="M47 18c5 0 8-5 13-3s5 8 9 12 10 3 11 9-4 9-4 14 5 9 2 14-9 5-13 9-5 10-11 11-9-4-14-4-9 5-14 2-5-9-9-13-10-5-11-11 4-9 4-14-5-9-2-14 9-5 13-9 5-10 11-11 9 4 15 4Z"/>',
    '<path d="m35 50 9 9 20-23"/>',
    '<path d="M17 20h16M25 12v16"/>',
  ],
  "reef-scan-colony": [
    '<path d="M21 69c9-15 18-20 27-20s18 5 27 20"/>',
    '<path d="M34 53V34m14 15V24m14 29V35"/>',
    '<path d="M22 22h52M28 31h40M18 80h60"/>',
  ],
  "reef-mark-health": [
    '<path d="M18 25 35 18l26 9 17-7v51l-17 7-26-9-17 7V25Z"/>',
    '<path d="M35 18v51m26-42v51"/>',
    '<path d="m38 48 8 8 17-22"/>',
  ],
  "reef-note-observation": [
    '<path d="M48 18c18 0 31 11 31 27S66 73 48 73c-4 0-8-.5-11-2L22 78l5-13c-6-5-10-12-10-20 0-16 13-27 31-27Z"/>',
    '<path d="M33 41h30M33 53h22M56 62c4-4 9-6 15-6"/>',
  ],
  "reef-time-compare": [
    '<circle cx="48" cy="48" r="30"/>',
    '<path d="M48 30v20l14 8M23 78c16-8 34-8 50 0M20 19h12M26 13v12"/>',
  ],
  "reef-bleaching-risk": [
    '<path d="M32 74V48m0 0-11-12m11 12 12-15m-12 15 16 9"/>',
    '<path d="M55 63V28a9 9 0 0 1 18 0v35a18 18 0 1 1-18 0Z"/>',
    '<path d="M64 36v31M25 74h47"/>',
  ],
  "reef-restore-caution": [
    '<path d="M48 72V43"/>',
    '<path d="M48 47c-14 0-22-8-24-22 14 0 23 8 24 22ZM49 56c13-1 21-8 23-21-13 0-22 8-23 21Z"/>',
    '<path d="M26 76h44M19 42c3-15 15-26 29-26s26 11 29 26m-7-1 8 1 1-8"/>',
  ],
};

const iconDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(iconDir, { recursive: true });

const makeSvg = (parts) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="18" x2="78" y1="14" y2="82" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff"/>
      <stop offset="0.56" stop-color="#f4fdff"/>
      <stop offset="1" stop-color="#baffef"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#g)" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round">
    ${parts.join("\n    ")}
  </g>
</svg>`;

(async () => {
  await Promise.all(
    Object.entries(icons).map(([name, parts]) =>
      sharp(Buffer.from(makeSvg(parts)))
        .resize(192, 192, { fit: "contain" })
        .png({ compressionLevel: 9 })
        .toFile(path.join(iconDir, `${name}.png`)),
    ),
  );
})();
