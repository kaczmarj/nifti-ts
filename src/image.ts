// Image routines.

import {Header, HeaderError} from './header';
import {EightNumbers, FourNumbers, ImageInterface, Matrix44, XFormCode,} from './types';
import {TypedArray, valueToTypedArray} from './types';

function readData(header: Header, buffer: ArrayBuffer): TypedArray {
  const length: number =
      header.dim.slice(1, header.dim[0] + 1).reduce((a, b) => a * b);
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
  public static fromBuffer(buffer: ArrayBuffer): Image {
    const header = Header.fromBuffer(buffer);
    const data = readData(header, buffer);
    const affine = header.getBestAffine();
    return new this(data, affine, header);
  }

  public static fromTypedArray(
      data: TypedArray,
      affine: Matrix44,
      shape: number[],
      ): Image {
    const datatype = getNiftiDataType(data);
    const nDim = shape.reduce((acc, curr) => acc + (curr > 1 ? 1 : 0), 0);
    if (nDim > 7) {
      throw new HeaderError(
          'Number of dimensions must be <= 7 but got ' + nDim + '.',
      );
    }
    shape.length = 7;  // this initializes new values to 0.
    const dim = [nDim, ...shape] as EightNumbers;
    // TODO(kaczmarj): fix this. pixdim[0] should be qfac
    const pixdim = [1, 1, 1, 1, 1, 1, 1, 1] as EightNumbers;

    const header = new Header(
        348,  // sizeOfHdr
        0,    // dimInfo
        dim,
        undefined,  // intentP1
        undefined,  // intentP2
        undefined,  // intentP3
        undefined,  // intentCode
        datatype,
        data.BYTES_PER_ELEMENT * 8,  // bitpix
        0,                           // sliceStart
        pixdim,
        352,  // voxOffset  QUESTION(kaczmarj): how should we set this?
        1,    // slope
        0,    // intercept,
        0,    // sliceEnd
        0,    // sliceCode
        0,    // xyztUnits
        0,    // calMin
        0,    // calMax
        0,    // sliceDuration
        0,    // toffset
        0,    // glmax
        0,    // glmax
        '',   // descrip
        '',   // auxFile
        XFormCode.UNKNOWN,                     // qformCode
        XFormCode.ALIGNEDANAT,                 // sformCode
        0,                                     // quaternB
        0,                                     // quaternB
        0,                                     // quaternC
        0,                                     // qoffsetX
        0,                                     // qoffsetY
        0,                                     // qoffsetZ
        affine[0].slice(0, 4) as FourNumbers,  // srowX
        affine[1].slice(0, 4) as FourNumbers,  // srowY
        affine[2].slice(0, 4) as FourNumbers,  // srowZ
        '',                                    // intentName
        'n+1\0',                               // magic
        true,                                  // littleEndian
    );
    return new this(data, affine, header);
  }

  constructor(
      public data: TypedArray,
      public affine: Matrix44,
      public header: Header,
  ) {}

  public toBuffer(): ArrayBuffer {
    // TODO(kaczmarj): voxOffset should be set dynamically here probably.
    // We should most likely get the offset given the header and extensions.
    const buffer = new ArrayBuffer(
        this.header.voxOffset +
            (this.data.buffer.byteLength - this.data.byteOffset),
    );
    const tmp = new Uint8Array(buffer.byteLength);
    tmp.set(new Uint8Array(this.header.toBuffer()), 0);
    tmp.set(
        new Uint8Array(this.data.buffer).slice(this.data.byteOffset),
        this.header.voxOffset,
    );
    return tmp.buffer as ArrayBuffer;
  }
}
