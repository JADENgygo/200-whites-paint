import { describe, expect, it, vi } from "vitest";
import { captureCanvas, restoreCanvas, toCanvasPoint } from "./canvas.ts";

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

describe("キャンバスの復元", () => {
  it("描画内容を保存して元の位置へ戻す", () => {
    const snapshot = { width: 1600, height: 900 } as ImageData;
    const getImageData = vi.fn(() => snapshot);
    const putImageData = vi.fn();
    const context = {
      getImageData,
      putImageData,
    } as unknown as CanvasRenderingContext2D;

    expect(captureCanvas(context, 1600, 900)).toBe(snapshot);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 1600, 900);

    restoreCanvas(context, snapshot);
    expect(putImageData).toHaveBeenCalledWith(snapshot, 0, 0);
  });
});
