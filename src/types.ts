// Type definitions for nifti 0.1.0
// Project: nifti
// Definitions by: Jakub Kaczmarzyk <jakubk@mit.edu>

import * as ndarray from 'ndarray';

export enum DataTypeToValue {
  none = 0,
  unknown = 0,
  binary = 1,
  unsignedChar = 2,
  signedShort = 4,
  signedInt = 8,
  float = 16,
  complex = 32,
  double = 64,
  rgb = 128,
  all = 255,

  uint8 = 2,
  int16 = 4,
  int32 = 8,
  float32 = 16,
  complex64 = 32,
  float64 = 64,
  rgb24 = 128,

  int8 = 256,
  uint16 = 512,
  uint32 = 768,
  int64 = 1024,
  uint64 = 1280,
  float128 = 1536,
  complex128 = 1792,
  complex256 = 2048,
  rgba32 = 2304,
}

export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Uint8ClampedArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;


// we only support a subset of the valid types
export const valueToTypedArray: { [num: number]: TypedArrayConstructor } = {
  2: Uint8Array,
  4: Int16Array,
  8: Int32Array,
  16: Float32Array,
  64: Float64Array,
}

export enum XFormCode {
  unknown = 0,
  scannerAnat = 1,
  alignedAnat = 2,
  talairach = 3,
  mni152 = 4,
}

export enum Units {
  unknown = 0,
  meter = 1,  // meters
  mm = 2,  // 1e-3 meters
  micron = 3,  // 1e-6 meters
  sec = 8,  // seconds
  msec = 16,  // 1e-3 seconds
  usec = 24,  // 1e-6 seconds
  hz = 32,  // hertz
  ppm = 40,  // parts per million
  rads = 48,  // radians per second
}

export enum NiftiType {
  analyze = 0,
  nifti1OneFile = 1,
  nifti1TwoFiles = 2,
  niftiAscii = 3,
}

// NIfTI-1 header interface.
// https://nifti.nimh.nih.gov/nifti-1/documentation/nifti1fields
export interface HeaderInterface {
  // name: type;  // numeric type, info, byte offset
  sizeOfHdr: number; // int32, must be 348, 0
  dataType: string;  // int8[10], unused, 4
  dbName: string; // int8[18], unused, 14
  extents: number; // int32, unused, 32
  sessionError: number; // int16, unused, 36
  regular: number;  // int8, unused, 38
  dimInfo: number;  // int8, MRI slice ordering, 39

  dim: [number, number, number, number, number, number, number, number];  // int16[8], data array dimensions, 40
  intentP1: number;  // float32, 1st intent parameter, 56
  intentP2: number;  // float32, 2nd intent parameter, 60
  intentP3: number;  // float32, 3rd intent parameter, 64

  intentCode: number;  // int16,  NIFTIINTENT code, 68
  datatype: number; // int16, defines data type, 70
  bitpix: number;  // int16, number bits/voxel, 72
  sliceStart: number; // int16, first slice index, 74
  pixdim: [number, number, number, number, number, number, number, number];  // float32[8], grid spacings, 76
  voxOffset: number;  // float32, offset into .nii file, 108
  sclSlope: number; // float32, data scaling: slope, 112
  sclInter: number;  // float32, data scaling: offset, 116
  sliceEnd: number;  // int16, last slice index, 120
  sliceCode: number;  // int8, slice timing order, 122
  xyztUnits: number; // int8, units of pixdim[1..4], 123
  calMax: number; // float32, max display intensity, 124
  calMin: number;  // float32, min display intensity, 128
  sliceDuration: number; // float32, time for one slice, 132
  toffset: number; // float32, time axis shift, 136
  glmax: number; // int32, unused, 140
  glmin: number; // int32, unused, 144

  descrip: string; // int8[80], any text you like, 148
  auxFile: string;  // int8[24], auxiliary filename, 228

  qformCode: XFormCode;  // int16, NIFTIXFORM code, 252
  sformCode: XFormCode;  // int16, NIFTIXFORM code, 254

