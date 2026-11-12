import { PageFrame } from "@/components/page-frame";
import { InboxBoard } from "@/components/inbox/inbox-board";

export default function Page() {
  return (
    <PageFrame title="Inbox" scope="+ routines">
      <InboxBoard />
    </PageFrame>
  );
}
