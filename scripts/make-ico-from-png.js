const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'assets', 'silvertech_logo.png');
const out = path.join(__dirname, '..', 'assets', 'silvertech_logo.ico');

if (!fs.existsSync(src)) {
  console.error('Source PNG not found:', src);
  process.exit(2);
}

const png = fs.readFileSync(src);

// PNG IHDR chunk contains width/height at fixed offsets
// Signature(8) + length(4) + 'IHDR'(4) -> IHDR data starts at offset 16
if (png.length < 24) {
  console.error('PNG too small');
  process.exit(2);
}

const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

const wByte = width >= 256 ? 0 : width;
const hByte = height >= 256 ? 0 : height;

// ICONDIR: Reserved(2) Type(2) Count(2)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0); // reserved
iconDir.writeUInt16LE(1, 2); // type = 1 (icon)
iconDir.writeUInt16LE(1, 4); // count = 1

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(wByte, 0); // width
entry.writeUInt8(hByte, 1); // height
entry.writeUInt8(0, 2); // color count
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bit count (use 32 for PNG with alpha)
entry.writeUInt32LE(png.length, 8); // size of image data
const headerSize = iconDir.length + entry.length;
entry.writeUInt32LE(headerSize, 12); // offset of image data

const outBuf = Buffer.concat([iconDir, entry, png]);

fs.writeFileSync(out, outBuf);
console.log('Wrote ICO:', out);
