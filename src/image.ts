// Image routines.

import * as gzip from './gzip';
import { ImageInterface, Matrix44 } from './types';
import { Header } from './header';
import { TypedArray, valueToTypedArray } from './types';

function readData(header: Header, buffer: ArrayBuffer): TypedArray {
  const length: number = header.dim
    .slice(1, header.dim[0] + 1)
    .reduce((a, b) => a * b);
  const arrayConstructor = valueToTypedArray[header.datatype];
  return new arrayConstructor(buffer, header.voxOffset, length);
}

function getNiftiDataType(array: TypedArray): number {
  if (array instanceof Uint16Array) {
    return 2;
  } else if (array instanceof Int16Array) {
    return 4;
  } else if (array instanceof Int32Array) {
    return 8;
  } else if (array instanceof Float32Array) {
    return 16;
  } else if (array instanceof Float64Array) {
    return 64;
  } else if (array instanceof Int8Array) {
    return 256;
  } else if (array instanceof Uint16Array) {
    return 512;
  } else if (array instanceof Uint32Array) {
    return 768;
  } else {
    throw Error('Unknown TypedArray type.');
  }
}

export class Image implements ImageInterface {
  constructor(
    public header: Header,
    public data: TypedArray,
    public affine: Matrix44,
  ) {}

  static fromBuffer(buffer: ArrayBuffer) {
    // if (gzip.isGzipped(buffer)) {
    //   buffer = gzip.inflate(buffer);
    // }
    const header = Header.fromBuffer(buffer);
    const data = readData(header, buffer);
    const affine = header.getBestAffine();
    return new this(header, data, affine);
  }

  toBuffer(): ArrayBuffer {
    // TODO(kaczmarj): voxOffset should be set dynamically here probably.
    // We should most likely get the offset given the header and extensions.
    const buffer = new ArrayBuffer(
      this.header.voxOffset + this.data.buffer.byteLength,
    );
    const tmp = new Uint8Array(buffer.byteLength);
    tmp.set(new Uint8Array(this.header.toBuffer()), 0);
    tmp.set(new Uint8Array(this.data.buffer), this.header.voxOffset);
    return tmp.buffer as ArrayBuffer;
  }
}
