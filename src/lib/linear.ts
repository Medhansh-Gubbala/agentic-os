const API = "https://api.linear.app/graphql";

export type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url: string;
  priority: number;
  updatedAt: string;
  state: { name: string; type: string };
};

export type LinearProject = {
  id: string;
  name: string;
  url: string;
  issues: LinearIssue[];
  counts: { open: number; completed: number; total: number };
};

export function linearConfigured(): boolean {
  return !!process.env.LINEAR_API_KEY;
}

async function gql<T>(query: string, variables?: object): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.LINEAR_API_KEY!,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Linear API ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Linear: ${json.errors[0]?.message}`);
  return json.data as T;
}

// ponytail: 60s in-memory cache; one user, one process
let cached: { at: number; projects: LinearProject[] } | null = null;

export async function listProjects(): Promise<LinearProject[]> {
  if (!linearConfigured()) return [];
  if (cached && Date.now() - cached.at < 60_000) return cached.projects;

  // Linear caps query complexity at 10k; nested projects->issues blows past it.
  // Two flat queries, joined here.
  const [projData, issueData] = await Promise.all([
    gql<{ projects: { nodes: { id: string; name: string; url: string }[] } }>(
      `{ projects(first: 50) { nodes { id name url } } }`,
    ),
    gql<{
      issues: { nodes: (LinearIssue & { project: { id: string } | null })[] };
    }>(`{
      issues(first: 250, filter: { project: { null: false } }) {
        nodes {
          id identifier title url priority updatedAt
          state { name type }
          project { id }
        }
      }
    }`),
  ]);

  const projects = projData.projects.nodes.map((p) => {
    const issues = issueData.issues.nodes.filter(
      (i) => i.project?.id === p.id,
    );
    const completed = issues.filter((i) =>
      ["completed", "canceled"].includes(i.state.type),
    ).length;
    return {
      id: p.id,
      name: p.name,
      url: p.url,
      issues,
      counts: {
        open: issues.length - completed,
        completed,
        total: issues.length,
      },
    };
  });
  cached = { at: Date.now(), projects };
  return projects;
}

export async function projectForVenture(
  slug: string,
): Promise<LinearProject | null> {
  const projects = await listProjects();
  return (
    projects.find((p) => p.name.toLowerCase() === slug.toLowerCase()) ?? null
  );
}

export async function createIssue({
  title,
  description,
  ventureSlug,
}: {
  title: string;
  description: string;
  ventureSlug: string;
}): Promise<{ id: string; identifier: string; url: string }> {
  const teamsData = await gql<{ teams: { nodes: { id: string; key: string; name: string }[] } }>(
    `{ teams(first: 10) { nodes { id key name } } }`,
  );
  // ponytail: this workspace has one team (key MED); take the first rather than
  // building team-selection UI for a single-team account.
  const team = teamsData.teams.nodes[0];
  if (!team) throw new Error("Linear: no team found");

  const project = await projectForVenture(ventureSlug);

  const data = await gql<{
    issueCreate: { success: boolean; issue: { id: string; identifier: string; url: string } };
  }>(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier url }
      }
    }`,
    {
      input: {
        teamId: team.id,
        title,
        description,
        ...(project ? { projectId: project.id } : {}),
      },
    },
  );
  return data.issueCreate.issue;
}
