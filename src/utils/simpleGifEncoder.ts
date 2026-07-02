export interface GifFrameInput {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  delayMs: number;
}

const GIF_WIDTH_LIMIT = 1280;
const GIF_HEIGHT_LIMIT = 1280;

const writeAscii = (out: number[], value: string) => {
  for (let i = 0; i < value.length; i++) out.push(value.charCodeAt(i));
};

const writeUint16 = (out: number[], value: number) => {
  out.push(value & 0xff, (value >> 8) & 0xff);
};

const createPalette = () => {
  const palette: number[] = [];
  for (let r = 0; r < 8; r++) {
    for (let g = 0; g < 8; g++) {
      for (let b = 0; b < 4; b++) {
        palette.push(
          Math.round((r / 7) * 255),
          Math.round((g / 7) * 255),
          Math.round((b / 3) * 255),
        );
      }
    }
  }
  return palette;
};

const quantizeToPaletteIndex = (r: number, g: number, b: number) => {
  const red = Math.round((r / 255) * 7);
  const green = Math.round((g / 255) * 7);
  const blue = Math.round((b / 255) * 3);
  return (red << 5) | (green << 2) | blue;
};

const imageDataToIndices = (frame: GifFrameInput) => {
  const indices = new Uint8Array(frame.width * frame.height);
  for (let i = 0, p = 0; i < frame.data.length; i += 4, p++) {
    const alpha = frame.data[i + 3] / 255;
    const r = Math.round(frame.data[i] * alpha + 255 * (1 - alpha));
    const g = Math.round(frame.data[i + 1] * alpha + 255 * (1 - alpha));
    const b = Math.round(frame.data[i + 2] * alpha + 255 * (1 - alpha));
    indices[p] = quantizeToPaletteIndex(r, g, b);
  }
  return indices;
};

const packLzwCodes = (indices: Uint8Array) => {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let dictionarySize = endCode + 1;
  let bitBuffer = 0;
  let bitCount = 0;
  let hasPreviousCode = false;
  const bytes: number[] = [];

  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  const resetDictionary = () => {
    codeSize = minCodeSize + 1;
    dictionarySize = endCode + 1;
    hasPreviousCode = false;
  };

  writeCode(clearCode);

  for (const index of indices) {
    writeCode(index);

    if (hasPreviousCode) {
      dictionarySize++;
      if (dictionarySize === 1 << codeSize && codeSize < 12) {
        codeSize++;
      }
      if (dictionarySize >= 4096) {
        writeCode(clearCode);
        resetDictionary();
        continue;
      }
    }

    hasPreviousCode = true;
  }

  writeCode(endCode);
  if (bitCount > 0) bytes.push(bitBuffer & 0xff);

  return bytes;
};

const writeSubBlocks = (out: number[], data: number[]) => {
  for (let offset = 0; offset < data.length; offset += 255) {
    const block = data.slice(offset, offset + 255);
    out.push(block.length, ...block);
  }
  out.push(0);
};

export const encodeGif = (frames: GifFrameInput[], loopCount = 0) => {
  if (frames.length === 0) throw new Error("At least one GIF frame is required.");

  const width = frames[0].width;
  const height = frames[0].height;

  if (
    width <= 0 ||
    height <= 0 ||
    width > GIF_WIDTH_LIMIT ||
    height > GIF_HEIGHT_LIMIT ||
    frames.some((frame) => frame.width !== width || frame.height !== height)
  ) {
    throw new Error("GIF frames must share valid dimensions up to 1280 x 1280.");
  }

  const out: number[] = [];
  const palette = createPalette();

  writeAscii(out, "GIF89a");
  writeUint16(out, width);
  writeUint16(out, height);
  out.push(0xf7, 0, 0);
  out.push(...palette);

  writeAscii(out, "!\xff\u000bNETSCAPE2.0\u0003\u0001");
  writeUint16(out, Math.max(0, Math.min(loopCount, 65535)));
  out.push(0);

  for (const frame of frames) {
    const delay = Math.max(2, Math.min(65535, Math.round(frame.delayMs / 10)));
    out.push(0x21, 0xf9, 0x04, 0x04);
    writeUint16(out, delay);
    out.push(0, 0);

    out.push(0x2c);
    writeUint16(out, 0);
    writeUint16(out, 0);
    writeUint16(out, width);
    writeUint16(out, height);
    out.push(0);
    out.push(8);
    writeSubBlocks(out, packLzwCodes(imageDataToIndices(frame)));
  }

  out.push(0x3b);
  return new Blob([new Uint8Array(out)], { type: "image/gif" });
};
