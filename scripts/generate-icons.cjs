const sharp = require('C:/Users/hjavi/Documents/source/running/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff8c38" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.22" />
      <stop offset="70%" stop-color="#ea580c" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#09090b" stop-opacity="0" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Dark Background -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="111" fill="none" stroke="#27272a" stroke-width="4" />

  <!-- Inner Ambient Glow -->
  <circle cx="256" cy="256" r="172" fill="url(#innerGlow)" />

  <!-- Outer Iconic Black Mesa Orange Ring -->
  <circle cx="256" cy="256" r="172" fill="none" stroke="url(#orangeGrad)" stroke-width="26" filter="url(#glow)" />

  <!-- Lambda Symbol (λ) in Black Mesa Orange -->
  <text x="256" y="342" font-family="Arial, 'Trebuchet MS', system-ui, sans-serif" font-size="285" font-weight="900" text-anchor="middle" fill="url(#orangeGrad)" filter="url(#glow)">λ</text>
</svg>`;

// Helper to convert PNG buffers into a real multi-resolution Windows/Google .ico file
function pngsToIco(pngBuffers, dimensions) {
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type 1 = icon
  header.writeUInt16LE(numImages, 4);

  let offset = 6 + (16 * numImages);
  const dirEntries = [];

  for (let i = 0; i < numImages; i++) {
    const buf = pngBuffers[i];
    const dim = dimensions[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(dim >= 256 ? 0 : dim, 0); // width
    entry.writeUInt8(dim >= 256 ? 0 : dim, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel (32-bit RGBA)
    entry.writeUInt32LE(buf.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // file offset
    dirEntries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const appDir = path.resolve(process.cwd(), 'src', 'app');
  const svgBuffer = Buffer.from(svgIcon);

  // 1. Guardar icon.svg en public/ y en src/app/
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon.trim());
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgIcon.trim());
  console.log('✓ Guardado icon.svg en public/ y src/app/');

  // 2. Generar icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generado public/icon-512.png');

  // 3. Generar icon-192.png (Múltiplo de 48px según la norma de Google: 48 * 4 = 192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Generado public/icon-192.png');

  // 4. Generar apple-touch-icon.png (180x180 para iOS)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generado public/apple-touch-icon.png');

  // 5. Generar favicon.ico con múltiples capas (16x16, 32x32, 48x48)
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = pngsToIco([png16, png32, png48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generado favicon.ico en public/ y src/app/');

  // 6. Generar public/manifest.json para Google PWA y Chrome
  const manifest = {
    name: 'Radar Black Mesa - Half-Life 3 Tracker',
    short_name: 'Radar Black Mesa',
    description: 'Verificador en tiempo real contra Steam de Half-Life 3',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✓ Generado public/manifest.json');
}

generate().catch(console.error);
