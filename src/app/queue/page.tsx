import { PageFrame } from "@/components/page-frame";
import { QueueBoard } from "@/components/queue/queue-board";

export default function Page() {
  return (
    <PageFrame title="Queue" scope="+ linear + gmail">
      <QueueBoard />
    </PageFrame>
  );
}
