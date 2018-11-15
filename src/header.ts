// Header routines.
//
// Orientation: +x=Right, +y=Anterior, +z=Superior

import { isGzipped, inflate } from './gzip';
import { HeaderInterface, Matrix44, XFormCode } from './types';
import { fillPositive, quaternionToRotationMatrix } from './quaternion';

// QUESTION(kaczmarj): is this implementation appropriate?
// interface HeaderError extends Error {}

// interface HeaderErrorConstructor {
//   new (message?: string): Header;
//   (message?: string): HeaderError;
//   readonly prototype: HeaderError;
// }

class HeaderError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HeaderError.prototype);
  }
}

// declare const HeaderError: HeaderErrorConstructor;

export class Header implements HeaderInterface {
  constructor(
    public sizeOfHdr: number,
    public dimInfo: number, // int8, MRI slice ordering, 39
    public dim: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number
    ], // int16[8], data array dimensions, 40
    public intentP1: number, // float32, 1st intent parameter, 56
    public intentP2: number, // float32, 2nd intent parameter, 60
    public intentP3: number, // float32, 3rd intent parameter, 64
    public intentCode: number, // int16,  NIFTIINTENT code, 68
    public datatype: number, // int16, defines data type, 70
    public bitpix: number, // int16, number bits/voxel, 72
    public sliceStart: number, // int16, first slice index, 74
    public pixdim: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number
    ], // float32[8], grid spacings, 76
    public voxOffset: number, // float32, offset into .nii file, 108
    public sclSlope: number, // float32, data scaling: slope, 112
    public sclInter: number, // float32, data scaling: offset, 116
    public sliceEnd: number, // int16, last slice index, 120
    public sliceCode: number, // int8, slice timing order, 122
    public xyztUnits: number, // int8, units of pixdim[1..4], 123
    public calMax: number, // float32, max display intensity, 124
    public calMin: number, // float32, min display intensity, 128
    public sliceDuration: number, // float32, time for one slice, 132
    public toffset: number, // float32, time axis shift, 136
    public glmax: number, // int32, unused, 140
    public glmin: number, // int32, unused, 144
    public descrip: string, // int8[80], any text you like, 148
    public auxFile: string, // int8[24], auxiliary filename, 228
    public qformCode: XFormCode, // int16, NIFTIXFORM code, 252
    public sformCode: XFormCode, // int16, NIFTIXFORM code, 254
    public quaternB: number, // float32, quaternion b param, 256
    public quaternC: number, // float32, quaternion c param, 260
    public quaternD: number, // float32, quaternion d param, 264
    public qoffsetX: number, // float32, quaternion x shift, 268
    public qoffsetY: number, // float32, quaternion y shift, 272
    public qoffsetZ: number, // float32, quaternion z shift, 276
    public srowX: [number, number, number, number], // float32[4], 1st row affine transform, 280
    public srowY: [number, number, number, number], // float32[4], 2nd row affine transform, 296
    public srowZ: [number, number, number, number], // float32[4], 3rd row affine transform, 312
    public intentName: string, // int8[16], name or meaning of data, 328
    public magic: string, // int8[4], MUST be "ni1\0" or "n+1\0", 344
    public littleEndian: boolean,
  ) {
    this.validate();
  }

  static fromBuffer(buffer: ArrayBuffer) {
    if (isGzipped(buffer)) {
      buffer = inflate(buffer);
    }
    const data = new DataView(buffer);

    // get endianness by checking header.dim[0]
    let littleEndian = true;
    const dim0 = data.getInt16(40, littleEndian);
    if (dim0 <= 0 || dim0 > 7) {
      littleEndian = false;
    }

    // go through header and set values to appropriate keys
    const sizeOfHdr = data.getInt32(0, littleEndian);
    if (sizeOfHdr !== 348) {
      throw Error('sizeOfHdr must be 348 but is not');
    }

    const dimInfo = data.getInt8(39);
    const dim = [
      data.getInt16(40, littleEndian),
      data.getInt16(42, littleEndian),
      data.getInt16(44, littleEndian),
      data.getInt16(46, littleEndian),
      data.getInt16(48, littleEndian),
      data.getInt16(50, littleEndian),
      data.getInt16(52, littleEndian),
      data.getInt16(54, littleEndian),
    ] as [number, number, number, number, number, number, number, number];

    const intentP1 = data.getFloat32(56, littleEndian);
    const intentP2 = data.getFloat32(60, littleEndian);
    const intentP3 = data.getFloat32(64, littleEndian);

    const intentCode = data.getInt16(68, littleEndian);
    const datatype = data.getInt16(70, littleEndian);
    const bitpix = data.getInt16(72, littleEndian);
    const sliceStart = data.getInt16(74, littleEndian);
    const pixdim = [
      data.getFloat32(76, littleEndian),
      data.getFloat32(80, littleEndian),
      data.getFloat32(84, littleEndian),
      data.getFloat32(88, littleEndian),
      data.getFloat32(92, littleEndian),
      data.getFloat32(96, littleEndian),
      data.getFloat32(100, littleEndian),
      data.getFloat32(104, littleEndian),
    ] as [number, number, number, number, number, number, number, number];
    const voxOffset = data.getFloat32(108, littleEndian);
    const sclSlope = data.getFloat32(112, littleEndian);
    const sclInter = data.getFloat32(116, littleEndian);
    const sliceEnd = data.getInt16(120, littleEndian);
    const sliceCode = data.getInt8(122);
    const xyztUnits = data.getInt8(123);
    const calMax = data.getFloat32(124, littleEndian);
    const calMin = data.getFloat32(128, littleEndian);
    const sliceDuration = data.getFloat32(132, littleEndian);
    const toffset = data.getFloat32(136, littleEndian);
    const glmax = data.getInt32(140, littleEndian);
    const glmin = data.getInt32(144, littleEndian);

    // convert descrip[80] to string
    let d = '';
    let j: number;
    d = '';
    for (j = 148; j < 228; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    const descrip = d;

    d = '';
    for (j = 228; j < 252; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    const auxFile = d;

    const qformCode = data.getInt16(252, littleEndian);
    const sformCode = data.getInt16(254, littleEndian);

    const quaternB = data.getFloat32(256, littleEndian);
    const quaternC = data.getFloat32(260, littleEndian);
    const quaternD = data.getFloat32(264, littleEndian);
    const qoffsetX = data.getFloat32(268, littleEndian);
    const qoffsetY = data.getFloat32(272, littleEndian);
    const qoffsetZ = data.getFloat32(276, littleEndian);

    const srowX = [
      data.getFloat32(280, littleEndian),
      data.getFloat32(284, littleEndian),
      data.getFloat32(288, littleEndian),
      data.getFloat32(292, littleEndian),
    ] as [number, number, number, number];
    const srowY = [
      data.getFloat32(296, littleEndian),
      data.getFloat32(300, littleEndian),
      data.getFloat32(304, littleEndian),
      data.getFloat32(308, littleEndian),
    ] as [number, number, number, number];
    const srowZ = [
      data.getFloat32(312, littleEndian),
      data.getFloat32(316, littleEndian),
      data.getFloat32(320, littleEndian),
      data.getFloat32(324, littleEndian),
    ] as [number, number, number, number];

    d = '';
    for (j = 328; j < 344; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    const intentName = d;

    d = '';
    for (j = 344; j < 348; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    const magic = d;

    return new this(
      sizeOfHdr,
      dimInfo,
      dim,
      intentP1,
      intentP2,
      intentP3,
      intentCode,
      datatype,
      bitpix,
      sliceStart,
      pixdim,
      voxOffset,
      sclSlope,
      sclInter,
      sliceEnd,
      sliceCode,
      xyztUnits,
      calMax,
      calMin,
      sliceDuration,
      toffset,
      glmax,
      glmin,
      descrip,
      auxFile,
      qformCode,
      sformCode,
      quaternB,
      quaternC,
      quaternD,
      qoffsetX,
      qoffsetY,
      qoffsetZ,
      srowX,
      srowY,
      srowZ,
      intentName,
      magic,
      littleEndian,
    );
  }

  getQform(): Matrix44 {
    const quaternion = fillPositive([
      this.quaternB,
      this.quaternC,
      this.quaternD,
    ]);
    const R = quaternionToRotationMatrix(quaternion);

    const vox = this.pixdim.slice(1, 4);
    const qfac = this.pixdim[0];
    if (qfac !== -1 && qfac !== 1) {
      throw Error('qfac must be -1 or 1.');
    }

    vox[2] *= qfac;
    // diagonal(vox)
    const S = [[vox[0], 0, 0], [0, vox[1], 0], [0, 0, vox[2]]];

    // matmul(R, S)
    const M = [
      [
        R[0][0] * S[0][0] + R[0][1] * S[1][0] + R[0][2] * S[2][0],
        R[0][0] * S[0][1] + R[0][1] * S[1][1] + R[0][2] * S[2][1],
        R[0][0] * S[0][2] + R[0][1] * S[1][2] + R[0][2] * S[2][2],
      ],
      [
        R[1][0] * S[0][0] + R[1][1] * S[1][0] + R[1][2] * S[2][0],
        R[1][0] * S[0][1] + R[1][1] * S[1][1] + R[1][2] * S[2][1],
        R[1][0] * S[0][2] + R[1][1] * S[1][2] + R[1][2] * S[2][2],
      ],
      [
        R[2][0] * S[0][0] + R[2][1] * S[1][0] + R[2][2] * S[2][0],
        R[2][0] * S[0][1] + R[2][1] * S[1][1] + R[2][2] * S[2][1],
        R[2][0] * S[0][2] + R[2][1] * S[1][2] + R[2][2] * S[2][2],
      ],
    ];

    return [
      [M[0][0], M[0][1], M[0][2], this.qoffsetX],
      [M[1][0], M[1][1], M[1][2], this.qoffsetY],
      [M[2][0], M[2][1], M[2][2], this.qoffsetZ],
      [0, 0, 0, 1],
    ];
  }

  getSform(): Matrix44 {
    return [
      [this.srowX[0], this.srowX[1], this.srowX[2], this.srowX[3]],
      [this.srowY[0], this.srowY[1], this.srowY[2], this.srowY[3]],
      [this.srowZ[0], this.srowZ[1], this.srowZ[2], this.srowZ[3]],
      [0, 0, 0, 1],
    ];
  }

  getBestAffine(): Matrix44 {
    // This is different from nibabel's implementation in that we prefer the quaternion-based approach.
    if (this.qformCode > 0) {
      return this.getQform();
    } else if (this.sformCode > 0) {
      return this.getSform();
    } else {
      throw new HeaderError(
        'Both qformCode and sformCode are 0. Affine cannot be computed.',
      );
    }
  }

  // Return ArrayBuffer representation of the header object. This can be used for writing a file.
  toBuffer(): ArrayBuffer {
    const buffer = new ArrayBuffer(352);
    const view = new DataView(buffer);

    view.setInt32(0, this.sizeOfHdr, this.littleEndian);
    view.setInt8(39, this.dimInfo);
    view.setInt16(40, this.dim[0], this.littleEndian);
    view.setInt16(42, this.dim[1], this.littleEndian);
    view.setInt16(44, this.dim[2], this.littleEndian);
    view.setInt16(46, this.dim[3], this.littleEndian);
    view.setInt16(48, this.dim[4], this.littleEndian);
    view.setInt16(50, this.dim[5], this.littleEndian);
    view.setInt16(52, this.dim[6], this.littleEndian);
    view.setInt16(54, this.dim[7], this.littleEndian);

    view.setFloat32(56, this.intentP1, this.littleEndian);
    view.setFloat32(60, this.intentP2, this.littleEndian);
    view.setFloat32(64, this.intentP3, this.littleEndian);

    view.setInt16(68, this.intentCode, this.littleEndian);
    view.setInt16(70, this.datatype, this.littleEndian);
    view.setInt16(72, this.bitpix, this.littleEndian);
    view.setInt16(74, this.sliceStart, this.littleEndian);
    view.setFloat32(76, this.pixdim[0], this.littleEndian);
    view.setFloat32(80, this.pixdim[1], this.littleEndian);
    view.setFloat32(84, this.pixdim[2], this.littleEndian);
    view.setFloat32(88, this.pixdim[3], this.littleEndian);
    view.setFloat32(92, this.pixdim[4], this.littleEndian);
    view.setFloat32(96, this.pixdim[5], this.littleEndian);
    view.setFloat32(100, this.pixdim[6], this.littleEndian);
    view.setFloat32(104, this.pixdim[7], this.littleEndian);
    view.setFloat32(108, this.voxOffset, this.littleEndian);
    view.setFloat32(112, this.sclSlope, this.littleEndian);
    view.setFloat32(116, this.sclInter, this.littleEndian);
    view.setInt16(120, this.sliceEnd, this.littleEndian);
    view.setInt8(122, this.sliceCode);
    view.setInt8(123, this.xyztUnits);
    view.setFloat32(124, this.calMax, this.littleEndian);
    view.setFloat32(128, this.calMin, this.littleEndian);
    view.setFloat32(132, this.sliceDuration, this.littleEndian);
    view.setFloat32(136, this.toffset, this.littleEndian);
    view.setInt32(140, this.glmax, this.littleEndian);
    view.setInt32(144, this.glmin, this.littleEndian);

    // The values of the buffer are initialized to 0, so we only have to set the non-zero values.
    for (let j = 0; j < this.descrip.length; j++) {
      view.setInt8(148 + j, this.descrip.charCodeAt(j));
    }

    for (let j = 0; j < this.auxFile.length; j++) {
      view.setInt8(228 + j, this.auxFile.charCodeAt(j));
    }

    view.setInt16(252, this.qformCode, this.littleEndian);
    view.setInt16(254, this.sformCode, this.littleEndian);

    view.setFloat32(256, this.quaternB, this.littleEndian);
    view.setFloat32(260, this.quaternC, this.littleEndian);
    view.setFloat32(264, this.quaternD, this.littleEndian);
    view.setFloat32(268, this.qoffsetX, this.littleEndian);
    view.setFloat32(272, this.qoffsetY, this.littleEndian);
    view.setFloat32(276, this.qoffsetZ, this.littleEndian);

    view.setFloat32(280, this.srowX[0], this.littleEndian);
    view.setFloat32(284, this.srowX[1], this.littleEndian);
    view.setFloat32(288, this.srowX[2], this.littleEndian);
    view.setFloat32(292, this.srowX[3], this.littleEndian);
    view.setFloat32(296, this.srowY[0], this.littleEndian);
    view.setFloat32(300, this.srowY[1], this.littleEndian);
    view.setFloat32(304, this.srowY[2], this.littleEndian);
    view.setFloat32(308, this.srowY[3], this.littleEndian);
    view.setFloat32(312, this.srowZ[0], this.littleEndian);
    view.setFloat32(316, this.srowZ[1], this.littleEndian);
    view.setFloat32(320, this.srowZ[2], this.littleEndian);
    view.setFloat32(324, this.srowZ[3], this.littleEndian);

    for (let j = 0; j < this.intentName.length; j++) {
      view.setInt8(328 + j, this.intentName.charCodeAt(j));
    }

    for (let j = 0; j < this.magic.length; j++) {
      view.setInt8(344 + j, this.magic.charCodeAt(j));
    }

    return buffer;
  }

  validate(): void {
    // Validate magic.
    if (this.magic != 'ni1\0' && this.magic != 'n+1\0') {
      throw new HeaderError(
        'Magic value must be "ni1\0" or "n+1\0" but got "' + this.magic + '".',
      );
    }

    // Validate sizeOfHdr.
    if (this.sizeOfHdr !== 348) {
      throw new HeaderError(
        'sizeOfHdr must be 348 but got ' + this.sizeOfHdr + '.',
      );
    }

    // Validate dim0 is in range [1, 7]..
    if (this.dim[0] < 1 || this.dim[0] > 7) {
      throw new HeaderError(
        'dim[0] value must in range [1, 7] but got ' + this.dim[0] + '.',
      );
    }

    // Validate qformCode
    const validQformCodes = [0, 1];
    if (!validQformCodes.includes(this.qformCode)) {
      console.warn(
        'Value of qformCode must be 0 or 1 but got ' + this.qformCode + '.',
      );
    }

    // Validate sformCode
    const validSformCodes = [0, 2, 3, 4];
    if (!validSformCodes.includes(this.sformCode)) {
      console.warn(
        'Value of sformCode must be 0, 2, 3, or 4 but got ' +
          this.qformCode +
          '.',
      );
    }

    // Validate voxOffset is greater than sizeOfHdr.
    if (this.voxOffset < this.sizeOfHdr) {
      throw new HeaderError(
        'Value of voxOffset must be greater than or equal to sizeOfHdr but got ' +
          this.voxOffset +
          '.',
      );
    }

    // Validate length of descip is at most 80.
    if (this.descrip.length > 80) {
      throw new HeaderError(
        'Length of descrip can be at most 80 but got ' +
          this.descrip.length +
          '.',
      );
    }

    // Validate length of auxFile is at most 24.
    if (this.auxFile.length > 24) {
      throw new HeaderError(
        'Length of intentName can be at most 24 but got ' +
          this.auxFile.length +
          '.',
      );
    }

    // Validate length of intentName is at most 16.
    if (this.intentName.length > 16) {
      throw new HeaderError(
        'Length of intentName can be at most 16 but got ' +
          this.intentName.length +
          '.',
      );
    }
  }
}
