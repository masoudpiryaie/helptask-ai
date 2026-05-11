import { MobileShell } from "@/components/layout/mobile-shell";
import { PlanScreen } from "./plan-screen";

export default function PlanPage() {
  return (
    <MobileShell activeTab="Plan">
      <PlanScreen />
    </MobileShell>
  );
}
