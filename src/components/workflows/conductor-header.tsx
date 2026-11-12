import { ConductorNode } from "@/components/ds";
import type { StatusResponse } from "./types";

// ponytail: workflows/routines/pending/unread counts dropped from this header —
// the bell in page-frame.tsx already surfaces pending approvals + unread briefings
// globally, and the kit's ConductorNode has no slot for the rest.
const compactTokens = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });

export function ConductorHeader({ status }: { status: StatusResponse | null }) {
  const active = status?.activeRuns ?? 0;
  return (
    <ConductorNode
      status={active > 0 ? "live" : "idle"}
      activeCount={active}
      tokensToday={status ? compactTokens.format(status.tokensToday) : undefined}
    />
  );
}
