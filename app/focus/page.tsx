import { MobileShell } from "components/layout/mobile-shell";
import { FocusScreen } from "./focus-screen";

export default function FocusPage() {
  return (
    <MobileShell activeTab="Focus">
      <FocusScreen />
    </MobileShell>
  );
}
