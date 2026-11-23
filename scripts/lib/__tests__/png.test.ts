import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

import { readPngInfo } from '../png';

function crcTable(): number[] {
  return Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
}
const TABLE = crcTable();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
/** 1x1 PNG of the given colour type, optionally with a tRNS chunk. */
function png(colorType: number, withTrns = false): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType] ?? 1;
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', ihdr),
    ...(withTrns ? [chunk('tRNS', Buffer.from([0, 0, 0, 0, 0, 0]))] : []),
    chunk('IDAT', deflateSync(Buffer.alloc(1 + channels))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('readPngInfo', () => {
  it('reads size and flags RGB as opaque', () => {
    expect(readPngInfo(png(2))).toEqual({
      width: 1,
      height: 1,
      colorType: 2,
      hasTransparency: false,
    });
  });

  it('flags alpha colour types and tRNS chunks as transparent', () => {
    expect(readPngInfo(png(6))?.hasTransparency).toBe(true);
    expect(readPngInfo(png(4))?.hasTransparency).toBe(true);
    expect(readPngInfo(png(2, true))?.hasTransparency).toBe(true);
  });

  it('returns null for non-PNG data', () => {
    expect(readPngInfo(Buffer.from('not a png at all, definitely not'))).toBeNull();
  });

  it('sees the committed iOS icon as opaque 1024x1024', () => {
    const icon = readFileSync(join(__dirname, '../../../brand/assets/icon.png'));
    expect(readPngInfo(icon)).toMatchObject({ width: 1024, height: 1024, hasTransparency: false });
  });
});
