export * from './types';
export * from './header';
export * from './image';

import { inflate, isGzipped } from './gzip';
import { Header } from './header';
import { Image } from './image';

export function fromArrayBuffer(buffer: ArrayBuffer): { header: Header, image: Image } {
  // inflate if compressed
  if (isGzipped(buffer)) {
    buffer = inflate(buffer);
  }
  const header = new Header(buffer);
  const image = new Image(header, buffer);
  return { header: header, image: image }
}
