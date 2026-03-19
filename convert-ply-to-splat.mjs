/**
 * Convert a 3DGS PLY file to the .splat binary format expected by @react-three/drei <Splat>.
 *
 * .splat layout per vertex (32 bytes):
 *   3 × float32  position  (12 B)
 *   3 × float32  scale     (12 B)
 *   4 × uint8    RGBA      ( 4 B)
 *   4 × uint8    quaternion( 4 B)
 */
import { readFileSync, writeFileSync } from 'fs';

const SH_C0 = 0.28209479177387814;

const src = process.argv[2];
const dst = process.argv[3] || src.replace(/\.ply$/i, '.splat');

console.log(`Reading ${src} …`);
const buf = readFileSync(src);

// ── Parse PLY header ───────────────────────────────────────────────
const headerEnd = buf.indexOf('end_header\n');
if (headerEnd === -1) throw new Error('Could not find end_header');
const headerStr = buf.subarray(0, headerEnd).toString('ascii');
const dataStart = headerEnd + 'end_header\n'.length;

const vertexMatch = headerStr.match(/element vertex (\d+)/);
if (!vertexMatch) throw new Error('No vertex count');
const numVertices = parseInt(vertexMatch[1], 10);
console.log(`Vertices: ${numVertices}`);

// Build property list in order
const props = [];
for (const line of headerStr.split('\n')) {
  const m = line.match(/^property\s+(\w+)\s+(\w+)$/);
  if (m) props.push({ type: m[1], name: m[2] });
}

// Byte size per property type
const typeSize = { float: 4, double: 8, uchar: 1, int: 4, uint: 4, short: 2, ushort: 2 };
const rowBytes = props.reduce((s, p) => s + (typeSize[p.type] || 4), 0);

// Build offset map
const offsets = {};
let off = 0;
for (const p of props) {
  offsets[p.name] = off;
  off += typeSize[p.type] || 4;
}

console.log(`Row size: ${rowBytes} bytes, data starts at byte ${dataStart}`);

// ── Allocate output ────────────────────────────────────────────────
const outBuf = Buffer.alloc(numVertices * 32);
const dv = new DataView(buf.buffer, buf.byteOffset + dataStart, numVertices * rowBytes);

function readF(vertex, name) {
  return dv.getFloat32(vertex * rowBytes + offsets[name], true);
}

for (let i = 0; i < numVertices; i++) {
  const base = i * 32;

  // Position
  outBuf.writeFloatLE(readF(i, 'x'), base);
  outBuf.writeFloatLE(readF(i, 'y'), base + 4);
  outBuf.writeFloatLE(readF(i, 'z'), base + 8);

  // Scale (exp of log-scale stored in PLY)
  outBuf.writeFloatLE(Math.exp(readF(i, 'scale_0')), base + 12);
  outBuf.writeFloatLE(Math.exp(readF(i, 'scale_1')), base + 16);
  outBuf.writeFloatLE(Math.exp(readF(i, 'scale_2')), base + 20);

  // Color from DC spherical harmonics
  const r = Math.max(0, Math.min(255, Math.round((0.5 + SH_C0 * readF(i, 'f_dc_0')) * 255)));
  const g = Math.max(0, Math.min(255, Math.round((0.5 + SH_C0 * readF(i, 'f_dc_1')) * 255)));
  const b = Math.max(0, Math.min(255, Math.round((0.5 + SH_C0 * readF(i, 'f_dc_2')) * 255)));
  const a = Math.max(0, Math.min(255, Math.round((1 / (1 + Math.exp(-readF(i, 'opacity')))) * 255)));
  outBuf[base + 24] = r;
  outBuf[base + 25] = g;
  outBuf[base + 26] = b;
  outBuf[base + 27] = a;

  // Quaternion: normalize then map [-1,1] → [0,255]
  let q0 = readF(i, 'rot_0');
  let q1 = readF(i, 'rot_1');
  let q2 = readF(i, 'rot_2');
  let q3 = readF(i, 'rot_3');
  const qlen = Math.sqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
  if (qlen > 0) { q0 /= qlen; q1 /= qlen; q2 /= qlen; q3 /= qlen; }
  outBuf[base + 28] = Math.round((q0 * 128) + 128);
  outBuf[base + 29] = Math.round((q1 * 128) + 128);
  outBuf[base + 30] = Math.round((q2 * 128) + 128);
  outBuf[base + 31] = Math.round((q3 * 128) + 128);

  if (i % 500000 === 0) console.log(`  ${i} / ${numVertices}`);
}

console.log(`Writing ${dst} …`);
writeFileSync(dst, outBuf);
console.log(`Done. Output: ${(outBuf.length / 1024 / 1024).toFixed(1)} MB`);
