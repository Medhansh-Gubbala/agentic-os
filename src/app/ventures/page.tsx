import { PageFrame } from "@/components/page-frame";
import { VentureCard } from "@/components/venture-card";
import { listVentures } from "@/lib/vault";
import { linearConfigured, listProjects } from "@/lib/linear";
import { listActiveRuns } from "@/lib/db";
import { Panel } from "@/components/ds";

export const dynamic = "force-dynamic";

export default async function Ventures() {
  const ventures = listVentures();
  const configured = linearConfigured();
  const projects = configured ? await listProjects().catch(() => []) : [];
  const activeRuns = listActiveRuns();

  return (
    <PageFrame title="Ventures" scope="+ vault + linear">
      <Panel eyebrow={`Portfolio · ${ventures.length} ventures`} title="Ventures" style={{ maxWidth: 1392 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[...ventures.filter((v) => v.seeded), ...ventures.filter((v) => !v.seeded)].map((v) => (
            <VentureCard
              key={v.slug}
              venture={v}
              linear={projects.find((p) => p.name.toLowerCase() === v.slug.toLowerCase()) ?? null}
              linearConfigured={configured}
              running={activeRuns.some((r) => r.venture === v.slug)}
            />
          ))}
        </div>
      </Panel>
    </PageFrame>
  );
}
