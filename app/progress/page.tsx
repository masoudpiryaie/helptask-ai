import { MobileShell } from "@/components/layout/mobile-shell";
import { ProgressScreen } from "./progress-screen";

export default function ProgressPage() {
  return (
    <MobileShell activeTab="Progress">
      <ProgressScreen />
    </MobileShell>
  );
}
