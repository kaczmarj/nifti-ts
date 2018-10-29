// Header routines.

import { HeaderInterface, XFormCode } from "./types";

export class Header implements HeaderInterface {

  public sizeOfHdr: number; // int32, must be 348, 0
  public dataType: string;  // int8[10], unused, 4
  public dbName: string; // int8[18], unused, 14
  public extents: number; // int32, unused, 32
  public sessionError: number; // int16, unused, 36
  public regular: number;  // int8, unused, 38
  public dimInfo: number;  // int8, MRI slice ordering, 39

  public dim: [number, number, number, number, number, number, number, number];  // int16[8], data array dimensions, 40
  public intentP1: number;  // float32, 1st intent parameter, 56
  public intentP2: number;  // float32, 2nd intent parameter, 60
  public intentP3: number;  // float32, 3rd intent parameter, 64

  public intentCode: number;  // int16,  NIFTIINTENT code, 68
  public datatype: number; // int16, defines data type, 70
  public bitpix: number;  // int16, number bits/voxel, 72
  public sliceStart: number; // int16, first slice index, 74
  public pixdim: [number, number, number, number, number, number, number, number];  // float32[8], grid spacings, 76
  public voxOffset: number;  // float32, offset into .nii file, 108
  public sclSlope: number; // float32, data scaling: slope, 112
  public sclInter: number;  // float32, data scaling: offset, 116
  public sliceEnd: number;  // int16, last slice index, 120
  public sliceCode: number;  // int8, slice timing order, 122
  public xyztUnits: number; // int8, units of pixdim[1..4], 123
  public calMax: number; // float32, max display intensity, 124
  public calMin: number;  // float32, min display intensity, 128
  public sliceDuration: number; // float32, time for one slice, 132
  public toffset: number; // float32, time axis shift, 136
  public glmax: number; // int32, unused, 140
  public glmin: number; // int32, unused, 144

  public descrip: string; // int8[80], any text you like, 148
  public auxFile: string;  // int8[24], auxiliary filename, 228

  public qformCode: XFormCode;  // int16, NIFTIXFORM code, 252
  public sformCode: XFormCode;  // int16, NIFTIXFORM code, 254

  public quaternB: number;  // float32, quaternion b param, 256
  public quaternC: number;  // float32, quaternion c param, 260
  public quaternD: number;  // float32, quaternion d param, 264
  public qoffsetX: number;  // float32, quaternion x shift, 268
  public qoffsetY: number;  // float32, quaternion y shift, 272
  public qoffsetZ: number;  // float32, quaternion z shift, 276

  public srowX: [number, number, number, number];  // float32[4], 1st row affine transform, 280
  public srowY: [number, number, number, number];  // float32[4], 2nd row affine transform, 296
  public srowZ: [number, number, number, number];  // float32[4], 3rd row affine transform, 312

  public intentName: string;  // int8, name or meaning of data, 328
  public magic: string;  // int8, MUSTbe "ni1\0" or "n+1\0", 344

  public littleEndian: boolean;

  constructor(buffer: ArrayBuffer) {

    const data = new DataView(buffer);

    // get endianness by checking header.dim[0]
    this.littleEndian = true;
    let littleEndian = this.littleEndian;  // TODO: translate all to this.littleEndian

    const dim0 = data.getInt16(40, littleEndian);
    if (dim0 <= 0 || dim0 > 7) {
      littleEndian = false;
    }

    // go through header and set values to appropriate keys
    this.sizeOfHdr = data.getInt32(0, littleEndian);
    if (this.sizeOfHdr !== 348) {
      throw Error("sizeOfHdr must be 348 but is not");
    }

    // convert dataType[10] to string
    let d = "";
    let j: number;
    for (j = 4; j < 14; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.dataType = d;

    // convert dbName[18] to string
    d = "";
    for (j = 14; j < 32; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.dbName = d;
    this.extents = data.getInt32(32, littleEndian);
    this.sessionError = data.getInt16(36, littleEndian);
    this.regular = data.getInt8(38)

    this.dimInfo = data.getInt8(39);
    this.dim = [
      data.getInt16(40, littleEndian),
      data.getInt16(42, littleEndian),
      data.getInt16(44, littleEndian),
      data.getInt16(46, littleEndian),
      data.getInt16(48, littleEndian),
      data.getInt16(50, littleEndian),
      data.getInt16(52, littleEndian),
      data.getInt16(54, littleEndian),
    ];

    this.intentP1 = data.getFloat32(56, littleEndian);
    this.intentP2 = data.getFloat32(60, littleEndian);
    this.intentP3 = data.getFloat32(64, littleEndian);

    this.intentCode = data.getInt16(68, littleEndian);
    this.datatype = data.getInt16(70, littleEndian);
    this.bitpix = data.getInt16(72, littleEndian);
    this.sliceStart = data.getInt16(74, littleEndian);
    this.pixdim = [
      data.getFloat32(76, littleEndian),
      data.getFloat32(80, littleEndian),
      data.getFloat32(84, littleEndian),
      data.getFloat32(88, littleEndian),
      data.getFloat32(92, littleEndian),
      data.getFloat32(96, littleEndian),
      data.getFloat32(100, littleEndian),
      data.getFloat32(104, littleEndian),
    ];
    this.voxOffset = data.getFloat32(108, littleEndian);
    this.sclSlope = data.getFloat32(112, littleEndian);
    this.sclInter = data.getFloat32(116, littleEndian);
    this.sliceEnd = data.getInt16(120, littleEndian);
    this.sliceCode = data.getInt8(122);
    this.xyztUnits = data.getInt8(123);
    this.calMax = data.getFloat32(124, littleEndian);
    this.calMin = data.getFloat32(128, littleEndian);
    this.sliceDuration = data.getFloat32(132, littleEndian);
    this.toffset = data.getFloat32(136, littleEndian);
    this.glmax = data.getInt32(140, littleEndian);
    this.glmin = data.getInt32(144, littleEndian);

    // convert descrip[80] to string
    d = "";
    for (j = 148; j < 228; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.descrip = d;

    d = "";
    for (j = 228; j < 252; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.auxFile = d;

    this.qformCode = data.getInt16(252, littleEndian);
    this.sformCode = data.getInt16(254, littleEndian);

    this.quaternB = data.getFloat32(256, littleEndian);
    this.quaternC = data.getFloat32(260, littleEndian);
    this.quaternD = data.getFloat32(264, littleEndian);
    this.qoffsetX = data.getFloat32(268, littleEndian);
    this.qoffsetY = data.getFloat32(272, littleEndian);
    this.qoffsetZ = data.getFloat32(276, littleEndian);

    this.srowX = [
      data.getFloat32(280, littleEndian),
      data.getFloat32(284, littleEndian),
      data.getFloat32(288, littleEndian),
      data.getFloat32(292, littleEndian),
    ];
    this.srowY = [
      data.getFloat32(296, littleEndian),
      data.getFloat32(300, littleEndian),
      data.getFloat32(304, littleEndian),
      data.getFloat32(308, littleEndian),
    ];
    this.srowZ = [
      data.getFloat32(312, littleEndian),
      data.getFloat32(316, littleEndian),
      data.getFloat32(320, littleEndian),
      data.getFloat32(324, littleEndian),
    ];

    d = "";
    for (j = 328; j < 344; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.intentName = d;

    d = "";
    for (j = 344; j < 348; j++) {
      d += String.fromCharCode(data.getInt8(j));
    }
    this.magic = d;
  }
}
