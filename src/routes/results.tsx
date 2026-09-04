import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  ShieldCheck,
  Layers3,
  Image as ImageIcon,
  GitCompareArrows,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Stat, DemoBadge, Disclaimer } from "@/components/panel";
import { CompareViewer } from "@/components/CompareViewer";
import { UncertaintyMap } from "@/components/UncertaintyMap";
import demoScene from "@/assets/scene-sr.jpg";
import { useRun } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — AI Satellite Super-Resolution" },
      {
        name: "description",
        content:
          "Before/after comparison, resolution and consistency cards, and the prototype uncertainty view for the enhanced Sentinel-2 product.",
      },
      { property: "og:title", content: "Results — AI Satellite Super-Resolution" },
      {
        property: "og:description",
        content: "Enhanced product comparison, demo metrics and uncertainty visualization.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { result } = useRun();
  const original = result?.originalUrl ?? demoScene;
  const enhanced = result?.enhancedUrl ?? demoScene;
  const m = result?.metrics ?? {
    inputResolution: "~10 m",
    targetResolution: "<4 m",
    enhancement: "Super-Resolution Applied",
    spatialConsistency: "High",
    spectralConsistency: "High",
    confidence: 87,
  };
  const [tab, setTab] = useState("comparison");
  const tabs = [
    ["comparison", "Original / Enhanced", GitCompareArrows],
    ["original", "Original", ImageIcon],
    ["enhanced", "Enhanced", SparklesIcon],
    ["uncertainty", "Uncertainty map", ShieldCheck],
    ["consistency", "Consistency", Layers3],
  ] as const;
  function download() {
    const link = document.createElement("a");
    link.href = enhanced;
    link.download = "sentinel-2-enhanced-demo.jpg";
    link.click();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {!result ? (
          <Panel className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              No enhancement run in this session — showing the bundled demo product.
            </p>
            <Button asChild size="sm">
              <Link to="/enhancement">
                Run the pipeline <ArrowRight />
              </Link>
            </Button>
          </Panel>
        ) : null}

        <Panel>
          <PanelTitle
            title="Before / After Comparison"
            sub="Original Sentinel-2 (~10 m) versus the AI-enhanced product (target <4 m)."
            right={
              <div className="flex flex-wrap justify-end gap-2">
                <DemoBadge />
                <Button variant="outline" size="sm" onClick={download}>
                  <Download /> Download
                </Button>
                <Button asChild size="sm">
                  <Link to="/validation">
                    <ShieldCheck /> Run validation
                  </Link>
                </Button>
              </div>
            }
          />
          <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.map(([id, label, Icon]) => (
              <Button
                key={id}
                variant={tab === id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab(id)}
              >
                <Icon /> {label}
              </Button>
            ))}
          </div>
          {tab === "comparison" ? (
            <CompareViewer
              originalUrl={original}
              enhancedUrl={enhanced}
              preprocessed={Boolean(result?.preprocessed)}
            />
          ) : null}
          {tab === "original" ? (
            <ImagePanel
              src={original}
              alt="Original Sentinel-2 image"
              label="Original Sentinel-2 · approximately 10 m"
            />
          ) : null}
          {tab === "enhanced" ? (
            <ImagePanel
              src={enhanced}
              alt="Enhanced satellite image"
              label="Enhanced product · demo target below 4 m"
            />
          ) : null}
          {tab === "uncertainty" ? <UncertaintyMap imageUrl={enhanced} /> : null}
          {tab === "consistency" ? <ConsistencyView /> : null}
          <Disclaimer>
            Enhanced details are AI-inferred and should be validated against high-resolution
            reference data before scientific or operational use.
          </Disclaimer>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat
            label="Spatial resolution"
            value={m.inputResolution}
            hint={`Target ${m.targetResolution}`}
          />
          <Stat label="Enhancement" value="Super-Resolution" hint="Applied" tone="primary" />
          <Stat label="Spatial consistency" value={m.spatialConsistency} tone="accent" />
          <Stat label="Spectral consistency" value={m.spectralConsistency} tone="accent" />
          <Stat label="Confidence" value={`${m.confidence}%`} tone="primary" />
        </div>
        <Disclaimer>
          Prototype metrics shown without reference data are simulated demonstration values.
        </Disclaimer>

        <Panel>
          <PanelTitle
            title="AI Uncertainty / Confidence"
            sub="High-confidence regions align with learned patterns and available evidence; low-confidence regions carry more uncertain fine detail and require validation."
          />
          <UncertaintyMap imageUrl={enhanced} />
          <Disclaimer>
            Prototype uncertainty visualization — not a scientifically calibrated uncertainty
            product.
          </Disclaimer>
        </Panel>
      </div>
    </AppShell>
  );
}

function SparklesIcon() {
  return (
    <span className="inline-flex">
      <ImageIcon />
    </span>
  );
}

function ImagePanel({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background/40">
      <img src={src} alt={alt} className="aspect-[16/9] w-full object-cover" />
      <p className="border-t border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ConsistencyView() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ["Spectral consistency", "High", "Band ratios represented in the demo surface."],
        ["Spatial consistency", "High", "Geometry and scene alignment are represented."],
        ["Geographic alignment", "Review", "Confirm co-registration with reference data."],
      ].map(([title, value, text]) => (
        <div key={title} className="rounded-lg border border-border bg-background/35 p-4">
          <p className="label-mono">{title}</p>
          <p className="mt-2 font-mono text-xl text-accent">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
        </div>
      ))}
    </div>
  );
}
