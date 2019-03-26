export * from './types';
export * from './header';
export * from './image';

import {ungzip, isGzipped} from './gzip';
import {Image} from './image';

export function fromBuffer(buffer: ArrayBuffer): Image {
  if (isGzipped(buffer)) {
    buffer = ungzip(buffer);
  }
  const image = Image.fromBuffer(buffer);
  return image;
}
