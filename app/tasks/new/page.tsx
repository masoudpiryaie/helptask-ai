import { MobileShell } from "components/layout/mobile-shell";
import { AddTaskScreen } from "components/tasks/add-task-screen";

export default function NewTaskPage() {
  return (
    <MobileShell activeTab="Tasks">
      <AddTaskScreen />
    </MobileShell>
  );
}
