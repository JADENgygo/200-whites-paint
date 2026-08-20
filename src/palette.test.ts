import { describe, expect, it } from "vitest";
import {
  initialBackgroundColor,
  initialBrushColor,
  relativeLuminance,
  rgbToHsv,
  whitePalette,
} from "./palette.ts";

describe("whitePalette", () => {
  it("200色を生成する", () => {
    expect(whitePalette).toHaveLength(200);
  });

  it("すべて異なるRGB値を持つ", () => {
    const colors = new Set(whitePalette.map(({ rgb }) => rgb.join(",")));
    expect(colors.size).toBe(200);
  });

  it("すべて白に近い明るい色である", () => {
    for (const color of whitePalette) {
      expect(Math.min(...color.rgb)).toBeGreaterThanOrEqual(240);
      expect(Math.max(...color.rgb)).toBeLessThanOrEqual(255);
    }
  });

  it("色の変化を微妙な範囲に抑える", () => {
    const channels = whitePalette.flatMap(({ rgb }) => [...rgb]);
    expect(Math.max(...channels) - Math.min(...channels)).toBe(15);
  });

  it("左上から右下へ向かって暗くなる順に並ぶ", () => {
    const luminances = whitePalette.map(({ rgb }) => relativeLuminance(rgb));
    for (const [index, luminance] of luminances.slice(1).entries()) {
      const previous = luminances[index];
      expect(previous).toBeDefined();
      expect(luminance).toBeLessThanOrEqual(previous ?? 0);
    }
    expect(luminances[0]).toBeGreaterThan(
      luminances[luminances.length - 1] ?? 1,
    );
  });

  it("すべての色にRGBと対応するHSV値を持つ", () => {
    for (const color of whitePalette) {
      expect(color.hsv).toEqual(rgbToHsv(color.rgb));
    }
  });

  it("筆は最明色、背景は最暗色を初期値にする", () => {
    expect(initialBrushColor).toBe(whitePalette[0]);
    expect(initialBackgroundColor).toBe(whitePalette.at(-1));
    expect(relativeLuminance(initialBrushColor.rgb)).toBeGreaterThan(
      relativeLuminance(initialBackgroundColor.rgb),
    );
  });
});

describe("rgbToHsv", () => {
  it("既知のRGB値をHSVへ変換する", () => {
    expect(rgbToHsv([255, 255, 255])).toEqual([0, 0, 100]);
    expect(rgbToHsv([255, 0, 0])).toEqual([0, 100, 100]);
    expect(rgbToHsv([0, 255, 0])).toEqual([120, 100, 100]);
  });
});
