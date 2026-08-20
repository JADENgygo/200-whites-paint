import { writeFile } from "node:fs/promises";
import { colornames } from "color-name-list";

const outputPath = new URL("../src/named-white-colors.ts", import.meta.url);
const channelFloor = 235;
const paletteSize = 200;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255];
}

function relativeLuminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

const candidates = colornames
  .filter(({ hex }) => Math.min(...hexToRgb(hex)) >= channelFloor)
  .sort((first, second) => {
    const difference =
      relativeLuminance(second.hex) - relativeLuminance(first.hex);
    return difference || first.name.localeCompare(second.name);
  });

if (candidates.length < paletteSize) {
  throw new Error(`白色候補が不足しています: ${candidates.length}`);
}

const selected = Array.from({ length: paletteSize }, (_, index) => {
  const candidateIndex = Math.round(
    (index * (candidates.length - 1)) / (paletteSize - 1),
  );
  return candidates[candidateIndex];
});

const source = `// color-name-list (MIT) からRGB各成分235以上の色を明るさ順に抽出。\n// このファイルは npm run generate:colors で再生成できます。\nexport const namedWhiteColors = ${JSON.stringify(selected, null, 2)} as const;\n`;

await writeFile(outputPath, source);
