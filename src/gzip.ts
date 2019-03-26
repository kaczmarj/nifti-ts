// Methods to read (/ write) gzipped files.

import * as pako from 'pako';

// Gzip magic constants. these are uint8.
const GZIP_MAGIC_1 = 0x1f;  // 31
const GZIP_MAGIC_2 = 0x8b;  // 139

// Return whether buffer contains gzipped data.
export function isGzipped(buffer: ArrayBuffer): boolean {
  const dv = new DataView(buffer);
  return dv.getUint8(0) === GZIP_MAGIC_1 && dv.getUint8(1) === GZIP_MAGIC_2;
}

// Inflate a gzip-compressed buffer.
export function ungzip(buffer: ArrayBuffer): ArrayBuffer {
  const compressed = new Uint8Array(buffer);
  return pako.ungzip(compressed).buffer;
}

// Deflate a buffer.
export function gzip(buffer: ArrayBuffer): ArrayBuffer {
  const data = new Uint8Array(buffer);
  return pako.gzip(data).buffer;
}