  quaternB: number;  // float32, quaternion b param, 256
  quaternC: number;  // float32, quaternion c param, 260
  quaternD: number;  // float32, quaternion d param, 264
  qoffsetX: number;  // float32, quaternion x shift, 268
  qoffsetY: number;  // float32, quaternion y shift, 272
  qoffsetZ: number;  // float32, quaternion z shift, 276

  srowX: [number, number, number, number];  // float32[4], 1st row affine transform, 280
  srowY: [number, number, number, number];  // float32[4], 2nd row affine transform, 296
  srowZ: [number, number, number, number];  // float32[4], 3rd row affine transform, 312

  intentName: string;  // int8[16], name or meaning of data, 328
  magic: string;  // int8[4], MUSTbe "ni1\0" or "n+1\0", 344

  littleEndian: boolean;
}

// High-level NIfTI-1 image interface.
// https://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1_io.h
export interface ImageInterface {
  ndim: number;  // last dimension greater than 1 (1..7)
  nx: number;  // dimensions of grid array
  ny: number;  // dimensions of grid array
  nz: number;  // dimensions of grid array
  nt: number;  // dimensions of grid array
  nu: number;  // dimensions of grid array
  nv: number;  // dimensions of grid array
  nw: number;  // dimensions of grid array
  dim: [number, number, number, number, number, number, number, number];  // dim[0]=ndim, dim[1]=nx, etc
  nvox: number;  // number of voxels = nx * ny * ... * nw
  nbyper: number;  // bytes per voxel, matches datatype

  dx: number;  // grid spacings
  dy: number;  // grid spacings
  dz: number;  // grid spacings
  dt: number;  // grid spacings
  du: number;  // grid spacings
  dv: number;  // grid spacings
  dw: number;  // grid spacings
  pixdim: [number, number, number, number, number, number, number, number];  // pixdim[1]=dx, etc

  sclSlope: number;  // scaling parameter - slope
  sclInter: number;  // scaling parameter - intercept

  calMin: number;  // calibration parameter, minimum
  calMax: number;  // calibration parameter, maximum

  qformCode: XFormCode;  // codes for (x, y, z) space meaning
  sformCode: XFormCode;  // codes for (x, y, z) space meaning

  freqDim: number;  // indices (1, 2, 3 or 0) for MRI
  phaseDim: number;  // directions in dim[] / pixdim[]
  sliceDim: number;  // directions in dim[] / pixdim[]

  sliceCode: number;  // code for slice timing pattern
  sliceStart: number;  // index for start of slices
  sliceEnd: number;  // index for end of slices
  sliceDuration: number;  // time between individual slices

  quaternB: number;  // quaternion b param
  quaternC: number;  // quaternion c param
  quaternD: number;  // quaternion d param
  qoffsetX: number;  // quaternion x shift
  qoffsetY: number;  // quaternion y shift
  qoffsetZ: number;  // quaternion z shift

  qtoxyz: [  // qform: transform (i, j, k) to (x, y, z)
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ]
  qtoijk: [  // qform: transform (x, y, z) to (i, j, k)
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ]

  stoxyz: [  // sform: transform (i, j, k) to (x, y, z)
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ]
  stoijk: [  // sform: transform (x, y, z) to (i, j, k)
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ]

  toffset: number;  // time coordinate offset
  xyzUnits: Units;  // dx, dy, dz units
  timeUnits: Units;  // dt units

  niftiType: NiftiType;  // type of file

  intentCode: number;  // statistic type
  intentP1: number;  // intent parameters
  intentP2: number;  // intent parameters
  intentP3: number;  // intent parameters
  intentName: string;  // optional description of intent data

  descrip: string;  // optional text to describe dataset
  auxFile: string;  // auxiliary filename

  fname: string;  // header filename (.hdr or .nii)
  iname: string;  // image filename (.img or .nii)
  inameOffset: number;  // offset into iname where data start
  swapsize: number;  // swap unit in image data (might be 0)
  byteorder: string;  // byte order on desk (MSB_FIRST or LSB_FIRST)

  // This type is based on the datatype in the header.
  data: TypedArray;  // array of data: nbyper * nvox bytes
}
