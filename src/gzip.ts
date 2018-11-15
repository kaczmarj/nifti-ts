// Methods to read (/ write) gzipped files.

import * as pako from 'pako';

// Gzip magic constants. these are uint8.
const GZIP_MAGIC_1 = 31; // hex is 1f
const GZIP_MAGIC_2 = 139; // hex is 8b

// Return whether buffer contains gzipped data.
export function isGzipped(buffer: ArrayBuffer): boolean {
  const dv = new DataView(buffer);
  return dv.getUint8(0) === GZIP_MAGIC_1 && dv.getUint8(1) === GZIP_MAGIC_2;
}

// Inflate a gzip compressed buffer.
export function inflate(buffer: ArrayBuffer): ArrayBuffer {
  const compressed = new Uint8Array(buffer);
  return pako.inflate(compressed).buffer as ArrayBuffer;
}

export function deflate(buffer: ArrayBuffer): ArrayBuffer {
  const data = new Uint8Array(buffer);
  return pako.deflate(data).buffer as ArrayBuffer;
}
