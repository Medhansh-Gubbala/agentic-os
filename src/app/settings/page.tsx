import { PageFrame } from "@/components/page-frame";
import { SettingsPage } from "@/components/settings/settings-page";

export default function Page() {
  return (
    <PageFrame title="Settings" scope="+ app db">
      <SettingsPage />
    </PageFrame>
  );
}
