/** Minimal PNG header reader for brand:check (no image library needed). */

const SIGNATURE = '89504e470d0a1a0a';

export type PngInfo = {
  width: number;
  height: number;
  /** IHDR colour type: 0 gray, 2 RGB, 3 palette, 4 gray+alpha, 6 RGBA. */
  colorType: number;
  /** True if the image has an alpha channel or a tRNS (transparency) chunk. */
  hasTransparency: boolean;
};

/** Reads IHDR and scans chunks up to IDAT. Returns null if `buf` is not a PNG. */
export function readPngInfo(buf: Buffer): PngInfo | null {
  if (buf.length < 33 || buf.subarray(0, 8).toString('hex') !== SIGNATURE) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  let hasTransparency = colorType === 4 || colorType === 6;

  let offset = 8;
  while (!hasTransparency && offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'tRNS') hasTransparency = true;
    if (type === 'IDAT' || type === 'IEND') break;
    offset += 12 + length;
  }
  return { width, height, colorType, hasTransparency };
}
