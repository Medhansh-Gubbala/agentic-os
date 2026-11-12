export type LinearIssuePayload = {
  kind: "linear_issue";
  venture: string;
  title: string;
  description: string;
};

export type GmailDraftPayload = {
  kind: "gmail_draft";
  to: string;
  subject: string;
  body: string;
};

export type Proposal = {
  id: number;
  run_id: number | null;
  agent: string | null;
  venture: string | null;
  kind: "linear_issue" | "gmail_draft";
  payload: LinearIssuePayload | GmailDraftPayload;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  reason: string | null;
  result: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type LinearResult = { identifier: string; url: string };

export function parseLinearResult(result: string | null): LinearResult | null {
  if (!result) return null;
  try {
    return JSON.parse(result) as LinearResult;
  } catch {
    return null;
  }
}
