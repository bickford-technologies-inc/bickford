import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Always write relative to this package (not the current working directory).
const OUT_PATH = path.resolve(import.meta.dirname, '..', 'assets', 'icon.png');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

function writePngRGB({ width, height, pixels }) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 3;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0; // filter type 0
    pixels.copy(raw, y * (1 + stride) + 1, y * stride, y * stride + stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, png);
}

function fillRect(pixels, width, height, x0, y0, w, h, rgb) {
  const [r, g, b] = rgb;
  const x1 = Math.max(0, Math.min(width, x0 + w));
  const y1 = Math.max(0, Math.min(height, y0 + h));
  const xs = Math.max(0, x0);
  const ys = Math.max(0, y0);
  for (let y = ys; y < y1; y++) {
    for (let x = xs; x < x1; x++) {
      const i = (y * width + x) * 3;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }
}

function generate() {
  const width = 1024;
  const height = 1024;
  const pixels = Buffer.alloc(width * height * 3);

  // Solid background (Apple-friendly).
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 196; // R
    pixels[i + 1] = 0; // G
    pixels[i + 2] = 0; // B
  }

  // Minimal white "b" glyph using a tiny bitmap scaled up.
  const glyph = [
    '000111111000',
    '000111111000',
    '000111111000',
    '000111111000',
    '000111000000',
    '000111000000',
    '000111000000',
    '000111111000',
    '000111111100',
    '000111000110',
    '000111000110',
    '000111000110',
    '000111111100',
    '000111111000',
  ];

  const scale = 48;
  const gw = glyph[0].length;
  const gh = glyph.length;
  const drawW = gw * scale;
  const drawH = gh * scale;
  const startX = Math.floor((width - drawW) / 2);
  const startY = Math.floor((height - drawH) / 2);

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (glyph[gy][gx] !== '1') continue;
      fillRect(pixels, width, height, startX + gx * scale, startY + gy * scale, scale, scale, [255, 255, 255]);
    }
  }

  writePngRGB({ width, height, pixels });
}

try {
  generate();
  console.log(`icon: generated ${OUT_PATH}`);
} catch (err) {
  console.error('icon: failed to generate icon.png');
  console.error(err);
  process.exitCode = 1;
}
