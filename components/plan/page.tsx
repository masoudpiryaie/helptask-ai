import { MobileShell } from "components/layout/mobile-shell";
import { PlanScreen } from "components/plan/plan-screen";

export default function PlanPage() {
  return (
    <MobileShell activeTab="Plan">
      <PlanScreen />
    </MobileShell>
  );
}
