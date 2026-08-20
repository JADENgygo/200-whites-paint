export type Point = { x: number; y: number };

export function toCanvasPoint(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, "left" | "top" | "width" | "height">,
  canvasSize: { width: number; height: number },
): Point {
  return {
    x: ((clientX - bounds.left) / bounds.width) * canvasSize.width,
    y: ((clientY - bounds.top) / bounds.height) * canvasSize.height,
  };
}

export function drawLine(
  context: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
): void {
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
}
