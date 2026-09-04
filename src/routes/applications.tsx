import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Building2, AlertTriangle, GitCompareArrows } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Disclaimer, DemoBadge } from "@/components/panel";
import agriculture from "@/assets/app-agriculture.jpg";
import urban from "@/assets/app-urban.jpg";
import disaster from "@/assets/app-disaster.jpg";
import scene from "@/assets/scene-sr.jpg";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — AI Satellite Super-Resolution" },
      {
        name: "description",
        content:
          "How super-resolved Sentinel-2 imagery supports agriculture monitoring, urban mapping, disaster assessment and change detection.",
      },
      { property: "og:title", content: "Applications — AI Satellite Super-Resolution" },
      {
        property: "og:description",
        content: "Agriculture, urban mapping, disaster assessment and change detection use cases.",
      },
    ],
  }),
  component: ApplicationsPage,
});

const APPS = [
  {
    id: "agriculture",
    title: "Agriculture Monitoring",
    icon: Sprout,
    image: agriculture,
    alt: "Farmland parcels seen from satellite",
    summary:
      "Resolve individual plot boundaries and intra-field variation that blur together at 10 m.",
    points: [
      "Small-holding parcel delineation for crop insurance and subsidy checks",
      "Early stress detection within a field rather than across a whole tile",
      "Irrigation channel and bund mapping at sub-plot scale",
    ],
  },
  {
    id: "urban",
    title: "Urban Mapping",
    icon: Building2,
    image: urban,
    alt: "Dense urban rooftops and streets from satellite",
    summary:
      "Recover building footprints, narrow lanes and informal settlement structure for planning.",
    points: [
      "Rooftop-level footprint extraction for property and utility planning",
      "Street network completion in dense or informal neighbourhoods",
      "Unauthorised construction screening between revisit cycles",
    ],
  },
  {
    id: "disaster",
    title: "Disaster Assessment",
    icon: AlertTriangle,
    image: disaster,
    alt: "Flooded terrain viewed from satellite",
    summary:
      "Sharper damage extents in the first hours after an event, when high-res tasking is not yet available.",
    points: [
      "Flood inundation edges around villages and roads",
      "Blocked-route identification for relief logistics",
      "Structure-level damage triage before ground survey",
    ],
  },
  {
    id: "change",
    title: "Change Detection",
    icon: GitCompareArrows,
    image: scene,
    alt: "Satellite scene used for change detection",
    summary:
      "Consistent super-resolution across dates makes small changes separable from sensor noise.",
    points: [
      "Encroachment and land-use conversion tracking",
      "Water body shrinkage and expansion over seasons",
      "Infrastructure progress monitoring between acquisitions",
    ],
  },
] as const;

function ApplicationsPage() {
  const [active, setActive] = useState<string>(APPS[0].id);
  const current = APPS.find((a) => a.id === active) ?? APPS[0];
  const Icon = current.icon;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Panel>
          <PanelTitle
            title="Where super-resolution changes the decision"
            sub="Select a domain to see what the extra spatial detail unlocks."
            right={<DemoBadge />}
          />
          <div className="flex flex-wrap gap-2">
            {APPS.map((a) => (
              <button
                key={a.id}
                onClick={() => setActive(a.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  a.id === active
                    ? "border-primary/40 bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <a.icon className="size-4" />
                {a.title}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={current.image}
                alt={current.alt}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Icon className="size-5 text-primary" />
                <h3 className="text-base font-semibold">{current.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{current.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {current.points.map((p) => (
                  <li
                    key={p}
                    className="rounded-lg border border-border bg-background/40 px-3 py-2"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Disclaimer>
            Imagery shown is illustrative. Operational use of AI-enhanced products should be paired
            with reference validation and the uncertainty view.
          </Disclaimer>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APPS.map((a) => (
            <Panel key={a.id}>
              <a.icon className="size-5 text-accent" />
              <h3 className="mt-3 text-sm font-semibold">{a.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.summary}</p>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
