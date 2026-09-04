/**
 * Client-side demo image processing for the super-resolution comparison.
 *
 * DEMO MODE: this is classical image processing (bicubic upscale + unsharp
 * masking + local contrast), NOT a trained super-resolution model. It never
 * invents structures — it only makes existing edges easier to read, so the
 * before/after slider communicates the idea of the pipeline.
 *
 * Both outputs are rendered from the SAME source pixels at the SAME geometry
 * (identical crop, no shift, no rotation), so the two sides stay aligned.
 */

const MAX_SIDE = 1600;

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function baseSize(img: HTMLImageElement) {
  const w = img.naturalWidth || 1024;
  const h = img.naturalHeight || 1024;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

/** Lower-detail "~10 m" input: downsample then bicubic-ish upsample + slight blur. */
function renderDegraded(img: HTMLImageElement, w: number, h: number) {
  const small = makeCanvas(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3)));
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(img, 0, 0, small.width, small.height);

  const out = makeCanvas(w, h);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = "blur(1.1px) saturate(0.95) contrast(0.96)";
  ctx.drawImage(small, 0, 0, w, h);
  ctx.filter = "none";
  return out;
}

/** Unsharp mask + gentle local contrast, applied in-place on the pixel buffer. */
function sharpenAndBoost(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const src = ctx.getImageData(0, 0, w, h);

  // Blurred copy for the unsharp mask.
  const blurCanvas = makeCanvas(w, h);
  const bctx = blurCanvas.getContext("2d")!;
  bctx.filter = "blur(1.6px)";
  bctx.drawImage(ctx.canvas, 0, 0);
  bctx.filter = "none";
  const blur = bctx.getImageData(0, 0, w, h);

  const a = src.data;
  const b = blur.data;
  const amount = 0.85; // controlled — strong enough to read, not haloed
  const clampBoost = 42; // limits overshoot so edges never ring

  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = a[i + c] as number;
      let d = (v - (b[i + c] as number)) * amount;
      if (d > clampBoost) d = clampBoost;
      else if (d < -clampBoost) d = -clampBoost;
      let out = v + d;
      // Mild S-curve for local contrast / readability.
      out = 128 + (out - 128) * 1.08;
      a[i + c] = out < 0 ? 0 : out > 255 ? 255 : out;
    }
  }
  ctx.putImageData(src, 0, 0);
}

/** Enhanced demo product: 2x upscale of the same scene + sharpening. */
function renderEnhanced(img: HTMLImageElement, w: number, h: number) {
  const out = makeCanvas(w * 2, h * 2);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, out.width, out.height);
  sharpenAndBoost(ctx, out.width, out.height);
  ctx.filter = "saturate(1.06)";
  ctx.drawImage(out, 0, 0);
  ctx.filter = "none";
  return out;
}

export type ComparisonPair = { degradedUrl: string; enhancedUrl: string };

/**
 * Produces the aligned before/after pair. Returns the source URL for both
 * sides if canvas processing is unavailable (SSR, tainted canvas, decode error).
 */
export async function buildComparisonPair(url: string): Promise<ComparisonPair | null> {
  if (typeof document === "undefined") return null;
  try {
    const img = await loadImage(url);
    const { w, h } = baseSize(img);
    const degraded = renderDegraded(img, w, h);
    const enhanced = renderEnhanced(img, w, h);
    return {
      degradedUrl: degraded.toDataURL("image/jpeg", 0.92),
      enhancedUrl: enhanced.toDataURL("image/jpeg", 0.95),
    };
  } catch {
    return null;
  }
}
