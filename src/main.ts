import "./style.css";
import {
  captureCanvas,
  drawLine,
  type Point,
  restoreCanvas,
  toCanvasPoint,
} from "./canvas.ts";
import {
  initialBackgroundColor,
  initialBrushColor,
  type PaintColor,
  whitePalette,
} from "./palette.ts";
import { oppositeTheme, resolveInitialTheme, type Theme } from "./theme.ts";

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`必要な画面要素が見つかりませんでした: ${selector}`);
  }
  return element;
}

const paletteElement = requireElement<HTMLDivElement>("#palette");
const canvas = requireElement<HTMLCanvasElement>("#paint-canvas");
const brushSize = requireElement<HTMLInputElement>("#brush-size");
const brushOutput = requireElement<HTMLOutputElement>("#brush-output");
const status = requireElement<HTMLParagraphElement>("#status");
const undoClearButton = requireElement<HTMLButtonElement>("#undo-clear-button");
const selectedName = requireElement<HTMLSpanElement>("#selected-name");
const selectedSwatch = requireElement<HTMLSpanElement>("#selected-swatch");
const paletteSection = requireElement<HTMLElement>(".palette-section");
const paletteToggle = requireElement<HTMLButtonElement>("#palette-toggle");
const themeToggle = requireElement<HTMLButtonElement>("#theme-toggle");
const brushModeButton = requireElement<HTMLButtonElement>("#brush-mode");
const backgroundModeButton =
  requireElement<HTMLButtonElement>("#background-mode");

const canvasContext = canvas.getContext("2d");
if (!canvasContext) {
  throw new Error("このブラウザではCanvasを利用できません。");
}
const context: CanvasRenderingContext2D = canvasContext;
const paintLayer = document.createElement("canvas");
paintLayer.width = canvas.width;
paintLayer.height = canvas.height;
const paintContext = paintLayer.getContext("2d");
if (!paintContext) {
  throw new Error("描画レイヤーを初期化できませんでした。");
}

let selectedColor: PaintColor = initialBrushColor;
let backgroundColor: PaintColor = initialBackgroundColor;
let selectionTarget: "brush" | "background" = "brush";
let drawing = false;
let previousPoint: Point | null = null;
let clearedPainting: ImageData | null = null;
const themeStorageKey = "200-whites-theme";
let currentTheme: Theme = resolveInitialTheme(
  localStorage.getItem(themeStorageKey),
  window.matchMedia("(prefers-color-scheme: dark)").matches,
  window.matchMedia("(prefers-color-scheme: light)").matches,
);

function applyTheme(theme: Theme): void {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggle.textContent = theme === "dark" ? "ライトモード" : "ダークモード";
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#242421" : "#f4f2ec");
}

applyTheme(currentTheme);

themeToggle.addEventListener("click", () => {
  const theme = oppositeTheme(currentTheme);
  applyTheme(theme);
  localStorage.setItem(themeStorageKey, theme);
});

function discardClearHistory(): void {
  clearedPainting = null;
  undoClearButton.disabled = true;
}

function renderCanvas(): void {
  context.fillStyle = backgroundColor.css;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(paintLayer, 0, 0);
}

function updateSelection(button: HTMLButtonElement, colorIndex: number): void {
  const color = whitePalette[colorIndex];
  if (!color) return;

  if (selectionTarget === "brush") {
    selectedColor = color;
  } else {
    backgroundColor = color;
    renderCanvas();
  }
  updatePaletteState();
  button.focus({ preventScroll: true });
}

function updatePaletteState(): void {
  const activeColor =
    selectionTarget === "brush" ? selectedColor : backgroundColor;
  for (const [index, chip] of Array.from(paletteElement.children).entries()) {
    const color = whitePalette[index];
    if (!(chip instanceof HTMLButtonElement) || !color) continue;
    chip.setAttribute("aria-checked", String(color.id === activeColor.id));
    chip.toggleAttribute("data-brush-selected", color.id === selectedColor.id);
    chip.toggleAttribute(
      "data-background-selected",
      color.id === backgroundColor.id,
    );
  }
  const targetName = selectionTarget === "brush" ? "筆色" : "背景色";
  selectedName.textContent = `${targetName}: ${activeColor.name}  ·  RGB ${activeColor.rgb.join(", ")}  ·  HSV ${activeColor.hsv[0]}°, ${activeColor.hsv[1]}%, ${activeColor.hsv[2]}%`;
  selectedSwatch.style.backgroundColor = activeColor.css;
}

