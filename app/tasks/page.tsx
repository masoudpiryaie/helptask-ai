// import { MobileShell } from "components/layout/mobile-shell";
// import { TasksScreen } from "components/tasks/tasks-screen";

import { MobileShell } from "components/layout/mobile-shell";
import { TasksScreen } from "components/tasks/tasks-screen";

export default function TasksPage() {
  return (
    <MobileShell activeTab="Tasks">
      <TasksScreen />
    </MobileShell>
  );
}
