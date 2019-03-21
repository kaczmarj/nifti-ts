// import {Header} from './header';

// Type definitions for nifti 0.1.0
// Project: nifti
// Definitions by: Jakub Kaczmarzyk <jakubk@mit.edu>

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

export type TypedArrayConstructor =|Int8ArrayConstructor|Uint8ArrayConstructor|
    Int16ArrayConstructor|Uint16ArrayConstructor|Int32ArrayConstructor|
    Uint32ArrayConstructor|Uint8ClampedArrayConstructor|Float32ArrayConstructor|
    Float64ArrayConstructor;
export type TypedArray =|Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|
    Uint32Array|Uint8ClampedArray|Float32Array|Float64Array;

// Only support a subset of the valid types are supported.
// For example, int64, uint64, complex64, complex128, complex256, and rgb32 are
// unsupported.
export const valueToTypedArray: {[num: number]: TypedArrayConstructor} = {
  2: Uint8Array,
  4: Int16Array,
  8: Int32Array,
  16: Float32Array,
  64: Float64Array,
  256: Int8Array,
  512: Uint16Array,
  768: Uint32Array,
};

export enum XFormCode {
  UNKNOWN = 0,      // valid for qform and sform
  SCANNERANAT = 1,  // valid for qform only
  ALIGNEDANAT = 2,  // valid for sform only
  TALAIRACH = 3,    // valid for sform only
  MNI152 = 4,       // valid for sform only
}

// Matrix with shape (3, 3).
export type Matrix33 = [
  [number, number, number], [number, number, number], [number, number, number]
];
// Matrix with shape (4, 4).
export type Matrix44 = [
  [number, number, number, number], [number, number, number, number],
  [number, number, number, number], [number, number, number, number]
];

export type FourNumbers = [number, number, number, number];
export type EightNumbers =
    [number, number, number, number, number, number, number, number];

export enum Units {
  unknown = 0,
  meter = 1,   // meters
  mm = 2,      // 1e-3 meters
  micron = 3,  // 1e-6 meters
  sec = 8,     // seconds
  msec = 16,   // 1e-3 seconds
  usec = 24,   // 1e-6 seconds
  hz = 32,     // hertz
  ppm = 40,    // parts per million
  rads = 48,   // radians per second
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
  sizeOfHdr: number;  // int32, must be 348, 0
  // dataType: string;  // int8[10], unused, 4
  // dbName: string; // int8[18], unused, 14
  // extents: number; // int32, unused, 32
  // sessionError: number; // int16, unused, 36
  // regular: number;  // int8, unused, 38
  dimInfo: number;  // int8, MRI slice ordering, 39

  dim: EightNumbers;  // int16[8], data array dimensions, 40
  intentP1: number;   // float32, 1st intent parameter, 56
  intentP2: number;   // float32, 2nd intent parameter, 60
  intentP3: number;   // float32, 3rd intent parameter, 64

  intentCode: number;     // int16,  NIFTIINTENT code, 68
  datatype: number;       // int16, defines data type, 70
  bitpix: number;         // int16, number bits/voxel, 72
  sliceStart: number;     // int16, first slice index, 74
  pixdim: EightNumbers;   // float32[8], grid spacings, 76
  voxOffset: number;      // float32, offset into .nii file, 108
  sclSlope: number;       // float32, data scaling: slope, 112
  sclInter: number;       // float32, data scaling: offset, 116
  sliceEnd: number;       // int16, last slice index, 120
  sliceCode: number;      // int8, slice timing order, 122
  xyztUnits: number;      // int8, units of pixdim[1..4], 123
  calMax: number;         // float32, max display intensity, 124
  calMin: number;         // float32, min display intensity, 128
  sliceDuration: number;  // float32, time for one slice, 132
  toffset: number;        // float32, time axis shift, 136
  glmax: number;          // int32, unused, 140
  glmin: number;          // int32, unused, 144

  descrip: string;  // int8[80], any text you like, 148
  auxFile: string;  // int8[24], auxiliary filename, 228

  qformCode: XFormCode;  // int16, NIFTIXFORM code, 252
  sformCode: XFormCode;  // int16, NIFTIXFORM code, 254

  quaternB: number;  // float32, quaternion b param, 256
  quaternC: number;  // float32, quaternion c param, 260
  quaternD: number;  // float32, quaternion d param, 264
  qoffsetX: number;  // float32, quaternion x shift, 268
  qoffsetY: number;  // float32, quaternion y shift, 272
  qoffsetZ: number;  // float32, quaternion z shift, 276

  srowX: FourNumbers;  // float32[4], 1st row affine transform, 280
  srowY: FourNumbers;  // float32[4], 2nd row affine transform, 296
  srowZ: FourNumbers;  // float32[4], 3rd row affine transform, 312

  intentName: string;  // int8[16], name or meaning of data, 328
  magic: string;       // int8[4], MUST be "ni1\0" or "n+1\0", 344

  littleEndian: boolean;
}

// High-level NIfTI-1 image interface.
export interface ImageInterface {
  header: HeaderInterface;
  // This type is based on the datatype in the header.
  data: TypedArray;  // array of data: nbyper * nvox bytes
  // freqDim: number; // indices (1, 2, 3 or 0) for MRI
  // phaseDim: number; // directions in dim[] / pixdim[]

  // sliceDim: number; // directions in dim[] / pixdim[]
  // sliceCode: number; // code for slice timing pattern
  // sliceStart: number; // index for start of slices
  // sliceEnd: number; // index for end of slices
  // sliceDuration: number; // time between individual slices

  affine: Matrix44;  // ijk to xyz
  // qform: Matrix44;
  // sform: Matrix44;
  // qtoxyz: Matrix44; // qform: transform (i, j, k) to (x, y, z)
  // qtoijk: Matrix44; // qform: transform (x, y, z) to (i, j, k)
  // stoxyz: Matrix44; // sform: transform (i, j, k) to (x, y, z)
  // stoijk: Matrix44; // sform: transform (x, y, z) to (i, j, k)

  // niftiType: NiftiType; // type of file
}
