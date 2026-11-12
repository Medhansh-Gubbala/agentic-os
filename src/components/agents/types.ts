export type AgentInfo = {
  slug: string;
  name: string;
  description: string;
  /** "csuite" | "global" | a venture slug */
  source: string;
  tools: string[];
  model: string;
  writesCode: boolean;
  threadCount: number;
};

export type ThreadRow = {
  id: number;
  agent: string;
  venture: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: number;
  thread_id: number;
  role: "user" | "agent";
  content: string;
  run_id: number | null;
  created_at: string;
  proposalCount: number;
};

export type VentureLite = {
  slug: string;
  seeded: boolean;
};
