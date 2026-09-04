import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Stat, DemoBadge, Disclaimer } from "@/components/panel";
import { validateAgainstReference, type ValidationResult } from "@/lib/api";
import demoScene from "@/assets/scene-sr.jpg";
import { useRun } from "@/lib/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Validation — AI Satellite Super-Resolution" },
      {
        name: "description",
        content:
          "Compare the AI-enhanced product against a high-resolution reference image and review PSNR, SSIM, MSE and consistency indicators.",
      },
      { property: "og:title", content: "Validation — AI Satellite Super-Resolution" },
      {
        property: "og:description",
        content: "Reference-based validation workflow with PSNR, SSIM and MSE reporting.",
      },
    ],
  }),
  component: ValidationPage,
});

function ValidationPage() {
  const { result } = useRun();
  const enhanced = result?.enhancedUrl ?? demoScene;
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState<ValidationResult | null>(null);

  function onFile(file?: File | null) {
    if (!file) return;
    setMetrics(null);
    setReferenceName(file.name);
    setReferenceUrl(URL.createObjectURL(file));
  }

  async function run() {
    setRunning(true);
    const res = await validateAgainstReference(referenceUrl ?? demoScene);
    setMetrics(res);
    setRunning(false);
  }

  function reset() {
    setReferenceUrl(null);
    setReferenceName(null);
    setMetrics(null);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Panel>
          <PanelTitle
            title="Reference-based validation"
            sub="Upload a high-resolution reference image of the same scene to score the enhanced product. Without a reference, quantitative claims cannot be made."
            right={<DemoBadge />}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="label-mono">Enhanced product</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <img
                  src={enhanced}
                  alt="AI-enhanced satellite product used for validation"
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-background/40 p-4">
              <p className="label-mono">High-resolution reference</p>
              {referenceUrl ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <img
                    src={referenceUrl}
                    alt={referenceName ?? "Reference image"}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              ) : (
                <label className="mt-3 flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center">
                  <Upload className="size-6 text-primary" />
                  <span className="px-6 text-sm text-muted-foreground">
                    Drop or select a reference image (GeoTIFF / PNG / JPG)
                  </span>
                  <input
                    type="file"
                    accept="image/*,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </label>
              )}
              {referenceName ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">{referenceName}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={run}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {running ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {running ? "Computing metrics…" : "Run validation"}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
          <Disclaimer>
            Metrics below are simulated demonstration values produced by the mock evaluation layer.
            Real PSNR / SSIM / MSE require the trained model and a co-registered reference scene.
          </Disclaimer>
        </Panel>

        {metrics ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat
                label="PSNR"
                value={`${metrics.psnr} dB`}
                hint="Simulated · higher is better"
                tone="primary"
              />
              <Stat
                label="SSIM"
                value={metrics.ssim.toFixed(2)}
                hint="Simulated · 1.0 = identical"
                tone="primary"
              />
              <Stat label="MSE" value={metrics.mse.toFixed(3)} hint="Simulated · lower is better" />
              <Stat label="Spatial consistency" value={metrics.spatialConsistency} tone="accent" />
              <Stat
                label="Spectral consistency"
                value={metrics.spectralConsistency}
                tone="accent"
              />
            </div>

            <Panel>
              <PanelTitle
                title="Interpretation"
                sub="What these simulated numbers would mean for a real evaluation run."
              />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  PSNR above ~30 dB indicates the enhanced product retains scene radiometry closely
                  against the reference.
                </li>
                <li>
                  SSIM near 0.9 suggests structural features — field edges, roads, rooftops — are
                  reconstructed in the right places.
                </li>
                <li>
                  Spectral consistency confirms band ratios were not distorted, which matters for
                  downstream indices such as NDVI.
                </li>
                <li>
                  Low-confidence regions from the uncertainty view should be inspected manually even
                  when global metrics look strong.
                </li>
              </ul>
            </Panel>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
