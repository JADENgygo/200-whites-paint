export type Rgb = readonly [number, number, number];
export type Hsv = readonly [number, number, number];

export type PaintColor = {
  id: number;
  name: string;
  rgb: Rgb;
  hsv: Hsv;
  css: string;
};

const colorFamilies = [
  "雪明かり",
  "朝霧",
  "白磁",
  "薄氷",
  "月白",
  "真珠",
  "雲母",
  "胡粉",
  "象牙",
  "生成り",
  "白茶",
  "亜麻",
  "砂糖",
  "白桃",
  "桜貝",
  "藤霞",
  "青磁",
  "水煙",
  "銀鼠",
  "冬空",
] as const;

const shadeNames = [
  "一番",
  "二番",
  "三番",
  "四番",
  "五番",
  "六番",
  "七番",
  "八番",
  "九番",
  "十番",
] as const;

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

const colorSteps = [240, 243, 246, 249, 252, 255] as const;
const orderedColors: readonly Rgb[] = colorSteps
  .flatMap((red) =>
    colorSteps.flatMap((green) =>
      colorSteps.map((blue): Rgb => [red, green, blue]),
    ),
  )
  .sort((first, second) => {
    const luminanceDifference =
      relativeLuminance(second) - relativeLuminance(first);
    if (luminanceDifference !== 0) return luminanceDifference;
    return second.join(",").localeCompare(first.join(","));
  });

const paletteColors = Array.from({ length: 200 }, (_, index): Rgb => {
  // 216候補から両端を含めて均等に選び、明暗の範囲を保つ。
  const candidateIndex = Math.round(
    (index * (orderedColors.length - 1)) / (200 - 1),
  );
  const color = orderedColors[candidateIndex];
  if (!color) throw new Error("白色パレットを生成できませんでした。");
  return color;
});

export const whitePalette: readonly PaintColor[] = paletteColors.map(
  (rgb, colorIndex) => {
    const family = colorFamilies[Math.floor(colorIndex / shadeNames.length)];
    const shade = shadeNames[colorIndex % shadeNames.length];
    if (!family || !shade) {
      throw new Error("白色の名前を生成できませんでした。");
    }
    return {
      id: colorIndex + 1,
      name: `${family}・${shade}`,
      rgb,
      hsv: rgbToHsv(rgb),
      css: `rgb(${rgb.join(" ")})`,
    };
  },
);

function requirePaletteColor(color: PaintColor | undefined): PaintColor {
  if (!color) throw new Error("白色パレットの初期色を設定できませんでした。");
  return color;
}

export const initialBrushColor = requirePaletteColor(whitePalette[0]);
export const initialBackgroundColor = requirePaletteColor(whitePalette.at(-1));
