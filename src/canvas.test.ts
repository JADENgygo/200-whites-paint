import { describe, expect, it } from "vitest";
import { toCanvasPoint } from "./canvas.ts";

describe("toCanvasPoint", () => {
  it("表示サイズからCanvas内部の座標へ変換する", () => {
    const point = toCanvasPoint(
      250,
      150,
      { left: 50, top: 50, width: 400, height: 200 },
      { width: 1600, height: 900 },
    );

    expect(point).toEqual({ x: 800, y: 450 });
  });
});
