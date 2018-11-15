export * from './types';
export * from './header';
export * from './image';

import { inflate, isGzipped } from './gzip';
import { Header } from './header';
import { Image } from './image';

export function fromBuffer(buffer: ArrayBuffer): Image {
  if (isGzipped(buffer)) {
    buffer = inflate(buffer);
  }
  const image = Image.fromBuffer(buffer);
  return image;
}
