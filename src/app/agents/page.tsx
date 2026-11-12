import { PageFrame } from "@/components/page-frame";
import { AgentsBoard } from "@/components/agents/agents-board";

export default function Page() {
  return (
    <PageFrame title="Agents" scope="+ vault + conductor">
      <AgentsBoard />
    </PageFrame>
  );
}
