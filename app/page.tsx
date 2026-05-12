import { MobileShell } from "components/layout/mobile-shell";
import { TodayScreen } from "components/today/today-screen";

export default function Home() {
  return (
    <MobileShell activeTab="Today">
      <TodayScreen />
    </MobileShell>
  );
}
