// Génère les tailles d'icônes PWA à partir de public/logo_PWA_Jommba.png
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/logo_PWA_Jommba.png";
const OUT = "public/icons";

await mkdir(OUT, { recursive: true });

// Icônes "any" : le logo à l'identique, upscalé proprement (Lanczos).
for (const size of [192, 512]) {
  await sharp(SRC)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/icon-${size}.png`);
  console.log(`icon-${size}.png`);
}

// Icônes "maskable" : Android rogne jusqu'à 20 % sur chaque bord. On place le
// logo dans la "safe zone" centrale (80 %) sur fond blanc pour éviter que le
// masque circulaire ne coupe le logo.
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 }, kernel: "lanczos3" })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/icon-maskable-${size}.png`);
  console.log(`icon-maskable-${size}.png`);
}

// Icône Apple touch : iOS n'aime pas la transparence (fond noir sinon).
await sharp(SRC)
  .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 }, kernel: "lanczos3" })
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/apple-touch-icon.png`);
console.log("apple-touch-icon.png");
