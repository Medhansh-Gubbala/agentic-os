import { PageFrame } from "@/components/page-frame";
import { WorkflowsBoard } from "@/components/workflows/workflows-board";

export default function Page() {
  return (
    <PageFrame title="Workflows" scope="+ registry">
      <WorkflowsBoard />
    </PageFrame>
  );
}