for (const [index, color] of whitePalette.entries()) {
  const button = document.createElement("button");
  button.className = "color-chip";
  button.type = "button";
  button.role = "radio";
  const hsvLabel = `${color.hsv[0]}°, ${color.hsv[1]}%, ${color.hsv[2]}%`;
  button.ariaLabel = `${color.name}、RGB ${color.rgb.join(", ")}、HSV ${hsvLabel}`;
  button.dataset.tooltip = `${color.name}\nRGB ${color.rgb.join(", ")}\nHSV ${hsvLabel}`;
  button.style.backgroundColor = color.css;
  button.setAttribute("aria-checked", "false");
  button.addEventListener("click", () => updateSelection(button, index));
  paletteElement.append(button);
}

updatePaletteState();

function setSelectionTarget(target: "brush" | "background"): void {
  selectionTarget = target;
  const brushIsActive = target === "brush";
  brushModeButton.classList.toggle("is-active", brushIsActive);
  brushModeButton.setAttribute("aria-checked", String(brushIsActive));
  backgroundModeButton.classList.toggle("is-active", !brushIsActive);
  backgroundModeButton.setAttribute("aria-checked", String(!brushIsActive));
  updatePaletteState();
}

brushModeButton.addEventListener("click", () => setSelectionTarget("brush"));
backgroundModeButton.addEventListener("click", () =>
  setSelectionTarget("background"),
);

paletteToggle.addEventListener("click", () => {
  const willExpand = paletteToggle.getAttribute("aria-expanded") !== "true";
  paletteToggle.setAttribute("aria-expanded", String(willExpand));
  paletteToggle.textContent = willExpand
    ? "パレットを最小化"
    : "パレットを表示";
  paletteElement.hidden = !willExpand;
  paletteSection.classList.toggle("is-collapsed", !willExpand);
});

renderCanvas();

canvas.addEventListener("pointerdown", (event) => {
  discardClearHistory();
  drawing = true;
  canvas.setPointerCapture(event.pointerId);
  previousPoint = toCanvasPoint(
    event.clientX,
    event.clientY,
    canvas.getBoundingClientRect(),
    canvas,
  );
  drawLine(
    paintContext,
    previousPoint,
    previousPoint,
    selectedColor.css,
    Number(brushSize.value),
  );
  renderCanvas();
});

canvas.addEventListener("pointermove", (event) => {
  if (!drawing || !previousPoint) return;
  const point = toCanvasPoint(
    event.clientX,
    event.clientY,
    canvas.getBoundingClientRect(),
    canvas,
  );
  drawLine(
    paintContext,
    previousPoint,
    point,
    selectedColor.css,
    Number(brushSize.value),
  );
  renderCanvas();
  previousPoint = point;
});

function stopDrawing(): void {
  drawing = false;
  previousPoint = null;
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

brushSize.addEventListener("input", () => {
  brushOutput.value = brushSize.value;
});

document.querySelector("#clear-button")?.addEventListener("click", () => {
  if (!clearedPainting) {
    clearedPainting = captureCanvas(
      paintContext,
      paintLayer.width,
      paintLayer.height,
    );
  }
  paintContext.clearRect(0, 0, paintLayer.width, paintLayer.height);
  renderCanvas();
  undoClearButton.disabled = false;
  status.textContent = "キャンバスを消去しました。";
});

undoClearButton.addEventListener("click", () => {
  if (!clearedPainting) return;
  restoreCanvas(paintContext, clearedPainting);
  renderCanvas();
  discardClearHistory();
  status.textContent = "キャンバスの消去を元に戻しました。";
});

document.querySelector("#save-button")?.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "200-whites.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  status.textContent = "PNG画像を保存しました。";
});

document.querySelector("#copy-button")?.addEventListener("click", () => {
  canvas.toBlob(async (blob) => {
    if (!blob) {
      status.textContent = "画像を作成できませんでした。";
      return;
    }
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("clipboard unsupported");
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      status.textContent = "画像をクリップボードにコピーしました。";
    } catch {
      status.textContent =
        "クリップボードにコピーできませんでした。HTTPS環境でお試しください。";
    }
  }, "image/png");
});
