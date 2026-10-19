// Extracts the largest embedded JPEG preview from a RAW file (Sony ARW and other TIFF-based RAW formats).
// Usage: node scripts/extract-raw-preview.mjs "input.ARW" "output.jpg"
import { readFileSync, writeFileSync } from 'node:fs';

const [input, output] = process.argv.slice(2);
if (!input || !output) { console.error('Usage: node extract-raw-preview.mjs <input.ARW> <output.jpg>'); process.exit(1); }
const buf = readFileSync(input);

/** Walks JPEG segments from an SOI at `start` and returns { end, width, height } or null if it is not a whole JPEG. */
function measureJpeg(start) {
  let p = start + 2;
  let width = 0, height = 0;
  while (p + 4 <= buf.length) {
    if (buf[p] !== 0xff) return null;
    const marker = buf[p + 1];
    if (marker === 0xd9) return width ? { end: p + 2, width, height } : null;
    if (marker === 0xff) { p++; continue; }
    const len = buf.readUInt16BE(p + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      height = buf.readUInt16BE(p + 5);
      width = buf.readUInt16BE(p + 7);
    }
    p += 2 + len;
    if (marker === 0xda) { // entropy-coded data: scan to the next real marker
      while (p + 1 < buf.length) {
        if (buf[p] === 0xff && buf[p + 1] !== 0x00 && !(buf[p + 1] >= 0xd0 && buf[p + 1] <= 0xd7)) break;
        p++;
      }
    }
  }
  return null;
}

let best = null;
for (let i = 0; i + 3 < buf.length; i++) {
  if (buf[i] === 0xff && buf[i + 1] === 0xd8 && buf[i + 2] === 0xff) {
    const m = measureJpeg(i);
    if (m && (!best || m.width * m.height > best.width * best.height)) best = { start: i, ...m };
  }
}
if (!best) { console.error('No embedded JPEG preview found.'); process.exit(2); }
writeFileSync(output, buf.subarray(best.start, best.end));
console.log(`Wrote ${output}: ${best.width}x${best.height}, ${Math.round((best.end - best.start) / 1024)} KB`);
