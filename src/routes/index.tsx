import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Satellite,
  Gauge,
  ShieldCheck,
  Sparkles,
  Upload,
  ScanSearch,
  Image as ImageIcon,
  SlidersHorizontal,
  Activity,
  MapPinned,
  Layers3,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Stat, Disclaimer, DemoBadge } from "@/components/panel";
import { Button } from "@/components/ui/button";
import demoScene from "@/assets/scene-sr.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Satellite Super-Resolution — SIH 2026 Prototype" },
      {
        name: "description",
        content:
          "Prototype dashboard for AI-based Sentinel-2 super-resolution: 10 m input to <4 m target detail with consistency checks and uncertainty awareness.",
      },
      { property: "og:title", content: "AI Satellite Super-Resolution — SIH 2026 Prototype" },
      {
        property: "og:description",
        content:
          "Sentinel-2 super-resolution workflow: enhancement, consistency checks, uncertainty, validation.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Sentinel-2 image",
      text: "Bring in a scene or start with the bundled demo.",
    },
    {
      icon: ScanSearch,
      title: "Preprocess",
      text: "Prepare bands, normalize values, and align patches.",
    },
    {
      icon: Sparkles,
      title: "AI super-resolution",
      text: "Run the browser demo pipeline with clear status.",
    },
    {
      icon: ImageIcon,
      title: "Enhanced image",
      text: "Review original and inferred detail side by side.",
    },
    {
      icon: Activity,
      title: "Consistency + uncertainty",
      text: "Inspect trust signals before using the output.",
    },
    { icon: ShieldCheck, title: "Validation", text: "Compare against a suitable reference scene." },
  ];
  const capabilities = [
    [Sparkles, "AI super-resolution", "Fine-detail reconstruction surface"],
    [Layers3, "Multi-spectral processing", "Band-aware workflow design"],
    [Gauge, "Spectral consistency", "Radiometric fidelity check"],
    [MapPinned, "Spatial consistency", "Geographic alignment check"],
    [Target, "Uncertainty estimation", "Trust-aware review surface"],
    [SlidersHorizontal, "PSNR / SSIM / MSE", "Reference-based metrics"],
  ] as const;
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="glass grid-lines relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 scanline opacity-20" />
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-mono">Smart India Hackathon 2026</span>
                <DemoBadge>Prototype / Demonstration</DemoBadge>
              </div>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                AI-Powered Satellite Image Super-Resolution
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Enhance 10 m Sentinel-2 imagery toward &lt;4 m resolution while preserving spectral
                and spatial consistency.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/enhancement">
                    <Sparkles /> Start Enhancement
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/applications">
                    Explore Applications <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 border-t border-border/70 pt-5">
                <div>
                  <p className="label-mono">Input</p>
                  <p className="mt-1 font-mono text-lg text-primary">10 m</p>
                </div>
                <div>
                  <p className="label-mono">Target</p>
                  <p className="mt-1 font-mono text-lg text-accent">&lt;4 m</p>
                </div>
                <div>
                  <p className="label-mono">Mode</p>
                  <p className="mt-1 font-mono text-lg text-signal">Demo</p>
                </div>
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-border bg-background/40 lg:min-h-[390px]">
              <img
                src={demoScene}
                alt="Sentinel-2 style satellite scene of farmland and a small town"
                width={1280}
                height={1280}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
              <div className="absolute left-4 top-4 rounded-md border border-primary/40 bg-background/75 px-3 py-2 backdrop-blur">
                <p className="label-mono text-primary">Scene preview</p>
                <p className="mt-1 text-xs text-foreground">Multispectral agricultural tile</p>
              </div>
              <span className="absolute bottom-3 left-3 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] backdrop-blur">
                Demo scene · Sentinel-2 style
              </span>
              <span className="absolute bottom-3 right-3 rounded-md border border-accent/40 bg-background/80 px-2 py-1 font-mono text-[11px] text-accent backdrop-blur">
                T43RGQ · 10 m
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Input product" value="~10 m" hint="Sentinel-2 L2A" />
          <Stat
            label="Target detail"
            value="&lt;4 m"
            hint="Demo target, not guaranteed"
            tone="primary"
          />
          <Stat label="Consistency checks" value="2" hint="Spatial + spectral" tone="accent" />
          <Stat label="Model status" value="Demo" hint="Backend not connected" />
        </div>

        <Panel>
          <PanelTitle
            title="How it works"
            sub="A transparent path from medium-resolution imagery to a reviewable product."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className="relative rounded-lg border border-border bg-background/35 p-4"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" />
                  <span className="font-mono text-[11px] text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-sm font-semibold leading-snug">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Panel>
            <PanelTitle
              title="Platform capabilities"
              sub="Built around Earth observation review, not just image sharpness."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map(([Icon, title, text]) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-lg border border-border bg-background/30 p-3"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelTitle title="Project status" right={<DemoBadge>Prototype</DemoBadge>} />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Demo workflow</span>
                <span className="text-accent">Ready</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Model integration</span>
                <span className="text-signal">Planned</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Reference validation</span>
                <span className="text-signal">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Application modules</span>
                <span className="text-accent">Ready</span>
              </div>
            </div>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/about">
                Read project notes <ArrowRight />
              </Link>
            </Button>
          </Panel>
        </div>
        <Disclaimer>
          AI-enhanced details are inferred from learned patterns and are not direct observations.
          This presentation uses a browser demo pipeline until the trained model service is
          connected.
        </Disclaimer>
      </div>
    </AppShell>
  );
}
