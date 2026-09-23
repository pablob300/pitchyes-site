import "server-only";

// Largura e altura lidas do CABEÇALHO do arquivo, sem decodificar a imagem e sem
// dependência nova (o projeto não tem biblioteca de imagem, e não é hora de ganhar uma).
//
// Por que isto importa: `next/image` exige width/height declarados, e é o que mantém o
// CLS em zero. Se o painel deixasse alguém subir uma imagem sem dimensões, a página
// pularia enquanto carrega — justamente a métrica que o SEO.md §4 fixa em < 0,1.

export type ImageSize = { width: number; height: number };

function png(bytes: Uint8Array): ImageSize | null {
  // IHDR começa no byte 16: largura e altura em big-endian de 32 bits.
  if (bytes.length < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function jpeg(bytes: Uint8Array): ImageSize | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2; // pula o SOI (0xFFD8)
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const length = view.getUint16(offset + 2);
    // SOF0..SOF15, menos os marcadores que não carregam dimensão (C4, C8, CC).
    const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    offset += 2 + length;
  }
  return null;
}

function webp(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const format = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (format === "VP8 ") {
    // Lossy: as dimensões vêm depois do código de início de quadro, em 14 bits.
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }
  if (format === "VP8L") {
    // Lossless: 14 bits cada, empacotados em 32 bits little-endian.
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (format === "VP8X") {
    // Estendido: 24 bits cada, menos um.
    const read = (at: number) => bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16);
    return { width: read(24) + 1, height: read(27) + 1 };
  }
  return null;
}

export function imageSize(bytes: Uint8Array, type: string): ImageSize | null {
  try {
    const size =
      type === "image/png" ? png(bytes) : type === "image/jpeg" ? jpeg(bytes) : webp(bytes);
    if (!size || size.width <= 0 || size.height <= 0) return null;
    return size;
  } catch {
    return null;
  }
}
