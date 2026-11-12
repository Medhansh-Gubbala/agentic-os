import { PageFrame } from "@/components/page-frame";
import { MarketingBoard } from "@/components/marketing/marketing-board";

export default function Page() {
  return (
    <PageFrame title="Marketing" scope="+ vault notes">
      <MarketingBoard />
    </PageFrame>
  );
}
