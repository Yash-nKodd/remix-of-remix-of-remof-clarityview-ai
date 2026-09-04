/**
 * Mock API layer.
 *
 * Every function here mirrors the HTTP endpoint that a future Python/PyTorch
 * backend will expose. Swap the body of each function for a `fetch()` call and
 * the rest of the UI keeps working unchanged.
 *
 *   POST /api/upload    -> uploadImage()
 *   POST /api/enhance   -> enhanceImage()
 *   POST /api/validate  -> validateAgainstReference()
 *   GET  /api/results   -> getResults()
 */

import { buildComparisonPair } from "./image-enhance";

export const API_BASE = "/api";

export type ImageMeta = {
  name: string;
  width: number;
  height: number;
  channels: number;
  inputResolution: string;
  sizeBytes: number;
  previewUrl: string;
  isDemo: boolean;
};

export type PipelineStageId =
  "input" | "preprocess" | "superres" | "spectral" | "spatial" | "uncertainty" | "output";

export type EnhanceResult = {
  jobId: string;
  enhancedUrl: string;
  originalUrl: string;
  /** true when both sides were already rendered by the demo pipeline (no CSS filters needed). */
  preprocessed: boolean;
  simulated: true;
  metrics: {
    inputResolution: string;
    targetResolution: string;
    enhancement: string;
    spatialConsistency: string;
    spectralConsistency: string;
    confidence: number;
  };
};

export type ValidationResult = {
  simulated: true;
  psnr: number;
  ssim: number;
  mse: number;
  spatialConsistency: string;
  spectralConsistency: string;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST /api/upload */
export async function uploadImage(file: File): Promise<ImageMeta> {
  await wait(400);
  const previewUrl = URL.createObjectURL(file);
  const dims = await readDimensions(previewUrl);
  return {
    name: file.name,
    width: dims.width,
    height: dims.height,
    channels: /tif/i.test(file.name) ? 4 : 3,
    inputResolution: "10 m",
    sizeBytes: file.size,
    previewUrl,
    isDemo: false,
  };
}

async function readDimensions(url: string) {
  if (typeof window === "undefined") return { width: 1024, height: 1024 };
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1024, height: 1024 });
    img.src = url;
  });
}

/** POST /api/enhance — simulated inference */
export async function enhanceImage(
  meta: ImageMeta,
  onStage: (stage: PipelineStageId) => void,
): Promise<EnhanceResult> {
  onStage("preprocess");
  await wait(1400);
  onStage("superres");
  await wait(2600);
  onStage("spectral");
  await wait(900);
  onStage("spatial");
  await wait(900);
  onStage("uncertainty");
  await wait(900);
  onStage("output");
  await wait(600);

  // Demo enhancement: same scene, same geometry, different detail level.
  const pair = await buildComparisonPair(meta.previewUrl);

  return {
    jobId: `demo-${Date.now()}`,
    originalUrl: pair?.degradedUrl ?? meta.previewUrl,
    enhancedUrl: pair?.enhancedUrl ?? meta.previewUrl,
    preprocessed: Boolean(pair),
    simulated: true,
    metrics: {
      inputResolution: "~10 m",
      targetResolution: "<4 m",
      enhancement: "Super-Resolution Applied",
      spatialConsistency: "High",
      spectralConsistency: "High",
      confidence: 87,
    },
  };
}

/** POST /api/validate */
export async function validateAgainstReference(_referenceUrl: string): Promise<ValidationResult> {
  await wait(1600);
  return {
    simulated: true,
    psnr: 32.4,
    ssim: 0.91,
    mse: 0.002,
    spatialConsistency: "High",
    spectralConsistency: "High",
  };
}

/** GET /api/results */
export async function getResults(): Promise<EnhanceResult["metrics"]> {
  await wait(200);
  return {
    inputResolution: "~10 m",
    targetResolution: "<4 m",
    enhancement: "Super-Resolution Applied",
    spatialConsistency: "High",
    spectralConsistency: "High",
    confidence: 87,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
