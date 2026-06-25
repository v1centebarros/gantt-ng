import { GANTT_DEFAULTS } from "../../constants";
import type { GanttDocument, Theme } from "../../types";
import { buildStandaloneSvg } from "./buildSvg";

export type ExportFormat = "svg" | "png" | "jpeg" | "pdf";

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function baseName(title: string): string {
  return (
    title
      .trim()
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "gantt"
  );
}

/** Load an SVG string into an HTMLImageElement for canvas rasterization. */
async function svgToImage(svg: string): Promise<HTMLImageElement> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function rasterize(
  svg: string,
  width: number,
  height: number,
  type: "image/png" | "image/jpeg",
  background?: string,
): Promise<Blob> {
  const scale = GANTT_DEFAULTS.rasterScale;
  const img = await svgToImage(svg);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed."))),
      type,
      0.95,
    ),
  );
}

export async function exportChart(
  format: ExportFormat,
  doc: GanttDocument,
  theme: Theme,
  themes: Theme[],
): Promise<void> {
  const { svg, width, height } = buildStandaloneSvg(doc, theme, themes);
  const name = baseName(doc.meta.title);

  switch (format) {
    case "svg":
      download(new Blob([svg], { type: "image/svg+xml" }), `${name}.svg`);
      return;
    case "png":
      download(await rasterize(svg, width, height, "image/png"), `${name}.png`);
      return;
    case "jpeg":
      download(
        await rasterize(svg, width, height, "image/jpeg", "#ffffff"),
        `${name}.jpg`,
      );
      return;
    case "pdf": {
      // Keep the heavy PDF deps out of the editor bundle until used.
      const [{ jsPDF }] = await Promise.all([
        import("jspdf"),
        import("svg2pdf.js"),
      ]);
      const parser = new DOMParser();
      const svgEl = parser.parseFromString(svg, "image/svg+xml")
        .documentElement as unknown as SVGSVGElement;
      const pdf = new jsPDF({
        orientation: width >= height ? "landscape" : "portrait",
        unit: "pt",
        format: [width, height],
      });
      await pdf.svg(svgEl, { x: 0, y: 0, width, height });
      pdf.save(`${name}.pdf`);
      return;
    }
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
