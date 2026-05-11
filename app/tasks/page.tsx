import { MobileShell } from "@/components/layout/mobile-shell";
import { TasksScreen } from "@/app/tasks/tasks-screen";

export default function TasksPage() {
  return (
    <MobileShell activeTab="Tasks">
      <TasksScreen />
    </MobileShell>
  );
}
