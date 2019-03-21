// Routines for affines.
//
// This file draws from the official nifti1.h header file, nibabel, and
// Wikipedia.
//
// Three methods (taken from nifti1.h)
//    1. qform_code == 0 (UNSUPPORTED)
//    2. qform_code > 0 ("normal case")
//    3. sform_code > 0 (nibabel seems to prefer sform over qform, if available)

/**
 * Quaternion-based.
 * This represents "scanner-anatomical" coordinates (i.e., what the scanner
 * reported).
 *
 * The coordinates (x, y, z) encode the center of the voxel and can be computed
 * with the following equation:
 *
 *   [x]   [ R11 R12 R13 ] [        pixdim[1] * i ]   [ qoffset_x ]
 *   [y] = [ R21 R22 R23 ] [        pixdim[2] * j ] + [ qoffset_y ]
 *   [z]   [ R31 R32 R33 ] [ qfac * pixdim[3] * k ]   [ qoffset_z ]
 *
 * Create the rotation matrix R with the quaternion using the following
 * equation, taken from
 * https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion.
 *
 *   n = w*w + x*x + y*y + z*z
 *   s = 0 if n = 0
 *   s = 2/n otherwise
 *   wx = s * w * x    wy = s * w * y    wz = s * w * z
 *   xx = s * x * x    xy = s * x * y    xz = s * x * z
 *   yy = s * y * y    yz = s * y * z    zz = s * z * z
 *
 *       [ 1 - (yy + zz)     xy - wz        xz + wy    ]
 *   R = [   xy + wz      1 - (xx + zz)     yz - wx    ]
 *       [   xz - wy         yz + wx     1 - (xx + yy) ]
 */

import {FourNumbers, Matrix33} from './types';

const FLOAT_EPSILON = Number.EPSILON;

// Translated from nibabel.quaternions.fillpositive
export function fillPositive(
    xyz: [number, number, number],
    w2_thresh?: number,
    ): [number, number, number, number] {
  if (w2_thresh === null) {
    w2_thresh = -FLOAT_EPSILON * 3.0;
  }

  // Compute dot product. Also could be done in a for loop.
  const w2 = 1.0 - xyz[0] * xyz[0] + xyz[1] * xyz[1] + xyz[2] * xyz[2];
  let w: number;

  if (w2 < 0) {
    if (w2 < (w2_thresh as number)) {
      throw Error('w2 should be positive');
    }
    w = 0;
  } else {
    w = Math.sqrt(w2);
  }

  return [w, xyz[0], xyz[1], xyz[2]];
}

export function quaternionToRotationMatrix(
    quaternion: FourNumbers,
    ): Matrix33 {
  const [w, x, y, z] = quaternion;
  const Nq = w * w + x * x + y * y + z * z;
  if (Nq < FLOAT_EPSILON) {
    return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  }

  const s = 2.0 / Nq;

  const wx = s * w * x;
  const wy = s * w * y;
  const wz = s * w * z;

  const xx = s * x * x;
  const xy = s * x * y;
  const xz = s * x * z;

  const yy = s * y * y;
  const yz = s * y * z;
  const zz = s * z * z;

  return [
    [1 - (yy + zz), xy - wz, xz + wy],
    [xy + wz, 1 - (xx + zz), yz - wx],
    [xz - wy, yz + wx, 1 - (xx + yy)],
  ];
}
