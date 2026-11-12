import { listProposals, resolveProposal, type QueueRow } from "@/lib/db";
import { createIssue } from "@/lib/linear";

export function getProposal(id: number): QueueRow | undefined {
  // ponytail: queue table is small (approval-gated actions, not high volume);
  // a full scan beats adding a getProposal(id) query to db.ts for one caller.
  return listProposals().find((p) => p.id === id);
}

export async function executeProposal(id: number): Promise<void> {
  const proposal = getProposal(id);
  if (!proposal || proposal.status !== "approved") return;

  const payload = JSON.parse(proposal.payload);

  try {
    if (proposal.kind === "linear_issue") {
      const issue = await createIssue({
        title: payload.title,
        description: payload.description,
        ventureSlug: proposal.venture ?? payload.venture,
      });
      resolveProposal(
        id,
        "executed",
        undefined,
        JSON.stringify({ identifier: issue.identifier, url: issue.url }),
      );
    } else if (proposal.kind === "gmail_draft") {
      if (!process.env.GOOGLE_OAUTH_JSON) {
        resolveProposal(id, "failed", "google not configured — OAuth pending");
        return;
      }
      // ponytail: gmail client not built yet — once GOOGLE_OAUTH_JSON exists,
      // slot the real draft-creation call in here instead of this branch.
      resolveProposal(id, "failed", "google not configured — OAuth pending");
    }
  } catch (err) {
    resolveProposal(id, "failed", err instanceof Error ? err.message : String(err));
  }
}
