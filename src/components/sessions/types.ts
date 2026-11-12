export type SessionRun = {
  id: number;
  workflow_id: number | null;
  kind: "workflow" | "chat" | "session";
  venture: string | null;
  prompt: string;
  status: "running" | "done" | "error" | "killed";
  started_at: string;
  finished_at: string | null;
  exit_code: number | null;
  result: string | null;
  session_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
  log_chars: number;
};
