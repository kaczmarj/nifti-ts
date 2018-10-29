// Image routines.

import * as ndarray from 'ndarray';

import { Header } from './header';
import { TypedArray, valueToTypedArray } from './types';

function readData(header: Header, buffer: ArrayBuffer): TypedArray {
  const length: number = (
    header.dim.slice(1, header.dim[header.dim[0]] + 1).reduce((a, b) => a * b)
    * header.bitpix
    / 8);
  const arrayConstructor = valueToTypedArray[header.datatype]
  return new arrayConstructor(buffer, header.voxOffset, length);
}

export class Image {

  public header: Header;
  public data: TypedArray;
  public array: ndarray;

  constructor(header: Header, buffer: ArrayBuffer) {
    this.header = header;
    this.data = readData(header, buffer);
    this.array = ndarray(this.data, header.dim.slice(1, header.dim[0] + 1));
  }
}
