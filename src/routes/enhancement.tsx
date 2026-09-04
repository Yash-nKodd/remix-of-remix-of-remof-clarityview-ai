import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  Play,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Settings2,
  X,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Stat, DemoBadge, Disclaimer } from "@/components/panel";
import { Pipeline } from "@/components/Pipeline";
import { CompareViewer } from "@/components/CompareViewer";
import { UncertaintyMap } from "@/components/UncertaintyMap";
import demoScene from "@/assets/scene-sr.jpg";
import { enhanceImage, formatBytes, uploadImage } from "@/lib/api";
import type { EnhanceResult, ImageMeta, PipelineStageId } from "@/lib/api";
import { runStore, useRun } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/enhancement")({
  head: () => ({
    meta: [
      { title: "Image Enhancement — AI Satellite Super-Resolution" },
      {
        name: "description",
        content:
          "Upload a Sentinel-2 image and run the simulated AI super-resolution pipeline toward <4 m spatial detail.",
      },
      { property: "og:title", content: "Image Enhancement — AI Satellite Super-Resolution" },
      {
        property: "og:description",
        content: "Simulated Sentinel-2 super-resolution pipeline with uncertainty awareness.",
      },
    ],
  }),
  component: EnhancementPage,
});

const DEMO_META: ImageMeta = {
  name: "S2A_MSIL2A_demo_T43RGQ.tif",
  width: 1280,
  height: 1280,
  channels: 4,
  inputResolution: "10 m",
  sizeBytes: 4_812_544,
  previewUrl: demoScene,
  isDemo: true,
};

function EnhancementPage() {
  const { meta, result } = useRun();
  const [stage, setStage] = useState<PipelineStageId | null>(null);
  const [running, setRunning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadImage(file);
      runStore.set({ meta: uploaded, result: null });
      setStage(null);
      toast.success("Image ready", { description: `${uploaded.name} is ready for preprocessing.` });
    } catch {
      toast.error("Unable to read this image", {
        description: "Please verify the file and try again.",
      });
    }
  }, []);

  const start = useCallback(async (source?: ImageMeta) => {
    const active = source ?? runStore.get().meta ?? DEMO_META;
    runStore.set({ meta: active, result: null });
    setRunning(true);
    setStage("input");
    try {
      const res: EnhanceResult = await enhanceImage(active, setStage);
      runStore.set({ result: res });
      toast.success("Enhancement pipeline completed", {
        description: "Review the demo result below.",
      });
    } catch {
      toast.error("Unable to process this image", {
        description: "Please verify the file and try again.",
      });
    } finally {
      setRunning(false);
    }
  }, []);

  const activeMeta = meta ?? null;
  const previewUrl = result?.enhancedUrl ?? activeMeta?.previewUrl ?? demoScene;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <Panel>
          <PanelTitle
            title="Upload Sentinel-2 Image"
            sub="Upload a medium-resolution satellite image to generate an AI-enhanced super-resolved product."
            right={
              <Button
                variant="outline"
                size="sm"
                onClick={() => start(DEMO_META)}
                disabled={running}
              >
                <Sparkles /> Try Demo
              </Button>
            }
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`grid-lines cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10 ${
              dragOver ? "border-primary bg-primary/10" : "border-border bg-background/30"
            }`}
          >
            <UploadCloud className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm font-medium">Drag & drop your scene here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse · PNG, JPG, TIFF, GeoTIFF
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.tif,.tiff,image/*"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </div>

          {activeMeta ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-lg border border-border bg-background/40">
                <img
                  src={activeMeta.previewUrl}
                  alt="Uploaded satellite preview"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-mono">Selected scene</p>
                    <p className="mt-1 truncate text-sm font-medium">{activeMeta.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove selected image"
                    onClick={() => {
                      runStore.set({ meta: null, result: null });
                      setStage(null);
                    }}
                  >
                    <X />
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Dimensions" value={`${activeMeta.width} × ${activeMeta.height}`} />
                  <Stat label="Channels" value={String(activeMeta.channels)} />
                  <Stat
                    label="Input resolution"
                    value={activeMeta.inputResolution}
                    hint="Estimated"
                    tone="primary"
                  />
                  <Stat label="File size" value={formatBytes(activeMeta.sizeBytes)} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => void start()} disabled={running}>
              <Play />
              {running ? "Processing…" : "Start Enhancement"}
            </Button>
            <span className="text-xs text-muted-foreground">
              No file? The pipeline runs on a bundled Sentinel-2-style demo scene.
            </span>
          </div>
        </Panel>

        <Panel>
          <PanelTitle
            title="Preprocessing configuration"
            sub="These steps are represented in the demo and ready to map to the future model service."
            right={<Settings2 className="size-5 text-primary" />}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Cloud / noise handling", "Scene quality screening"],
              ["Normalization", "Radiometric scaling"],
              ["Band preparation", "Multispectral channel setup"],
              ["Patch alignment", "Overlap-aware tiling"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-border bg-background/35 p-3">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{text}</p>
                <span className="mt-3 inline-flex rounded-full border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] text-accent">
                  READY · DEMO
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle
            title="Processing Pipeline"
            sub="Input → Pre-processing → AI Super-Resolution → Spatial & Spectral Checks → Validation → Enhanced Product"
            right={result ? <DemoBadge>Enhancement Complete</DemoBadge> : null}
          />
          <Pipeline current={stage} finished={!!result} />
          {result ? (
            <>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
                <CheckCircle2 className="size-4" /> Enhancement Complete
              </p>
              <div>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/results">
                    Open full results <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
          <Disclaimer>
            Inference is currently simulated in the browser. A Python / PyTorch super-resolution
            service will replace the mock <code>POST /api/enhance</code> call.
          </Disclaimer>
        </Panel>

        {result ? (
          <>
            <Panel>
              <PanelTitle
                title="Before / After Comparison"
                sub="Drag the slider, scroll to zoom, drag to pan, or reset the view."
              />
              <CompareViewer
                originalUrl={result.originalUrl}
                enhancedUrl={result.enhancedUrl}
                preprocessed={result.preprocessed}
              />
              <Disclaimer>
                Enhanced details are AI-inferred and should be validated against high-resolution
                reference data before scientific or operational use.
              </Disclaimer>
            </Panel>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Results</h2>
                <DemoBadge />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Stat
                  label="Spatial resolution"
                  value={result.metrics.inputResolution}
                  hint={`Target ${result.metrics.targetResolution}`}
                />
                <Stat label="Enhancement" value="Super-Resolution" hint="Applied" tone="primary" />
                <Stat
                  label="Spatial consistency"
                  value={result.metrics.spatialConsistency}
                  tone="accent"
                />
                <Stat
                  label="Spectral consistency"
                  value={result.metrics.spectralConsistency}
                  tone="accent"
                />
                <Stat label="Confidence" value={`${result.metrics.confidence}%`} tone="primary" />
              </div>
              <Disclaimer>
                Prototype metrics shown without reference data are simulated demonstration values.
              </Disclaimer>
            </div>

            <Panel>
              <PanelTitle
                title="AI Uncertainty / Confidence"
                sub="High-confidence regions: reconstruction is more consistent with learned patterns and available evidence. Low-confidence regions: fine details are more uncertain and require validation."
              />
              <UncertaintyMap imageUrl={previewUrl} />
              <Disclaimer>
                Prototype uncertainty visualization — not scientifically calibrated uncertainty. A
                calibrated estimator will be attached alongside the trained model.
              </Disclaimer>
            </Panel>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
