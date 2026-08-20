import { formatColorName } from "./color-name-ja.ts";
import { namedWhiteColors } from "./named-white-colors.ts";

export type Rgb = readonly [number, number, number];
export type Hsv = readonly [number, number, number];

export type PaintColor = {
  id: number;
  name: string;
  hex: string;
  rgb: Rgb;
  hsv: Hsv;
  css: string;
};

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255];
}

export function relativeLuminance([red, green, blue]: Rgb): number {
  const toLinear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue)
  );
}

export function rgbToHsv([red, green, blue]: Rgb): Hsv {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const difference = maximum - minimum;
  let hue = 0;

  if (difference !== 0) {
    if (maximum === r) hue = 60 * (((g - b) / difference) % 6);
    else if (maximum === g) hue = 60 * ((b - r) / difference + 2);
    else hue = 60 * ((r - g) / difference + 4);
  }
  if (hue < 0) hue += 360;

  const saturation = maximum === 0 ? 0 : difference / maximum;
  return [
    Math.round(hue),
    Math.round(saturation * 100),
    Math.round(maximum * 100),
  ];
}

export const whitePalette: readonly PaintColor[] = namedWhiteColors.map(
  ({ name, hex }, colorIndex) => {
    const rgb = hexToRgb(hex);
    return {
      id: colorIndex + 1,
      name: formatColorName(name),
      hex,
      rgb,
      hsv: rgbToHsv(rgb),
      css: hex,
    };
  },
);

function requirePaletteColor(color: PaintColor | undefined): PaintColor {
  if (!color) throw new Error("白色パレットの初期色を設定できませんでした。");
  return color;
}

export const initialBrushColor = requirePaletteColor(whitePalette[0]);
export const initialBackgroundColor = requirePaletteColor(whitePalette.at(-1));
