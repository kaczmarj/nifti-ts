// Methods to read (/ write) gzipped files.

import * as pako from 'pako';

// gzip magic constants. these are uint8.
const GZIP_MAGIC_1 = 31;  // hex is 1f
const GZIP_MAGIC_2 = 139;  // hex is 8b

// Return true if dataview object is gzipped.
export function isGzipped(buffer: ArrayBuffer): boolean {
  const dv = new DataView(buffer);
  return (dv.getUint8(0) === GZIP_MAGIC_1 && dv.getUint8(1) === GZIP_MAGIC_2)
}

// Inflate a gzip compressed buffer.
export function inflate(buffer: ArrayBuffer): ArrayBuffer {
  // TODO: add error checking
  const compressed = new Uint8Array(buffer);
  const data = pako.inflate(compressed);
  return data.buffer
}
