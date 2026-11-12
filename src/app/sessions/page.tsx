import { PageFrame } from "@/components/page-frame";
import { SessionsPage } from "@/components/sessions/sessions-page";

export default function Page() {
  return (
    <PageFrame title="Sessions" scope="+ conductor">
      <SessionsPage />
    </PageFrame>
  );
}
