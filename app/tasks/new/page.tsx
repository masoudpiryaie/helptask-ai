import { MobileShell } from "components/layout/mobile-shell";
import { AddTaskScreen } from "app/tasks/add-task-screen";

export default function NewTaskPage() {
  return (
    <MobileShell activeTab="Tasks">
      <AddTaskScreen />
    </MobileShell>
  );
}
