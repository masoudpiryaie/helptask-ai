import { MobileShell } from "components/layout/mobile-shell";
import { AccountScreen } from "./account-screen";

export default function AccountPage() {
  return (
    <MobileShell activeTab="Today">
      <AccountScreen />
    </MobileShell>
  );
}
